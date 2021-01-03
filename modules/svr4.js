import PriorityQueue from './priorityqueue.js'

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
            this.processTable.length+1, data.burst, data.cpu_cycle, data.io_cycle, data.pClass, data.pri);
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

    nextTick() {
        // return state
    }

    isFinished() {
        // return bool
    }

    _generateState() {
        return new Svr4State(this.time, this.journal, this.processTable, 
            this.dispq, this.dqactmap, this.runrun);
    }
}


class Svr4Process {
    constructor(pid, burst, cpu_cycle, io_cycle, pClass, pri) {
        this.pid = pid;
        this.state = "ready";
        this.burst_time = burst;
        this.cpu_cycle = cpu_cycle;
        this.io_cycle = io_cycle;
        this.processClass = pClass;
        this.pri = pri;
        this.wait_time = 0;
        this.current_cycle_time = 0;
    }
}

/*
class Svr4State {
    constructor(time, journal, pTable, dispq, dqactmap, runrun) {
        this.time = time;
        this.journal = journal;
        this.pTable = pTable;
        this.dispq = dispq;
        this.dqactmap = dqactmap;
        this.runrun = runrun;
    }
}
*/


export default Svr4Scheduler;