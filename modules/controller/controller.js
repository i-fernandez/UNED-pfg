import Simulation from '../model/simulation.js';
import View from '../view/view.js';

class Controller {
    constructor() {
        this.model = new Simulation;
        this.view = new View;

        /* Eventos en la vista */
        this.view.newScheduler.addListener(name => {
            this.model.createScheduler(name);
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
        this.view.dataLoadedEvent.addListener(data => {
            this.model.createFromFile(data);
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