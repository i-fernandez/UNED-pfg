import SVR3Scheduler from './modules/svr3.js'
import SVR4Scheduler from './modules/svr4.js'
import Event from './event.js';
import StateManager from './modules/states.js';

class Simulation {
    constructor() {
        this._init();
        this.pTableChangedEvent = new Event();
        this.startVisualizationEvent = new Event();
    }

    _init() {
        this.stateManager = new StateManager();
    }

 
    addProcess(data) {
        this.scheduler.addProcess(data);
        this.pTableChangedEvent.trigger(this.scheduler.processTable);
    }

    createSVR3() {
        this._init();
        this.scheduler = new SVR3Scheduler(this.stateManager);
    }

    createSVR4() {
        this._init();
        this.scheduler = new SVR4Scheduler(this.stateManager);
    }


    startSimulation() {
        // BORRAR
        this.scheduler.start();
        //this.scheduler.nextTick();


        // Genera todos los estados
        let i = 0;
        while ((!(this.scheduler.isFinished())) && i < 5) {
            this.scheduler.nextTick();
            i++;
        }
            
        

        // Visualiza el primer estado
        this.startVisualizationEvent.trigger({
            state: this.stateManager.states[0], 
            name: this.scheduler.name
        });

    }
}

export default Simulation;