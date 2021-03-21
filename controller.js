import Simulation from './model.js';
import View from './view.js';

class Controller {
    constructor() {
        this.model = new Simulation;
        this.view = new View;

        this.view.newSVR3Event.addListener(() => {
            this.model.createSVR3();
        });

        this.view.newSVR4Event.addListener(() => {
            this.model.createSVR4();
        });

        this.view.addSVR3ProcessEvent.addListener(data => {
            this.model.addProcess(data);
        });

        this.view.addSVR4ProcessEvent.addListener(data => {
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


        this.model.pTableChangedEvent.addListener(pTable => {
            this.view.pTableChanged(pTable);
        });

        this.model.startVisualizationEvent.addListener(data => {
            this.view.createSummary(data.summary);
            this.view.createProgress(data.time);
            this.view.showState(data.state);
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