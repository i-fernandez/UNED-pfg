import PriorityQueue from './priorityqueue.js'
import Svr3Process from './svr3process.js'


class Svr3Scheduler {
    constructor(stateManager) {
        // constantes
        this.QUANTUM = 100;
        this.SCHED = 1000;
        this.CONTEXT_SWITCH = 10;
        this.TICK = 10;
        // variables
        this.stateManager = stateManager;
        this.time = 0;
        this.whichqs = [];
        this.qs = [];
        this.processTable = [];
        this.runrun = false;
        this.nextRoundRobin = this.QUANTUM;
        this.contextSwitchCount = 0;
        this.inContextSwitch = false;
        this.inRoundRobin = false;
        this.journal = [];  
        this.running = '';
    }

    /* Añade un nuevo proceso en el sistema */
    addProcess(data) {
        let pr = new Svr3Process(
            this.processTable.length+1, data.execution, data.cpu_burst, data.io_burst, data.pri);
        this.processTable.push(pr);
        this._enqueueProcess(pr);

    }

    /* Añade un proceso a la cola, modifica qs y whichqs (y los ordena) */
    _enqueueProcess(process) {
        let qn = Math.floor(process.p_pri / 4);
        if (!(this.whichqs.includes(qn))) {
            this.whichqs.push(qn);
        }
        this.whichqs.sort(function(a, b) { return a - b;});
        let queue = this.qs.find(item => item.priority == qn);
        if (queue)
            queue.enqueue(process);
        else
            this.qs.push(new PriorityQueue(qn, process));
        this.qs.sort(function (a, b) {
            if (a.priority > b.priority)
                return 1;
            if (a.priority < b.priority)
                return -1;
            return 0;
        });
    }

    /* Elige un proceso para ser planificado y lo desencola */
    _dequeueProcess() {
        let qn = this.whichqs[0];
        let queue = this.qs.find(item => item.priority == qn);
        if (queue) {
            let pr = queue.dequeue();
            if (queue.isEmpty()) {
                this.whichqs.shift();
                this.qs.shift();
            }
            return pr;
        }
    }

    /* Muestra el proximo proceso para ejecutarse, sin desencolarlo */
    _getNextProcess() {
        let queue = this.qs.find(item => item.priority == this.whichqs[0]);
        if (queue) {
            return queue.front();
        }
    }

    /* Devuelve un JSON con los procesos de la tabla */
    getPTable() {
        return JSON.stringify(this.processTable.map(p => p.getData()), null, 1);
    }
    
    /* Ejecuta la simulacion */
    runSimulation() {
        this._start();
        while (!(this._isFinished())) 
            this._nextTick();
    }

    /* Comienza la ejecución */
    _start() {
        this.journal.push('Inicio de la ejecucion.');
        let pr = this._dequeueProcess();
        this.running = pr;
        pr.p_state = 'running_user';
        this.journal.push(`Proceso ${pr.p_pid} cargado para ejecucion.`);
        this._sendState();
    }

