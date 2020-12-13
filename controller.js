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

      this.model.pTableChangedEvent.addListener(pTable => {
          this.view.displayProcessTable(pTable);
      });
    }

    run() {
        this.view.render();
    }

}



export default Controller;