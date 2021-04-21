import Simulation from '../model/simulation.js';
import View from '../view/view.js';

class Controller {
    constructor() {
        this.model = new Simulation;
        this.view = new View;

        /* Eventos en la vista */
        this.view.newFCFSEvent.addListener(() => {
            this.model.createFCFS();
        });
        this.view.newSJFEvent.addListener(() => {
            this.model.createSJF();
        });
        this.view.newRREvent.addListener(() => {
            this.model.createRR();
        });
        this.view.newPRIEvent.addListener(() => {
            this.model.createPRI();
        });
        this.view.newSVR3Event.addListener(() => {
            this.model.createSVR3();
        });

        this.view.newSVR4Event.addListener(() => {
            this.model.createSVR4();
        });

        this.view.addProcessEvent.addListener(data => {
            this.model.addProcess(data);
        });

        this.view.startSimulationEvent.addListener(() => {
            this.model.startSimulation();
        });

        this.view.nextStateEvent.addListener(() => {
            this.model.getNextState();
        });

        this.view.previousStateEvent.addListener(() => {
            this.model.getPreviousState();
        });

        this.view.exportEvent.addListener(() => {
            this.model.getTotalData();
        });

        /* Eventos en el modelo */
        this.model.pTableChangedEvent.addListener(data => {
            this.view.showProcessTable(data);
        });

        this.model.sendStateEvent.addListener(data => {
            this.view.showState(data);
        }); 
    
        this.model.startVisualizationEvent.addListener(data => {
            this.view.showSimulationData(data);
        });

        this.model.sendTotalDataEvent.addListener(data => {
            this.view.exportData(data);
        });
    }

    run() {
        this.view.render();
    }
}

export default Controller;