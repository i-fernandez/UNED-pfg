class Svr3Scheduler {
    constructor() {
        this.whichqs = [];
        this.qs = [];
        this.processTable = [];

        // Datos de ejemplo
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


        
    }

    
    addProcess(burst, cpu_cycle, io_cycle, pri) {
         let pr = new Svr3Process(
            this.processTable.length+1, burst, cpu_cycle, io_cycle, pri);
        this.processTable.push(pr);
        // TODO: Modificar qs y whichqs
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