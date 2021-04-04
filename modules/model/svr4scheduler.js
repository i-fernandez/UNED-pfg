import PriorityQueue from './priorityqueue.js'
import Svr4Process from './svr4process.js'

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

    /* Añade la cola correspondiente al dqactmap si no existe ya y la ordena */
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
    _start() {
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

    /* Ejecuta la simulacion */
    runSimulation() {
        this._start();
        while (!(this._isFinished())) 
            this._nextTick();
    }

    /* Ejecuta un tick de reloj */
    _nextTick() {
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
    _isFinished() {
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
        if (this._isFinished())
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


export default Svr4Scheduler;