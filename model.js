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

        // Añade el estado inicial [BORRAR]
        this.states.push(this.scheduler.start());
        
        // Genera todos los estados
        // while (!(this.scheduler.isFinished())) {
            //this.states.push(this.scheduler.nextTick());
        //}

        // Envia el primer estado
        this.startVisualizationEvent.trigger({
            state: this.states[0], 
            name: this.scheduler.name
        });

    }

    getNextState() {
        if (this.currentState+1 < this.states.length) 
            this.currentState++;
        
        return states[this.currentState];
    }

    getPreviousState() {
        if (this.currentState > 0) 
            this.currentState--;
        
        return states[this.currentState];
    }

}

export default Simulation;