import PriorityQueue from './priorityqueue.js'
import Svr4RT from './srv4RT.js'
import Svr4TS from './svr4TS.js'

class Svr4Scheduler {
    constructor(stateManager) {
        // constantes
        this.CONTEXT_SWITCH = 10;
        this.TICK = 10;
        // variables
        this.name = 'SVR4';
        this.stateManager = stateManager;
        this.time = 0;
        this.dqactmap = [];
        this.dispq = [];
        this.processTable = [];
        this.runrun = false;
        this.kprunrun = false;
        this.contextSwitchCount = 0;
        this.inContextSwitch = false;
        this.inRoundRobin = false;
        this.journal = [];
        this.running = '';
    }

    /* Añade un nuevo proceso en el sistema */
    addProcess(data) {
        let pr = new Svr4Process(
            this, this.processTable.length+1, data.execution, data.cpu_burst, 
            data.io_burst, data.pClass, data.pri
        );
        this.processTable.push(pr);
        this.setBackDQ(pr);
    }

    /* Añade un proceso al inicio de la cola (proceso expropiado) */
    _setFrontDQ(process) {
        let qn = process.p_pri;
        this._setDqactmap(qn);
        let queue = this.dispq.find(item => item.priority == qn);
        if (queue)
            queue.addFront(process);
        else
            this.dispq.push(new PriorityQueue(qn, process));

        this._sortDispq();
    }

    /* Añade un proceso al final de la cola (nuevo proceso) */
    setBackDQ(process) {
        let qn = process.p_pri;
        this._setDqactmap(qn);
        let queue = this.dispq.find(item => item.priority == qn);
        if (queue)
            queue.enqueue(process);
        else
            this.dispq.push(new PriorityQueue(qn, process));

        this._sortDispq();
    }

    _setDqactmap(qn) {
        if (!(this.dqactmap.includes(qn))) {
            this.dqactmap.push(qn);
        }
        this.dqactmap.sort(function(a, b) { return a - b;});
    }

    /* Ordena el array disqp */
    _sortDispq () {
        this.dispq.sort(function (a, b) {
            if (a.priority > b.priority)
                return 1;
            if (a.priority < b.priority)
                return -1;
            return 0;
        });
    }

    /* Elige un proceso para ser planificado y lo desencola */
    dequeueProcess() {
        let qn = this.dqactmap[this.dqactmap.length-1];
        let queue = this.dispq.find(item => item.priority == qn);
        if (queue) {
            let pr = queue.dequeue();
            if (queue.isEmpty()) {
                this.dqactmap.pop();
                this.dispq.pop();
            }
            return pr;
        }
    }

    /* Muestra el proximo proceso para ejecutarse, sin desencolarlo */
    _getNextProcess() {
        let queue = this.dispq.find(item => item.priority == this.dqactmap[this.dqactmap.length-1]);
        if (queue) {
            return queue.front();
        }
    }

    /* Comienza la ejecución */
    start() {
        this.journal.push('Inicio de la ejecucion');
        let pr = this.dequeueProcess();
        this.running = pr;
        pr.startRun();
        this.journal.push(`Proceso ${pr.p_pid} cargado para ejecucion.`);
        this._sendState();
    }

    /* Devuelve un JSON con los procesos de la tabla */
    getPTable() {
        return JSON.stringify(this.processTable.map(p => p.getData()));
    }

    /* Ejecuta un tick de reloj */
    nextTick() {
        this.time += this.TICK;
        let sleeping_pr  = this.processTable.filter(pr => pr.p_state == 'sleeping');

        // Actualiza los procesos
        this.processTable.forEach (pr => {
            let out = pr.runTick();
            if (out)
                this.journal.push(out);
        });
        // Actualiza el proceso en ejecucion
        if (this.running.p_state != 'running_user' && this.running.p_state != 'running_kernel')
            this.running = '';  

        if (this.inContextSwitch)
            // Finaliza el cambio de contexto
            this._swtch();

        // Encola procesos que finalizaron IO
        sleeping_pr.forEach(pr => {
            if (pr.p_state != 'sleeping') 
                this.setBackDQ(pr);
        });
                    
        // Comprueba si empieza un cambio de contexto
        this._startSwtch();

        this._sendState();

    }

    _swtch() {
        this.runrun = false;
        this.kprunrun = false;
        this.inContextSwitch = false;
        // Proximo proceso a ejecutar
        let next_pr = this.dequeueProcess();
        if (next_pr == null) 
            return;
        
        this.contextSwitchCount++;
        next_pr.startRun();
        this.running = next_pr;
        this.journal.push(`Proceso ${next_pr.p_pid} cargado para ejecucion.`);
    }

