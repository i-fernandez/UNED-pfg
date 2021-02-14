import PriorityQueue from './priorityqueue.js'
import Svr4RT from './srv4RT.js'
import Svr4TS from './svr4TS.js'

class Svr4Scheduler {
    constructor(states) {
        this.name = "SVR4";
        this.time = 0;
        this.dqactmap = [];
        this.dispq = [];
        this.processTable = [];
        this.runrun = false;
        this.kprunrun = false;
        this.journal = [];
        this.states = states;
    }

    addProcess(data) {
        let pr = new Svr4Process(
            this.processTable.length+1, data.burst, data.cpu_burst, data.io_burst, data.pClass, data.pri);
        this.processTable.push(pr);
        this._enqueueProcess(pr);
    }

    // Añade un proceso a la cola, modifica dispq y dqactmap (y los ordena)
    _enqueueProcess(process) {
        // Numero de cola
        let qn = process.pri;
        // dqactmap
        if (!(this.dqactmap.includes(qn))) {
            this.dqactmap.push(qn);
        }
        this.dqactmap.sort(function(a, b) { return a - b;});
        // dispq
        let queue = this.dispq.find(item => item.priority == qn);
        if (queue)
            queue.enqueue(process);
        else
            this.dispq.push(new PriorityQueue(qn, process));
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
                // modifica el bit de dqactmap (ultimo elemento)
                this.dqactmap.pop();
                // elimina la cola de dispq
                this.dispq.pop();
            }
                
            this.journal.push("Seleccionado proceso pid: " + 
                pr.pid + " para ejecucion");
            return pr;
        }
    }

    start() {
        this.journal.push("Inicio de la ejecucion");
        let pr = this._dequeueProcess();
        pr.state = "running_user";
        return this._generateState();
        //this.journal = [];
    }

    getPTable() {
        let pTable = [];
        this.processTable.forEach(pr => {pTable.push(pr.getData());});
        return pTable;
    }

    nextTick() {
        // return state
    }

    isFinished() {
        let procesos = this.processTable.filter(pr => pr.state != "finished");
        return (procesos.length === 0);
    }

    _sendState() {
        //return new Svr4State(this.time, this.journal, this.processTable, 
        //   this.dispq, this.dqactmap, this.runrun);
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

        this.class = (pClass = "RealTime") ? new Svr4RT(pri) : new Svr4TS(pri);
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
            classData : this.class.getData()
        };
    }
}


export default Svr4Scheduler;