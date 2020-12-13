import SVR3Scheduler from './modules/svr3.js'
import Event from './event.js';

class Simulation {
    constructor() {
        this.scheduler = new SVR3Scheduler();

        this.pTableChangedEvent = new Event();
        this.startVisualizationEvent = new Event();
        
    }

    
    // burst, cpu_cycle, io_cycle, pri
    addProcess(data) {
        this.scheduler.addProcess(data.burst, data.cpu_cycle, data.io_cycle, data.pri);
        this.pTableChangedEvent.trigger(this.scheduler.processTable);
    }

    startSimulation() {
        console.log("Start simulation");
        // TODO: Esto enviará el primer estado
        this.startVisualizationEvent.trigger();
    }


}

export default Simulation;