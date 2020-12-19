import SVR3Scheduler from './modules/svr3.js'
import Event from './event.js';

class Simulation {
    constructor() {
        // Sacar de aqui
        this.scheduler = new SVR3Scheduler();

        // Lista de estados
        this.states = [];

        this.pTableChangedEvent = new Event();
        this.startVisualizationEvent = new Event();
        
    }

    
    // Separar por tipo scheduler
    // burst, cpu_cycle, io_cycle, pri
    addProcess(data) {
        this.scheduler.addProcess(data.burst, data.cpu_cycle, data.io_cycle, data.pri);
        this.pTableChangedEvent.trigger(this.scheduler.processTable);
    }


    // comun
    startSimulation() {
        console.log("Start simulation");
        // TODO: Esto enviará el primer estado
        this.startVisualizationEvent.trigger();

        // Envia el estado inicial
        this.states.push(this.scheduler.start());
        this.states[0].printData();

        // while (!(this.scheduler.isFinished())) {
            //this.states.push(this.scheduler.nextTick());
        //}

    }


}

export default Simulation;