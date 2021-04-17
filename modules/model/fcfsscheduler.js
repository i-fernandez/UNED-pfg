import PriorityQueue from './priorityqueue.js'
import Process from './process.js'

class FCFSScheduler {
    constructor(stateManager) {
        // constantes
        
        // variables
        this.name = 'FCFS';
        this.stateManager = stateManager;
        this.time = 0;

        this.whichqs = [];
        this.qs = [];
        this.processTable = [];
        this.contextSwitchCount = 0;
        this.inContextSwitch = false;
        this.journal = [];  
        this.running = '';
    }


    /* Añade un nuevo proceso en el sistema */
    addProcess(data) {
        let pr = new Process(
            this.processTable.length+1, data.execution, data.cpu_burst, data.io_burst, data.pri);
        this.processTable.push(pr);
        //this._enqueueProcess(pr);

    }
}

export default FCFSScheduler;