    /* Comprueba si comienza un cambio de contexto */
    _startSwtch() {
        let n = this._getNextProcess();
        // No hay ningun proceso en ejecucion 
        if (!(this.running) && this.dqactmap.length > 0) {
            this.journal.push(`Rutina swtch selecciona al proceso ${n.p_pid} para su ejecución.`);
            this.inContextSwitch = true;
        }
        else if (this.running && this.dqactmap[this.dqactmap.length-1] >this.running.p_pri){
            if (this.running.p_state == 'running_kernel') {
                // Proceso con llamada al sistema
                this.runrun = true;
                this.journal.push(`Proceso ${n.p_pid} encolado con mayor prioridad.
                    Esperando finalizacion de llamada al sistema.`)
            } else {
                this.journal.push(`CPU expropiada debido a proceso  
                    ${this.dispq[this.dispq.length-1].front().p_pid}`);
                this.inContextSwitch = true;
                this.running.p_state = 'ready';
                this._setFrontDQ(this.running);
            }
        }    
        // Round robin
        else if (this.inRoundRobin) {
            this.journal.push('CPU expropiada debido a rutina roundrobin. ');
            this.inRoundRobin = false;
            this.inContextSwitch = true;
            this.running.p_state = 'ready';
            this.setBackDQ(this.running);
        }
    }

    /* Comprueba si round robin produce un cambio de contexto */
    roundRobin() {
        if (this.dqactmap.find(item => item == this.running.p_pri))
            this.inRoundRobin = true;
        else
            this.running.resetQuantum();
    }

    /* Comprueba si ha finalizado la ejecucion */
    isFinished() {
        // GUARDA
        if (this.time > 50000) {
            console.log('Alcanzado tiempo máximo de ejecución');
            return true;
        }

        let procesos = this.processTable.filter(pr => pr.p_state != 'finished');
        return (procesos.length === 0);
    }

    /* Devuelve el resumen de ejecución */
    getSummary() {
        let n_proc = this.processTable.length;
        let t_wait = 0;
        this.processTable.forEach(pr => t_wait += pr.wait_time);
        // Grafica
        let pids = [];
        let tiempos = [];
        this.processTable.forEach(pr => {
            pids.push(pr.p_pid);
            tiempos.push(pr.getSummaryData());
        });
        let data = { 
            tick: this.TICK,
            cs_duration: this.CONTEXT_SWITCH,
            n_proc : n_proc,
            t_time : this.time,
            wait : Math.floor(t_wait / n_proc),
            cswitch : this.contextSwitchCount,
            chart: {
                pids: pids,
                time: tiempos
            }
        }
        return JSON.stringify(data);
    }

    /* Envía un estado */
    _sendState() {
        // Datos de progreso
        let timeData = this.processTable.map(p => p.getStateNumber());
        timeData.unshift(this.time);
        this.stateManager.pushTime(timeData);

        // Estado
        if (this.isFinished())
            this.journal.push('Ejecución finalizada.');

        if (this.journal.length > 0) {
            let notFinished = this.processTable.filter(pr => pr.p_state != 'finished');
            let rtProc = notFinished.filter(pr => pr.class.name == 'RealTime');
            let tsProc = notFinished.filter(pr => pr.class.name == 'TimeSharing');
            let rt_info = '';
            let ts_info = '';

            if (rtProc.length > 0)
                rt_info = rtProc[0].getClassInfo();
            if (tsProc.length > 0)
                ts_info = tsProc[0].getClassInfo();

            let state = {
                name: this.name,
                pt_info: this.processTable[0].getInfo(),
                rt_info: rt_info,
                ts_info: ts_info,
                state: {
                    time: this.time, 
                    journal: this.journal, 
                    pTable: notFinished.map(p => p.getFullData()),
                    dispq: this.dispq.map(q => q.getData()),
                    dqactmap: Array.from(this.dqactmap),
                    runrun: this.runrun,
                    kprunrun: this.kprunrun,
                    rt_data: rtProc.map(p => p.getClassData()),
                    ts_data: tsProc.map(p => p.getClassData())
                }
            }
            this.stateManager.pushState(JSON.stringify(state));
            this.journal = [];
        }
    }
}


