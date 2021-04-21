import PriorityQueue from './priorityqueue.js'
import Process from './process.js'

class RRScheduler {
    constructor(stateManager) {
        // constantes
        this.TICK = 1;
        this.QUANTUM = 50;     
        this.CONTEXT_SWITCH = 1;
        // variables
        this.name = 'RR';
        this.stateManager = stateManager;
        this.time = 0;
        this.queue = new PriorityQueue(0);
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
            this.processTable.length+1, data.execution, data.cpu_burst, data.io_burst);
        this.processTable.push(pr);
        this.queue.enqueue(pr);
    }
    
    /* Devuelve un JSON con los procesos de la tabla */
    getPTable() {
        return JSON.stringify(this.processTable.map(p => p.getData()));
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

    /* Ejecuta la simulacion */
    runSimulation() {
        this._start();
        while (!(this._isFinished())) 
            this._nextTick();
    }

    /* Comienza la ejecución */
    _start() {
        this.journal.push('Inicio de la ejecucion.');
        let pr = this.queue.dequeue();
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
                this.queue.enqueue(pr);
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
        // No hay ningun proceso en ejecucion 
        if (!(this.running) && !(this.queue.isEmpty())) {
            this.inContextSwitch = true;
        } 
        // Cuanto finalizado
        else if (this.running && this.quantumLeft <= 0) {
            this.journal.push(`Cuanto del proceso ${this.running.p_pid} finalizado.`);
            this.inContextSwitch = true;
            this.running.p_state = 'ready';
            this.queue.enqueue(this.running);
            this.running = '';
        }
    }

    /* Realiza un cambio de contexto */
    _swtch() {
        this.inContextSwitch = false;
        this.quantumLeft = this.QUANTUM;
        this.running = this.queue.dequeue();
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
                    queue: this.queue.getData(),
                    q_left: this.quantumLeft
                }
            }
            this.stateManager.pushState(JSON.stringify(state));
            this.journal = [];
        }
    }

}

export default RRScheduler;