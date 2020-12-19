import PriorityQueue from './priorityqueue.js'

class Svr3Scheduler {
    constructor() {
        this.time = 0;
        this.whichqs = [];
        this.qs = [];
        this.processTable = [];
        this.runrun = false;

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

        // Numero de cola
        let qn = Math.floor(pri / 4);
        // whichqs
        if (!(this.whichqs.includes(qn))) {
            this.whichqs.push(qn);
        }
        // qs
        let queue = this.qs.find(item => item.priority == qn);
        if (queue)
            queue.enqueue(pr);
        else
            this.qs.push(new PriorityQueue(pri, pr));
    }

    printData() {
        this.processTable.forEach(pr => {  
            pr.printData();
        });
    }

    start() {
        return this._generateState();
    }

    nextTick() {
        // return state
    }

    isFinished() {
        // return bool
    }

    _generateState() {
        return new Svr3State(this.time, "Inicio", this.processTable, 
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
    constructor(time, text, pTable, qs, whichqs, runrun) {
        this.time = time;
        this.text = text;
        this.pTable = pTable;
        this.qs = qs;
        this.whichqs = whichqs;
        this.runrun = runrun;
    }

    printData() {
        console.log("time: " + this.time + " text: " + this.text + 
            " pTable: " + this.pTable + " qs: " + this.qs + 
            " whichqs: " + this.whichqs + " runrun: " + this.runrun);
    }
}

export default Svr3Scheduler;