class Svr4Process {
    constructor(sched, pid, execution, cpu_burst, io_burst, pClass, pri) {
        this.sched = sched;
        this.p_pid = pid;
        this.p_state = 'ready';
        this.p_pri = pri;
        this.execution = execution;
        this.cpu_burst = cpu_burst;
        this.io_burst = io_burst;
        this.current_cycle_time = 0;
        this.wait_time = 0;
        this.run_usr = 0;
        this.run_ker = 0;
        this.finish_time = 0;    // tiempo de finalización  
        this.kernelCount = 0;    // numero de Ticks en modo nucleo
        this.class = (pClass == 'RealTime') ? new Svr4RT(this) : new Svr4TS(this);
    }

    /* Ejecuta un tick de reloj */
    runTick() {
        let text = '';
        switch (this.p_state) {
            case 'running_kernel':
                text += this._tick_kernel();
            case 'running_user':
                text += this._tick_user();       
                break;
            case 'sleeping':
                text += this._tick_sleep();
                break;
            case 'ready':
                this.wait_time += this.sched.TICK;
                break;
            case 'zombie':
                this.p_state = 'finished';
                break;
            default:
                break;
        }
        return text;
    }

    /* Inicia la ejecución del proceso */
    startRun() {
        if (this.kernelCount  > 0)
            this.p_state = 'running_kernel';
        else
            this.p_state = 'running_user';

        this.roundRobin = false;
        this.resetQuantum();
    }

    /* Reinicia el cuanto asociado */
    resetQuantum() {
        this.class.resetQuantum();
    }

    /* Datos de la pantalla añadir proceso */
    getData() {
        return {
            p_pid: this.p_pid,
            p_pri: this.p_pri,
            class: this.class.name,
            execution: this.execution,
            cpu_burst: this.cpu_burst,
            io_burst: this.io_burst
        };
    }

    /* Datos para visualizacion de estados */
    getFullData() {
        return {
            p_pid: this.p_pid,
            p_state: this.p_state,
            p_pri: this.p_pri,
            class: this.class.name,
            execution: this.execution,
            cpu_burst: this.cpu_burst,
            io_burst: this.io_burst,
            wait_time: this.wait_time
        };
    }

    /* Devuelve la informacion de los campos */
    getInfo() {
        return {
            p_pid: 'PID del proceso',
            p_state: 'Estado actual',
            p_pri: 'Prioridad actual',
            class: 'Clase del proceso',
            execution: 'Tiempo restante hasta finalización',
            cpu_burst: 'Duración del ciclo de CPU',
            io_burst: 'Duración del ciclo de IO',
            wait_time: 'Tiempo de espera acumulado'  
        };
    }

    /* Devuelve la información de los campos de cada clase */
    getClassInfo() {
        return this.class.getInfo();
    }

    /* Devuelve los datos para la vista resumen */
    getSummaryData() {
        return [this.wait_time, this.run_usr-this.run_ker, this.run_ker];
    }

    /* Devuelve los datos pertenecientes a la clase */
    getClassData() {
        return this.class.getData();
    }

    /* Devuelve la representacion numerica del estado */
    getStateNumber() {
        switch (this.p_state) {
            case 'running_kernel':
                return 5;
            case 'running_user':
                return 4;
            case 'ready':
                return 3;
            case 'sleeping':
                return 2;
            case 'zombie':
                return 1;
            case 'finished':
                return 0;
            default:
                return -1;
        }
    }

    /* Ejecuta un tick en modo running_kernel */
    _tick_kernel() {
        this.run_ker += this.sched.TICK;
        if (this.kernelCount > 1) {
            this.kernelCount--;
        }
        else {
            this.kernelCount = 2;
            this.p_state = 'running_user';
            this.class.fromSysCall();
            return `Proceso ${this.p_pid} finaliza llamada al sistema. `;
        }
        return '';
    }

    /* Ejecuta un tick en modo running_user */
    _tick_user() {
        this.run_usr += this.sched.TICK;
        if (this.execution <= this.sched.TICK) {
            // finalizada ejecucion
            this.execution = 0;
            this.p_state = 'zombie';
            return `Proceso ${this.p_pid} finalizado en ${this.sched.time} ut. `;
        } else {
            this.execution -= this.sched.TICK;
            this.current_cycle_time += this.sched.TICK;
            return this.class.tick_user();
        }
    }

    /* Ejecuta un tick en modo sleeping */
    _tick_sleep() {
        this.current_cycle_time += this.sched.TICK;
        if (this.current_cycle_time >= this.io_burst) {
            this.p_state = 'ready';
            this.current_cycle_time = 0;
            return this.class.fromSleep();
        }
        return '';
    } 
}


export default Svr4Scheduler;