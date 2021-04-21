import PriorityQueue from './priorityqueue.js'
import Process from './process.js'

class PRIScheduler {
    constructor(stateManager) {
        // constantes
        this.QUANTUM = 50;
        this.TICK = 1;
        this.CONTEXT_SWITCH = 1;
        // variables
        this.name = 'PRI';
        this.stateManager = stateManager;
        this.time = 0;
        this.qs = [];
        this.quantumLeft = this.QUANTUM;
        this.processTable = [];
        this.contextSwitchCount = 0;
        this.inContextSwitch = false;
        this.journal = [];  
        this.running = '';
    }


    /* Añade un nuevo proceso en el sistema */
    addProcess(data) {
        let pr = new Process(
            this.processTable.length+1, data.execution, data.cpu_burst, data.io_burst, data.pri);
        this.processTable.push(pr);
        this._enqueueProcess(pr);
    }

    /* Devuelve un JSON con los procesos de la tabla */
    getPTable() {
        return JSON.stringify(this.processTable.map(p => p.getData()));
    }

    /* Añade un proceso a la cola, modifica qs y whichqs (y los ordena) */
    _enqueueProcess(process) {
        let queue = this.qs.find(item => item.priority == process.p_pri);
        if (queue)
            queue.enqueue(process);
        else
            this.qs.push(new PriorityQueue(process.p_pri, process));
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
        let queue = this.qs[0];
        if (queue) {
            let pr  = queue.dequeue();
            if (queue.isEmpty())
                this.qs.shift();
            return pr;
        }
    }

    /* Muestra el proximo proceso para ejecutarse, sin desencolarlo */
    _getNextProcess() {
        let queue = this.qs[0];
        if (queue) {
            return queue.front();
        }
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
        pr.p_state = 'running';
        this.journal.push(`Proceso ${pr.p_pid} cargado para ejecucion.`);
        this._sendState();
    }

    /* Ejecuta un tick de reloj */
    _nextTick() {
        this.time += this.TICK;
        if (this.running)
            this.quantumLeft -= this.TICK;
        let sleeping_pr  = this.processTable.filter(pr => pr.p_state == 'sleeping');

        // Actualiza los procesos
        this.processTable.forEach (pr => {
            let out = pr.runTick(this.TICK, this.time);
            if (out)
                this.journal.push(out);
        });
        // Actualiza el proceso en ejecucion
        if (this.running.p_state != 'running')
            this.running = '';
        
        // Finaliza el cambio de contexto
        if (this.inContextSwitch)    
            this._swtch();

        // Encola procesos que finalizaron IO
        sleeping_pr.forEach(pr => {
            if (pr.p_state != 'sleeping')
                this._enqueueProcess(pr);
        });
                
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

    /* Comprueba si comienza un cambio de contexto */
    _startSwtch() {
        let n = this._getNextProcess();        
        if (this.qs.length > 0) {
            // No hay ningun proceso en ejecucion 
            if (!(this.running)) {
                this.journal.push(`Seleccionado el proceso ${n.p_pid} para su ejecición.`);
                this.inContextSwitch = true;
            }
            // Proceso encolado con mayor prioridad
            else if (this.running && this.qs[0].priority < this.running.p_pri) {
                this.journal.push(`CPU expropiada debido a proceso ${n.p_pid}. 
                    Comienza cambio de contexto.`);
                this._preempt();
            }
            // Round robin
            else if (this.running && this.quantumLeft <= 0 && this.qs[0].priority == this.running.p_pri) {
                this.journal.push(`Cuanto del proceso ${this.running.p_pid} finalizado.`);
                this._preempt();
            }
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
        this.inContextSwitch = false;
        this.quantumLeft = this.QUANTUM;
        this.running = this._dequeueProcess();
        this.running.p_state = 'running';        
        this.contextSwitchCount++;
        this.journal.push(`Proceso ${this.running.p_pid} cargado para su ejecucion.`);
    }


    /* Envía un estado */
    _sendState() {
        // Datos de progreso
        let timeData = this.processTable.map(p => p.getStateNumber());
        timeData.unshift(this.time);
        //timeData.unshift(this.name);
        this.stateManager.pushTime(timeData);

        // Estado
        if (this._isFinished())
            this.journal.push('Ejecución finalizada.');

        if (this.journal.length > 0) {
            let notFinished = this.processTable.filter(pr => pr.p_state != 'finished');
            let state = {
                //name: this.name,
                pt_info: this.processTable[0].getInfo(),
                state: {
                    time: this.time, 
                    journal: this.journal, 
                    pTable: notFinished.map(p => p.getFullData()),
                    qs: this.qs.map(q => q.getData()),
                    q_left: this.quantumLeft
                }
            }
            this.stateManager.pushState(JSON.stringify(state));
            this.journal = [];
        }
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
            //name: this.name,
            quantum: this.QUANTUM,
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
        return JSON.stringify(data);
    }
}

export default PRIScheduler;