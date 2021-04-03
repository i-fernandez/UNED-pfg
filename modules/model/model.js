import SVR3Scheduler from './svr3scheduler.js'
import SVR4Scheduler from './svr4scheduler.js'
import Event from '../util/event.js'
import StateManager from './states.js'

class Simulation {
    constructor() {
        this.pTableChangedEvent = new Event();
        this.startVisualizationEvent = new Event();
        this.createSummaryEvent = new Event();
        this.createTimelineEvent = new Event();
        this.createStatesEvent = new Event();
        this.sendStateEvent = new Event();
    }

    /* Crea un planificador SVR3 */
    createSVR3() {
        this.stateManager = new StateManager();
        this.scheduler = new SVR3Scheduler(this.stateManager);
    }

    /* Crea un planificador SVR4 */
    createSVR4() {
        this.stateManager = new StateManager();
        this.scheduler = new SVR4Scheduler(this.stateManager);
    }

    /* Convierte el JSON y se lo envia al planificador */
    addProcess(data) {
        this.scheduler.addProcess(JSON.parse(data));
        this.pTableChangedEvent.trigger(this.scheduler.getPTable());
    }


    /* Lanza la simulación en el planificador */
    startSimulation() { 
        // Genera todos los estados
        this.scheduler.start();
        while (!(this.scheduler.isFinished())) 
            this.scheduler.nextTick();

        // Envía el resumen
        this.createSummaryEvent.trigger(this.scheduler.getSummary());
        // Genera y envía el progreso
        this.stateManager.generateProgress();
        this.createTimelineEvent.trigger(this.stateManager.getProgressData());
        // Envía el primer estado
        this.createStatesEvent.trigger(this.stateManager.states[0]);
    }

    /* Obtiene el estado siguiente */
    getNextState() {
        this.sendStateEvent.trigger(this.stateManager.getNextState());
    }

    /* Obtiene el estado anterior */
    getPreviousState() {
        this.sendStateEvent.trigger(this.stateManager.getPreviousState());
    }
}

export default Simulation;