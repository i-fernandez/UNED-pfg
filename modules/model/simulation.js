import SVR3Scheduler from './svr3scheduler.js'
import SVR4Scheduler from './svr4scheduler.js'
import FCFSScheduler from './fcfsscheduler.js'
import SJFScheduler from './sjfscheduler.js'
import RRScheduler from './rrscheduler.js'
import PRIScheduler from './prischeduler.js'
import Event from '../util/event.js'
import StateManager from './statemanager.js'

class Simulation {
    constructor() {
        this.pTableChangedEvent = new Event();
        this.startVisualizationEvent = new Event();
        this.sendStateEvent = new Event();
        this.sendTotalDataEvent = new Event();
    }

    /* Crea un planificador FCFS */
    createFCFS() {
        this.stateManager = new StateManager();
        this.scheduler = new FCFSScheduler(this.stateManager);
    }

    /* Crea un planificador SJF */
    createSJF() {
        this.stateManager = new StateManager();
        this.scheduler = new SJFScheduler(this.stateManager);
    }

    /* Crea un planificador RR */
    createRR() {
        this.stateManager = new StateManager();
        this.scheduler = new RRScheduler(this.stateManager);
    }

    /* Crea un planificador PRI */
    createPRI() {
        this.stateManager = new StateManager();
        this.scheduler = new PRIScheduler(this.stateManager);
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
        // Realiza la simulacion
        this.scheduler.runSimulation();
        // Genera el progreso
        this.stateManager.generateProgress();
        // Genera un JSON y lo envia a la vista
        let data = {
            name: this.scheduler.name,
            summary: JSON.parse(this.scheduler.getSummary()),
            progress: JSON.parse(this.stateManager.getProgressData()),
            state: JSON.parse(this.stateManager.states[0])
        };
        this.startVisualizationEvent.trigger(JSON.stringify(data));
    }

    /* Obtiene el estado siguiente */
    getNextState() {
        let data = {
            name: this.scheduler.name,
            state: JSON.parse(this.stateManager.getNextState())
        }
        this.sendStateEvent.trigger(JSON.stringify(data));
    }

    /* Obtiene el estado anterior */
    getPreviousState() {
        let data = {
            name: this.scheduler.name,
            state: JSON.parse(this.stateManager.getPreviousState())
        }
        this.sendStateEvent.trigger(JSON.stringify(data));
    }

    /* Recopila el total de la informacion para exportarla */
    getTotalData() {
        // TODO: falta exportar todos los datos
        this.sendTotalDataEvent.trigger(this.scheduler.getSummary());
    }
}

export default Simulation;