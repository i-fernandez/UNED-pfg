import PriorityQueue from './priorityqueue.js'
import Svr4RT from './srv4RT.js'
import Svr4TS from './svr4TS.js'

class Svr4Scheduler {
    constructor(stateManager) {
        // constantes
        this.CONTEXT_SWITCH = 10;
        this.TICK = 10;

        this.name = "SVR4";
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

        /* BORRAR */
        this.count = 0;
    }

    addProcess(data) {
        let pr = new Svr4Process(
            this.processTable.length+1, data.burst, data.cpu_burst, data.io_burst, data.pClass, data.pri
        );
        this.processTable.push(pr);
        this._setBackDQ(pr);
    }

    // Añade un proceso al inicio de la cola (proceso expropiado)
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

    // Añade un proceso al final de la cola (nuevo proceso)
    _setBackDQ(process) {
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

    // Ordena el array disqp
    _sortDispq () {
        this.dispq.sort(function (a, b) {
            if (a.priority > b.priority)
                return 1;
            if (a.priority < b.priority)
                return -1;
            return 0;
        });
    }




    // Elige un proceso para ser planificado y lo desencola
    _dequeueProcess() {
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

    start() {
        this.journal.push("Inicio de la ejecucion");
        let pr = this._dequeueProcess();
        //pr.p_state = "running_user";
        pr.startRun();
        this.journal.push("Proceso " + pr.p_pid + " seleccionado para ejecucion");
        this._sendState();
    }

    getPTable() {
        let pTable = [];
        this.processTable.forEach(pr => {pTable.push(pr.getData());});
        return pTable;
    }

    nextTick() {
        /* BORRAR */
        //this.count++;

        this.time += this.TICK;
        let sleeping_pr  = this.processTable.filter(pr => pr.p_state == "sleeping");

        // Actualiza los procesos
        this.processTable.forEach (pr => {
            let out = pr.runTick(this.TICK, this.time);
            if (out)
                this.journal.push(out);
        });

        // Encola procesos que finalizaron IO
        sleeping_pr.forEach(pr => {
            if (pr.p_state != "sleeping") 
                this._setBackDQ(pr);
        });

        if (this.inContextSwitch) 
            this._swtch();
        else
            this._roundRobin();
            
        // Comprueba si empieza un cambio de contexto
        this._startSwtch();

        this._sendState();

    }

    _swtch() {
        this.runrun = false;
        this.kprunrun = false;
        this.inContextSwitch = false;
        // Proximo proceso a ejecutar
        let next_pr = this._dequeueProcess();
        if (next_pr == null) 
            return;
        
        this.contextSwitchCount++;
        //next_pr.p_state = "running_user";
        next_pr.startRun();
        this.journal.push("Proceso " + next_pr.p_pid + " Seleccionado para ejecucion");
    }

    _startSwtch() {
        let running = this._getRunningProcess();
        // No hay ningun proceso en ejecucion 
        if (typeof running === 'undefined' && this.dqactmap.length > 0) {
            this.journal.push("Ningun proceso en ejecucion - llamada a rutina swtch");
            this.inContextSwitch = true;
        }
        // Proceso encolado con mayor prioridad y actual no esta en modo kernel
        else if (typeof running !== 'undefined' && 
            this.dqactmap[this.dqactmap.length-1] > running.p_pri &&
            running.p_state != "running_kernel") {

            this.journal.push("CPU expropiada debido a proceso " + 
                this.dispq[this.dispq.length-1].front().p_pid);
            this.inContextSwitch = true;
            running.p_state = "ready";
            this._setFrontDQ(running);
        }
        // Round robin
        else if (this.inRoundRobin) {
            this.journal.push("CPU expropiada debido a rutina roundrobin");
            this.inRoundRobin = false;
            this.inContextSwitch = true;
            running.p_state = "ready";
            this._setBackDQ(running);
        }
    }

    // Comprueba si round robin produce un cambio de contexto
    _roundRobin() {
        let running = this._getRunningProcess();
        if (typeof running !== 'undefined' && running.roundRobin){
            if (this.dqactmap.find(item => item == running.p_pri))
                this.inRoundRobin = true;
            else
                running.resetQuantum();
        }

    }

    isFinished() {
        /* BORRAR */
        //if (this.count >= 100) return true;

        let procesos = this.processTable.filter(pr => pr.p_state != "finished");
        return (procesos.length === 0);
    }

    getSummary() {
        let n_proc = this.processTable.length;
        let t_wait = 0;
        this.processTable.forEach(pr => t_wait += pr.wait_time);
        let table = [];
        this.processTable.forEach(pr => {table.push(pr.getSummaryData())});

        return {
            n_proc : n_proc,
            t_time : this.time,
            wait : Math.floor(t_wait / n_proc),
            cswitch : this.contextSwitchCount,
            data: table
        }
    }

    _sendState() {
        if (this.isFinished())
            this.journal.push("Ejecución finalizada.");

        if (this.journal.length > 0) {
            let pTable = [];
            let notFinished = this.processTable.filter(pr => pr.p_state != "finished");
            notFinished.forEach(pr => {
                pTable.push(pr.getFullData());
            });

            let _dispq = [];
            this.dispq.forEach(q => {_dispq.push(q.getData());});

            // Datos de la clase
            let rt = [];
            let ts = [];
            notFinished.filter(pr => pr.class.name == "RealTime").forEach(pr => {
                rt.push(pr.getClassData());
            });
            notFinished.filter(pr => pr.class.name == "TimeSharing").forEach(pr => {
                ts.push(pr.getClassData());
            });

            this.stateManager.pushState({
                name: this.name,
                state: {
                    time: this.time, 
                    journal: this.journal, 
                    pTable: pTable,
                    dispq: _dispq,
                    dqactmap: Array.from(this.dqactmap),
                    runrun: this.runrun,
                    kprunrun: this.kprunrun
                },
                rt_data: {rt},
                ts_data: {ts}
            });
            this.journal = [];
        }
    }

    _getRunningProcess() {
        return this.processTable.filter(pr => pr.p_state.indexOf("running") != -1)[0];
    }
}


class Svr4Process {
    constructor(pid, burst, cpu_burst, io_burst, pClass, pri) {
        this.p_pid = pid;
        this.p_state = "ready";
        this.p_pri = pri;

        this.burst_time = burst;
        this.cpu_burst = cpu_burst;
        this.io_burst = io_burst;
        this.current_cycle_time = 0;
        this.wait_time = 0;
        this.finish_time = 0;
        this.roundRobin = false;

        this.class = (pClass == "RealTime") ? new Svr4RT(pri, pid) : new Svr4TS(pri, pid);
    }

    // TODO
    runTick(time, currentTime) {
        
        let text = "";
        switch (this.p_state) {
            case "running_kernel":
            case "running_user":
                text = this.class.runTick(this, time, currentTime);
                break;
            case "sleeping":
                this.current_cycle_time += time;
                if (this.current_cycle_time >= this.io_burst)
                    text = this._fromSleep();
                break;
            case "ready":
                this.wait_time += time;
                break;
            case "zombie":
                this.p_state = "finished";
                break;
            default:
                break;
        }
        
        return text;
    }

    startRun() {
        this.p_state = "running_user";
        this.roundRobin = false;
        this.resetQuantum();
    }

    resetQuantum() {
        this.class.resetQuantum();
    }

    /* Datos de la pantalla añadir proceso */
    getData() {
        return {
            p_pid: this.p_pid,
            p_state: this.p_state,
            p_pri: this.p_pri,
            class: this.class.name,
            burst_time: this.burst_time,
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
            burst_time: this.burst_time,
            cpu_burst: this.cpu_burst,
            io_burst: this.io_burst,
            current_cycle_time: this.current_cycle_time,
            wait_time: this.wait_time,
        };
    }

    /* Datos para la vista resumen */
    getSummaryData() {
        return {
            p_pid: this.p_pid,
            wait_time: this.wait_time,
            ex_time: this.finish_time
        }
    }

    getClassData() {
        return this.class.getData();
    }

    _fromSleep() {
        this.p_state = "ready";
        this.current_cycle_time = 0;
        return "Proceso " + this.p_pid + " finaliza su espera por I/O.";
    }
}


export default Svr4Scheduler;