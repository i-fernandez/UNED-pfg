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

    createSVR3() {
        this._init();
        this.scheduler = new SVR3Scheduler(this.stateManager);
    }

    createSVR4() {
        this._init();
        this.scheduler = new SVR4Scheduler(this.stateManager);
    }

    addProcess(data) {
        this.scheduler.addProcess(data);
        this.pTableChangedEvent.trigger(this.scheduler.getPTable());
    }

    startSimulation() {
        this.scheduler.start();

        // Genera todos los estados
        while (!(this.scheduler.isFinished())) 
            this.scheduler.nextTick();
            

        this.getSummary();
        /*    
        if (this.scheduler.isFinished())
            console.log("Algoritmo finalizado");
        */  
        
        // Visualiza el primer estado
        this.startVisualizationEvent.trigger(this.stateManager.states[0]);

    }

    getSummary() {
        // TODO: faltan eventos para solicitar/enviar
        let data = this.scheduler.getSummary();

        // eliminar
        console.log("Numero de procesos: " + data.n_proc);
        console.log("Tiempo total de ejecucion: " + data.t_time + " ut.");
        console.log("Tiempo de espera medio: " + data.wait + " ut.");
        console.log("Numero de cambios de contexto: " + data.cswitch);
    }

    getNextState() {
        this.sendStateEvent.trigger(this.stateManager.getNextState());
    }

    getPreviousState() {
        this.sendStateEvent.trigger(this.stateManager.getPreviousState());
    }
}

export default Simulation;