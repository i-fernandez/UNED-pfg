import Event from './event.js';

class View {
    constructor() {
        this.addProcessEvent = new Event();
        this.startSimulationEvent = new Event();
    }

    render() {
        this.header = document.createElement('div');
        this.header.id = 'header';
        this.title = document.createElement('h1');
        this.title.textContent = "SVR3 : Add Process";
        this.form = document.createElement('form');
        // TODO: Validacion de datos de entrada
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
        this.table = document.createElement('table');
        this.startDiv = document.createElement('div');
        this.startDiv.id = 'startDiv';
        this.startButton = document.createElement('button');
        this.startButton.id = 'startButton';
        this.startButton.textContent = 'Start';
        this.startButton.style.display = "none";
        this.startDiv.appendChild(this.startButton);

        this.form.addEventListener('submit', event => {
            event.preventDefault();
            this.addProcessEvent.trigger(this._getInputData());
            this._resetInput();
        });

        this.startButton.addEventListener('click', () => {
            this.startSimulationEvent.trigger();
        });

        document.body.appendChild(this.header);
        document.body.appendChild(this.title);
        document.body.appendChild(this.form);
        document.body.appendChild(this.table);
        document.body.appendChild(this.startDiv);
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
    

    // TODO: desarrollar
    _showStart() {
        this._hideAddProcess();
        const title = document.createElement('h1');
        title.textContent = "Let's go";
        document.body.appendChild(title);
    }

    _hideAddProcess() {
        this.title.style.display = "none";
        this.form.style.display = "none";
        this.table.style.display = "none";
        this.startButton.style.display = "none";
    }

    _setRowClass(row, pr) {
        switch (pr.state) {
            case "running_user":
                row.classList.add('pr_run_user');
                break;
            case "running_kernel":
                row.classList.add('pr_run_kernel');
                break;
            case "sleeping":
                row.classList.add('pr_sleeping');
                break;
            case "zombie":
                row.classList.add('pr_zombie');
                break;
            default:
                row.classList.add('pr_ready');
        }
    }

    displayProcessTable(pTable) {
        // Delete all nodes
        while (this.table.firstChild) {
            this.table.removeChild(this.table.firstChild);
        }
        
        if (pTable.length > 0) {
            this.startButton.style.display = "inline";
            this.thead = this.table.createTHead();
            this.tbody = this.table.createTBody();
            // Table head
            let row = this.thead.insertRow();
            let data = Object.keys(pTable[0]);
            for (let key of data) {
                let th = document.createElement('th');
                let text = document.createTextNode(key);
                th.appendChild(text);
                row.appendChild(th);
            }
            // Table Data
            pTable.forEach(pr => {
                let row = this.tbody.insertRow();
                this._setRowClass(row, pr);
                for (let item in pr) {
                    let tb = document.createElement('td')
                    tb.appendChild(document.createTextNode(pr[item]));
                    row.appendChild(tb)
                }
            });
        }
    }
}

export default View;