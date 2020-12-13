class Svr3Scheduler {
    constructor() {
        this.whichqs = [];
        this.qs = [];
        this.processTable = [];
    }

    
    addProcess(burst, cpu_cycle, io_cycle, pri) {
         let pr = new Svr3Process(
            this.processTable.length+1, burst, cpu_cycle, io_cycle, pri);
        this.processTable.push(pr);
        //pr.printData();
    }

    printData() {
        this.processTable.forEach(pr => {  
            pr.printData();
        });
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

export default Svr3Scheduler;