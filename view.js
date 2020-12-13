import Event from './event.js';

class View {
    constructor() {
        this.addProcessEvent = new Event();
    }

    render() {
        this.header = document.createElement('div');
        this.header.classList.add('header');
        this.title = document.createElement('h1');
        this.title.textContent = "SVR3 : Add Process";
        this.form = document.createElement('form');
        this.inputPriority = document.createElement('input');
        this.inputPriority.type = 'number';
        this.inputPriority.placeholder = 'prioridad';
        this.inputPriority.classList.add('inputProcess');
        this.inputBurst = document.createElement('input');
        this.inputBurst.type = 'number';
        this.inputBurst.placeholder = 't. ejecucion';
        this.inputBurst.classList.add('inputProcess');
        this.inputCPU = document.createElement('input');
        this.inputCPU.type = 'number';
        this.inputCPU.placeholder = 'ciclo cpu';
        this.inputCPU.classList.add('inputProcess');
        this.inputIO = document.createElement('input');
        this.inputIO.type = 'number';
        this.inputIO.placeholder = 'ciclo io';
        this.inputIO.classList.add('inputProcess');
        this.submitButton = document.createElement('button');
        this.submitButton.textContent = 'Add process';
        this.form.appendChild(this.inputPriority);
        this.form.appendChild(this.inputBurst);
        this.form.appendChild(this.inputCPU);
        this.form.appendChild(this.inputIO);
        this.form.appendChild(this.submitButton);
        this.processTable = document.createElement('table');

        this.form.addEventListener('submit', event => {
            event.preventDefault();
            this.addProcessEvent.trigger(this._getInputData());
            this._resetInput();
        });

        document.body.appendChild(this.header);
        document.body.appendChild(this.title);
        document.body.appendChild(this.form);
        document.body.appendChild(this.processTable);

        //this.showAddProcess();
        //this._hideAddProcess();
        //this._showStart();

    }


    _getInputData() {
        let data = {
            burst: parseInt(this.inputBurst.value, 10),
            cpu_cycle: parseInt(this.inputCPU.value, 10),
            io_cycle: parseInt(this.inputIO.value, 10),
            pri: parseInt(this.inputPriority.value, 10)
        }
        return data;
    }
    
    _resetInput() {
        this.inputPriority.value = '';
        this.inputBurst.value = '';
        this.inputCPU.value = '';
        this.inputIO.value = '';
    }
    

    // BORRAR
    _showStart() {
        const title = document.createElement('h1');
        title.textContent = "Let's go";
        document.body.appendChild(title);
    }

    _hideAddProcess() {
        this.form.style.display = "none";
    }

    displayProcessTable(pTable) {
        

        pTable.forEach(pr => {
            console.log(pr.pid, pr.state, pr.burst_time, pr.cpu_cycle,
                pr.io_cycle, pr.p_pri, pr.usrpri, pr.p_cpu, pr.p_nice, 
                pr.wait_time, pr.current_cycle_time);
        })
        
		
        // Delete all nodes
        //while (this.table.firstChild) {
        //    this.table.removeChild(this.table.firstChild)
        //}
        // Show default message
        //if (pTable.length < 0) {
        //    this.thead = this.processTable.createTHead()
         //   this.tbody = this.processTable.createTBody()
        //} 
        

    }

}

export default View;