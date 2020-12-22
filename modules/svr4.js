import PriorityQueue from './priorityqueue.js'

class Svr4Scheduler {
    constructor(states) {
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
            this.processTable.length+1, data.burst, data.cpu_cycle, data.io_cycle, data.pri, data.pClass);
        this.processTable.push(pr);
        //this._enqueueProcess(pr);
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


class Svr4State {
}


export default Svr4Scheduler;