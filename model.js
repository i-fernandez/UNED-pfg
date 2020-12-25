import SVR3Scheduler from './modules/svr3.js'
import SVR4Scheduler from './modules/svr4.js'
import Event from './event.js';

class Simulation {
    constructor() {
        // Lista de estados
        this.states = [];
        this.currentState = 0;
        //this.load();
        this.pTableChangedEvent = new Event();
        this.startVisualizationEvent = new Event();
    }

    load() {
        
    }

    addProcess(data) {
        this.scheduler.addProcess(data);
        this.pTableChangedEvent.trigger(this.scheduler.processTable);
    }

    createSVR3() {
        this.scheduler = new SVR3Scheduler(this.states);
        console.log("New SVR3Scheduler");
    }

    createSVR4() {
        this.scheduler = new SVR4Scheduler(this.states);
        console.log("New SVR4Scheduler");
    }


    // comun
    startSimulation() {
        console.log("Start simulation");
        // Añade el estado inicial
        this.states.push(this.scheduler.start());
        this.states[0].printData();
        
        // Genera todos los estados
        // while (!(this.scheduler.isFinished())) {
            //this.states.push(this.scheduler.nextTick());
        //}

        // Avisa para mostrar datos
        this.startVisualizationEvent.trigger();

        // Envia el primer estado

    }

    _getNextState() {
        if (this.currentState+1 < this.states.length) 
            this.currentState++;
        
        return states[this.currentState];
    }

    _getPreviousState() {
        if (this.currentState > 0) 
            this.currentState--;
        
        return states[this.currentState];
    }

}

export default Simulation;