    /* Ejecuta un tick de reloj */
    _nextTick() {
        this.time += this.TICK;
        this.nextRoundRobin -= this.TICK;
        let sleeping_pr  = this.processTable.filter(pr => pr.p_state == 'sleeping');

        // Actualiza los procesos
        this.processTable.forEach (pr => {
            let out = pr.runTick(this.TICK, this.time);
            if (out)
                this.journal.push(out);
        });

        // Actualiza el proceso en ejecucion
        if (this.running.p_state != 'running_user' && this.running.p_state != 'running_kernel')
            this.running = '';
        
        // Finaliza el cambio de contexto
        if (this.inContextSwitch)
            this._swtch();

        // Encola procesos que finalizaron IO
        sleeping_pr.forEach(pr => {
            if (pr.p_state != 'sleeping')
                this._enqueueProcess(pr);
        });
        
        if (this.time % this.SCHED == 0)
            // Ocurre schedCPU;
            this._schedCPU();
        else if (this.time % 40 == 0 && this.running) 
            // Recalcula prioridad del proceso en ejecucion
            this.journal.push(this.running.calcPriority());
        else if (this.nextRoundRobin == 0) 
            // Cuanto finalizado, comprueba round robin
            this._roundRobin();
        
        // Comprueba si empieza un cambio de contexto
        this._startSwtch();
        
        // Envia el estado
        this._sendState();
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
            n_proc: n_proc,
            t_time: this.time,
            wait: Math.floor(t_wait / n_proc),
            cswitch: this.contextSwitchCount,
            chart: {
                pids: pids,
                time: tiempos
            }
        }
        return JSON.stringify(data, null, 1);
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
            let state = {
                pt_info: this.processTable[0].getInfo(),
                state: {
                    time: this.time, 
                    journal: this.journal, 
                    pTable: notFinished.map(p => p.getFullData()),
                    qs: this.qs.map(q => q.getData()),
                    whichqs: Array.from(this.whichqs),
                    runrun: this.runrun
                }
            }
            this.stateManager.pushState(JSON.stringify(state, null, 1));
            this.journal = [];
        }
    }

    /* Comprueba si comienza un cambio de contexto */
    _startSwtch() {
        let n = this._getNextProcess();

        // No hay ningun proceso en ejecucion 
        if (!(this.running) && this.whichqs.length > 0) {
            this.journal.push(`Rutina swtch selecciona proceso ${n.p_pid} para su ejecición.`);
            this.inContextSwitch = true;
        } 
        // Proceso encolado con mayor prioridad
        else if (this.running && this.whichqs[0] < Math.floor(this.running.p_pri/4)) {
            if (this.running.p_state == 'running_kernel') {
                // Proceso con llamada al sistema
                this.runrun = true;
                this.journal.push(`Proceso ${n.p_pid} encolado con mayor prioridad. 
                    Esperando finalizacion de llamada al sistema.`)
            } else {
                this.journal.push(`CPU expropiada debido a proceso ${n.p_pid}. 
                    Comienza cambio de contexto.`);
                this._preempt();
            }
        }
        // Round robin
        else if (this.inRoundRobin) {
            this.journal.push(`CPU expropiada por proceso ${n.p_pid} debido a 
                rutina roundrobin. Comienza cambio de contexto.`);
            this.inRoundRobin = false;
            this._preempt();
        }
    }

    /* Realiza la expropiacion del proceso en ejecucion */
    _preempt() {
        this.inContextSwitch = true;
        this.running.p_state = 'ready';
        this._enqueueProcess(this.running);
        this.running = ''; 
    }

    /* Realiza un cambio de contexto */
    _swtch() {
        this.runrun = false;
        this.inContextSwitch = false;
        // Proximo proceso a ejecutar
        let next_pr = this._dequeueProcess();
        if (next_pr == null) 
            return;
        
        this.contextSwitchCount++;
        if (next_pr.p_pri < 50)
            next_pr.p_state = 'running_kernel';
        else
            next_pr.p_state = 'running_user';
        this.running = next_pr;
        this.nextRoundRobin = this.QUANTUM;
        this.journal.push(`Proceso ${next_pr.p_pid} cargado para su ejecucion.`);
    }

    /* Aplica decay y recalcula prioridades para cada proceso */
    _schedCPU() {
        this.journal.push('Iniciada rutina schedcpu');
        let procesos = this.processTable.filter(
            pr => (pr.p_state != 'zombie' && pr.p_state != 'finished'));
        procesos.forEach (pr => {
            pr.decay();
            // Desencola el proceso
            if (pr.p_state == 'ready') {
                let qn = Math.floor(pr.p_pri / 4);
                let queue = this.qs.find(item => item.priority == qn);
                if (queue) {
                    queue.remove(pr);
                    if (queue.isEmpty()) {
                        let i = this.whichqs.indexOf(qn);
                        this.whichqs.splice(i, 1);
                        this.qs.splice(i, 1);
                    }
                }
            }
            // Recalcula prioridad
            this.journal.push(pr.calcPriority());
            // Encola el proceso
            if (pr.p_state == 'ready') 
                this._enqueueProcess(pr);
        });
    }

    /* Comprueba si round robin produce cambio de contexto */
    _roundRobin() {
        if (this.running && this.whichqs[0] == Math.floor(this.running.p_pri/4)) 
            this.inRoundRobin = true;
    }
}



export default Svr3Scheduler;