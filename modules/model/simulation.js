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
        this.stateRequestedEvent = new Event();
        this.sendTotalDataEvent = new Event();
    }

    /* Crea una instancia del planificador */
    createScheduler(name) {
        this.stateManager = new StateManager();
        this.name = name;
        switch (name) {
            case 'FCFS':
                this.scheduler = new FCFSScheduler(this.stateManager);
                break;
            case 'SJF':
                this.scheduler = new SJFScheduler(this.stateManager);
                break;
            case 'RR':
                this.scheduler = new RRScheduler(this.stateManager);
                break;
            case 'PRI':
                this.scheduler = new PRIScheduler(this.stateManager);
                break;
            case 'SVR3':
                this.scheduler = new SVR3Scheduler(this.stateManager);
                break;
            case 'SVR4':
                this.scheduler = new SVR4Scheduler(this.stateManager);
                break;
            default:
                break;
        }
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
            name: this.name,
            summary: JSON.parse(this.scheduler.getSummary()),
            progress: JSON.parse(this.stateManager.getProgressData()),
            state: JSON.parse(this.stateManager.states[0])
        };
        this.startVisualizationEvent.trigger(JSON.stringify(data, null, 1));
    }

    /* Obtiene el estado siguiente */
    getNextState() {
        let data = {
            name: this.name,
            state: JSON.parse(this.stateManager.getNextState())
        }
        this.stateRequestedEvent.trigger(JSON.stringify(data, null, 1));
    }

    /* Obtiene el estado anterior */
    getPreviousState() {
        let data = {
            name: this.name,
            state: JSON.parse(this.stateManager.getPreviousState())
        }
        this.stateRequestedEvent.trigger(JSON.stringify(data, null, 1));
    }

    /* Recopila el total de la informacion para exportarla */
    getTotalData() {
        let data = {
            name: this.name,
            summary: JSON.parse(this.scheduler.getSummary()),
            progress: JSON.parse(this.stateManager.getProgressData()),
            states: this.stateManager.states.map(s => JSON.parse(s))
        }
        this.sendTotalDataEvent.trigger(JSON.stringify(data, this._replacer, 1));
    }

    /* Crea la instancia a partir de los datos guardados */
    createFromFile(data) {
        this.stateManager = new StateManager();
        let d = JSON.parse(data);
        this.name = d.name;
        d.states.forEach(s => {
            this.stateManager.pushState(JSON.stringify(s, null, 1));
        });
    }

    /* Cambia espacios por %20 antes de la exportacion */
    _replacer(key, value) {
        if (typeof value === "string")
            return value.replaceAll(' ', '%20');
        return value;
    } 
}

export default Simulation;