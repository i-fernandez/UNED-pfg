import PriorityQueue from './priorityqueue.js'

class Svr3Scheduler {
    constructor() {
        this.time = 0;
        this.whichqs = [];
        this.qs = [];
        this.processTable = [];
        this.runrun = false;
        this.journal = [];

        // Datos de ejemplo
        /** 
        let p1 = new Svr3Process(1, 1000, 80, 20, 50);
        let p2 = new Svr3Process(2, 1200, 20, 80, 65);
        let p3 = new Svr3Process(3, 2000, 20, 80, 110);
        let p4 = new Svr3Process(4, 1600, 160, 40, 71);
        p1.state = "running_user";
        p2.state = "running_kernel";
        p3.state = "sleeping";
        p4.state = "zombie";
        this.processTable.push(p1);
        this.processTable.push(p2);
        this.processTable.push(p3);
        this.processTable.push(p4);
        */
    }

    
    addProcess(burst, cpu_cycle, io_cycle, pri) {
        let pr = new Svr3Process(
            this.processTable.length+1, burst, cpu_cycle, io_cycle, pri);
        this.processTable.push(pr);
        this._enqueueProcess(pr);
    }

    // Añade un proceso a la cola, modifica qs y whichqs (y los ordena)
    _enqueueProcess(process) {
        // Numero de cola
        let qn = Math.floor(process.p_pri / 4);
        // whichqs
        if (!(this.whichqs.includes(qn))) {
            this.whichqs.push(qn);
        }
        this.whichqs.sort();

        // qs
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

    // Elige un proceso para ser planificado y lo desencola
    _dequeueProcess() {
        let qn = this.whichqs[0];
        let queue = this.qs.find(item => item.priority == qn);
        if (queue) {
            let pr = queue.dequeue();
            if (queue.isEmpty()) {
                // modifica el bit de whichqs
                this.whichqs.shift();
                // elimina la cola de qs
                this.qs.shift();
            }
                
            this.journal.push("Seleccionado proceso pid: " + 
                pr.pid + " para ejecucion");
            return pr;
        }
    }

    printData() {
        this.processTable.forEach(pr => {  
            pr.printData();
        });
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
        return new Svr3State(this.time, this.journal, this.processTable, 
            this.qs, this.whichqs, this.runrun);
    }

}

class Svr3Process {
    constructor(pid, burst, cpu_cycle, io_cycle, pri) {
        this.pid = pid;
        this.state = "ready";
        this.burst_time = burst;
        this.cpu_cycle = cpu_cycle;
        this.io_cycle = io_cycle;
        this.p_pri = pri;
        this.usrpri = pri;
        this.p_cpu = 0;
        this.p_nice = 20;
        this.wait_time = 0;
        this.current_cycle_time = 0;
    }

    printData() {
        console.log(this);
    }
}

class Svr3State {
    constructor(time, journal, pTable, qs, whichqs, runrun) {
        this.time = time;
        this.journal = journal;
        this.pTable = pTable;
        this.qs = qs;
        this.whichqs = whichqs;
        this.runrun = runrun;
    }

    printData() {
        console.log("time: " + this.time + " text: " + this.journal + 
            " pTable: " + this.pTable + " qs: " + this.qs + 
            " whichqs: " + this.whichqs + " runrun: " + this.runrun);
    }
}

export default Svr3Scheduler;