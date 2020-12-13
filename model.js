import SVR3Scheduler from './modules/svr3.js'
import Event from './event.js';

class Simulation {
    constructor() {
        this.scheduler = new SVR3Scheduler();

        this.pTableChangedEvent = new Event();
        
        //this.scheduler.addProcess(1000, 80, 20, 50);
        //this.scheduler.addProcess(1200, 20, 80, 65);
    }

    
    // burst, cpu_cycle, io_cycle, pri
    addProcess(data) {
        this.scheduler.addProcess(data.burst, data.cpu_cycle, data.io_cycle, data.pri);
        this.pTableChangedEvent.trigger(this.scheduler.processTable);
    }


}

export default Simulation;


/**
 *         this.form.addEventListener('submit', event => {
            event.preventDefault();
            this.addProcessEvent.trigger({
                burst: this.inputBurst.value,
                cpu_cycle: this.inputCPU.value,
                io_cycle: this.inputIO.value,
                pri: this.inputPriority.value
            });
            this._resetInput();
        });
 * 
 */