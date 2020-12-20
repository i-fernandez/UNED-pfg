import Simulation from './model.js';
import View from './view.js';

class Controller {
    constructor() {
        this.model = new Simulation;
        this.view = new View;

        // Listeners de eventos
        this.view.addProcessEvent.addListener(data => {
            this.model.addProcess(data);
        });

        this.view.startSimulationEvent.addListener(() => {
            this.model.startSimulation();
        });

        this.model.pTableChangedEvent.addListener(pTable => {
            this.view.displayProcessTable(pTable);
        });

        this.model.startVisualizationEvent.addListener(state => {
            // TODO: Enviar evento
            this.view._showStart(state);    
        });
    }

    run() {
        this.view.render();
    }

}

export default Controller;