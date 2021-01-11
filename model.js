import SVR3Scheduler from './modules/svr3.js'
import SVR4Scheduler from './modules/svr4.js'
import Event from './event.js';
import StateManager from './modules/states.js';

class Simulation {
    constructor() {
        this._init();
        this.pTableChangedEvent = new Event();
        this.startVisualizationEvent = new Event();
        this.sendStateEvent = new Event();
    }

    _init() {
        this.stateManager = new StateManager();
    }

 
    addProcess(data) {
        this.scheduler.addProcess(data);
        this.pTableChangedEvent.trigger(this.scheduler.getPTable());
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
        this.scheduler.start();


        // Genera todos los estados
        // TODO: Modificar
        let i = 0;
        while ((!(this.scheduler.isFinished())) && i < 25) {
            this.scheduler.nextTick();
            i++;
        }
            
        

        // Visualiza el primer estado
        this.startVisualizationEvent.trigger({
            state: this.stateManager.states[0], 
            name: this.scheduler.name
        });

    }

    getNextState() {
        this.sendStateEvent.trigger({
            state: this.stateManager.getNextState(),
            name: this.scheduler.name
        });
    }

    getPreviousState() {
        this.sendStateEvent.trigger({
            state: this.stateManager.getPreviousState(),
            name: this.scheduler.name
        });
    }
}

export default Simulation;