import SVR3Scheduler from './modules/svr3.js'
import SVR4Scheduler from './modules/svr4.js'
import Event from './event.js';
import StateManager from './modules/states.js';

class Simulation {
    constructor() {
        this._init();
        this.pTableChangedEvent = new Event();
        this.startVisualizationEvent = new Event();
        this.createSummaryEvent = new Event();
        this.createTimelineEvent = new Event();
        this.createStatesEvent = new Event();
        this.sendStateEvent = new Event();
    }

    _init() {
        this.stateManager = new StateManager();
    }

    createSVR3() {
        this._init();
        this.scheduler = new SVR3Scheduler(this.stateManager);
    }

    createSVR4() {
        this._init();
        this.scheduler = new SVR4Scheduler(this.stateManager);
    }

    /* Convierte el JSON y se lo envia al planificador */
    addProcess(data) {
        this.scheduler.addProcess(JSON.parse(data));
        this.pTableChangedEvent.trigger(this.scheduler.getPTable());
    }


    startSimulation() { 
        // Genera todos los estados
        this.scheduler.start();
        while (!(this.scheduler.isFinished())) 
            this.scheduler.nextTick();

        // Lanza el evento con el resumen y el primer estado
        /*
        let data = {
            summary: this.scheduler.getSummary(),
            state: this.stateManager.states[0],
            time: this.stateManager.getTimeSeries()
        }
        this.startVisualizationEvent.trigger(data);
        */

        /* BORRAR */
        this.stateManager.createJSON();
        console.log(this.stateManager.getProgressData());

        // Envía el resumen
        this.createSummaryEvent.trigger(this.scheduler.getSummary());
        // Envía el progreso
        this.createTimelineEvent.trigger(this.stateManager.getTimeSeries());
        // Envía el primer estado
        this.createStatesEvent.trigger(this.stateManager.states[0]);
    }

    getNextState() {
        this.sendStateEvent.trigger(this.stateManager.getNextState());
    }

    getPreviousState() {
        this.sendStateEvent.trigger(this.stateManager.getPreviousState());
    }
}

export default Simulation;