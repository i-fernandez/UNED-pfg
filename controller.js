//import './model.js';
import View from './view.js';

class Controller {
    constructor() {
      //this.model = new Simulation;
      this.view = new View;

      // TODO:  añadir los eventos
    }

    run() {
        this.view.render();
    }
}



export default Controller;