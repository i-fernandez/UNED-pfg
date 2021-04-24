import Process from './process.js'

class SJFScheduler {
    constructor(stateManager) {
        // constantes
        this.TICK = 1;
        this.CONTEXT_SWITCH = 1;
        // variables
        this.stateManager = stateManager;
        this.time = 0;
        this.queue = [];
        this.processTable = [];
        this.contextSwitchCount = 0;
        this.inContextSwitch = false;
        this.journal = [];  
        this.running = '';
    }


    /* Añade un nuevo proceso en el sistema */
    addProcess(data) {
        let pr = new Process(
            this.processTable.length+1, data.execution, data.cpu_burst, data.io_burst);
        this.processTable.push(pr);
        this._enqueueProcess(pr);
    }

    /* Devuelve un JSON con los procesos de la tabla */
    getPTable() {
        return JSON.stringify(this.processTable.map(p => p.getData()), null, 1);
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

    /* Ejecuta la simulacion */
    runSimulation() {
        this._start();
        while (!(this._isFinished())) 
            this._nextTick();
    }

    /* Comienza la ejecución */
    _start() {
        this.journal.push('Inicio de la ejecucion.');
        let pr = this.queue.shift();
        this.running = pr;
        pr.p_state = 'running';
        this.journal.push(`Proceso ${pr.p_pid} cargado para ejecucion.`);
        this._sendState();
    }

    /* Ejecuta un tick de reloj */
    _nextTick() {
        this.time += this.TICK;
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

        // Comprueba si comienza cambio de contexto
        if (!(this.running) && this.queue.length > 0)
            this.inContextSwitch = true;

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

    /* Realiza un cambio de contexto */
    _swtch() {
        this.inContextSwitch = false;
        this.running = this.queue.shift();
        this.running.p_state = 'running';        
        this.contextSwitchCount++;
        this.journal.push(`Proceso ${this.running.p_pid} cargado para su ejecucion.`);
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
                    queue: this._getQueuePids()
                }
            }
            this.stateManager.pushState(JSON.stringify(state, null, 1));
            this.journal = [];
        }
    }

    _getQueuePids() {
        let d = [];
        this.queue.forEach(pr => d.push(pr.p_pid));
        return d;
    }

    _enqueueProcess(pr) {
        this.queue.push(pr);
        this.queue.sort(function (a, b) {
            if (a.cpu_burst > b.cpu_burst)
                return 1;
            if (a.cpu_burst < b.cpu_burst)
                return -1;
            return 0;
        });
    }

}

export default SJFScheduler;