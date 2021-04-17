import Simulation from '../model/simulation.js';
import View from '../view/view.js';

class Controller {
    constructor() {
        this.model = new Simulation;
        this.view = new View;

        /* Eventos en la vista */
        this.view.newFCFSEvent.addListener(() => {
            //this.model.createSVR3();
        });
        this.view.newSJFEvent.addListener(() => {
            //this.model.createSVR3();
        });
        this.view.newRREvent.addListener(() => {
            //this.model.createSVR3();
        });
        this.view.newPRIEvent.addListener(() => {
            //this.model.createSVR3();
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

        /* Eventos en el modelo */
        this.model.pTableChangedEvent.addListener(data => {
            this.view.showProcessTable(data);
        });

        this.model.createSummaryEvent.addListener(data => {
            this.view.createSummary(data);
        });

        this.model.createTimelineEvent.addListener(data => {
            this.view.createProgress(data);
        });

        this.model.sendStateEvent.addListener(data => {
            this.view.showState(data);
        }); 
    }

    run() {
        this.view.render();
    }
}

export default Controller;