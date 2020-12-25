import Event from './event.js';

class View {
    constructor() {
        this.loadEvent = new Event();
        this.newSVR3Event = new Event();
        this.newSVR4Event = new Event();
        this.addSVR3ProcessEvent = new Event();
        this.addSVR4ProcessEvent = new Event();
        this.startSimulationEvent = new Event();
        this.nextStateEvent = new Event();
        this.previousStateEvent = new Event();
        
    }

    render() {
        // Elementos comunes
        this.header = document.createElement('div');
        this.header.id = 'header';
        this.header_menu = document.createElement('div');
        this.header_menu.id = 'header_menu';
        this.header_menu.classList.add('header-menu');
        this.sch_selector = document.createElement('ul');
        this.sch_selector.classList.add('header-menu-ul');
        this.sel_svr3 = document.createElement('li');
        this.sel_svr3.textContent = 'SVR 3';
        this.sel_svr3.classList.add('header-menu-li');
        this.sel_svr3.addEventListener('click', event => {
            this._showSvr3Add();
            this.newSVR3Event.trigger();
        });
        this.sel_svr4 = document.createElement('li');
        this.sel_svr4.textContent = 'SVR 4';
        this.sel_svr4.classList.add('header-menu-li');
        this.sel_svr4.addEventListener('click', event => {
            this._showSvr4Add();
            this.newSVR4Event.trigger();
        });
        this._append(this.sch_selector,
            [this.sel_svr3, this.sel_svr4]);

        this.header_menu.appendChild(this.sch_selector);
        this.addproc_div = document.createElement('div');
        this.addTitle = document.createElement('h1');
        this.addForm = document.createElement('form');
        this.addTable = document.createElement('table');
        this.startDiv = document.createElement('div');
        this.startDiv.classList.add('startDiv');
        this.startDiv.style.display = "none";
        this._append(this.addproc_div, 
            [this.addTitle, this.addForm, this.addTable, this.startDiv]);
        this.states_div = document.createElement('div');
        this._append(document.body, 
            [this.header, this.header_menu, this.addproc_div, this.states_div]);
        this._createSvr3Add();
        this._createSvr4Add();
        this._hideSvr3Add();
        this._hideSvr4Add();
    }

    _createSvr3Add() {
        // TODO: Validacion de datos de entrada (rangos y no vacios)
        this.inputPriority_svr3 = document.createElement('input');
        this.inputPriority_svr3.type = 'number';
        this.inputPriority_svr3.placeholder = 'prioridad';
        this.inputPriority_svr3.classList.add('inputProcess');
        this.inputBurst_svr3 = document.createElement('input');
        this.inputBurst_svr3.type = 'number';
        this.inputBurst_svr3.placeholder = 't. ejecucion';
        this.inputBurst_svr3.classList.add('inputProcess');
        this.inputCPU_svr3 = document.createElement('input');
        this.inputCPU_svr3.type = 'number';
        this.inputCPU_svr3.placeholder = 'ciclo cpu';
        this.inputCPU_svr3.classList.add('inputProcess');
        this.inputIO_svr3 = document.createElement('input');
        this.inputIO_svr3.type = 'number';
        this.inputIO_svr3.placeholder = 'ciclo io';
        this.inputIO_svr3.classList.add('inputProcess');
        this.submitButton_svr3 = document.createElement('button');
        this.submitButton_svr3.textContent = 'Add process';
        this.submitButton_svr3.addEventListener('click', event => {
            event.preventDefault();
            this.addSVR3ProcessEvent.trigger(this._getSvr3Input());
            this._resetSvr3Input();
        });
        this._append(this.addForm, 
            [this.inputPriority_svr3, this.inputBurst_svr3, 
            this.inputCPU_svr3, this.inputIO_svr3, this.submitButton_svr3]);
        this.startButton_svr3 = document.createElement('button');
        this.startButton_svr3.id = 'startButton';
        this.startButton_svr3.textContent = 'Start';
        this.startButton_svr3.classList.add('startButton');
        this.startButton_svr3.style.display = "none";
        this.startButton_svr3.addEventListener('click', () => {
            //console.log("Starting SVR3...");
            this.startSimulationEvent.trigger();
            this._createStart();
        });
        this.startDiv.appendChild(this.startButton_svr3);
    }

    _createSvr4Add() {
        // TODO: Validacion de datos de entrada (rangos y no vacios)
        this.inputPriority_svr4 = document.createElement('input');
        this.inputPriority_svr4.type = 'number';
        this.inputPriority_svr4.placeholder = 'prioridad (4)';
        this.inputPriority_svr4.classList.add('inputProcess');
        this.inputBurst_svr4 = document.createElement('input');
        this.inputBurst_svr4.type = 'number';
        this.inputBurst_svr4.placeholder = 't. ejecucion (4)';
        this.inputBurst_svr4.classList.add('inputProcess');
        this.inputCPU_svr4 = document.createElement('input');
        this.inputCPU_svr4.type = 'number';
        this.inputCPU_svr4.placeholder = 'ciclo cpu (4)';
        this.inputCPU_svr4.classList.add('inputProcess');
        this.inputIO_svr4 = document.createElement('input');
        this.inputIO_svr4.type = 'number';
        this.inputIO_svr4.placeholder = 'ciclo io (4)';
        this.inputIO_svr4.classList.add('inputProcess');
        this.classSel = document.createElement('select');
        let option_rt = document.createElement("option");
        option_rt.value = "1";
        option_rt.innerHTML = "Real Time";
        let option_ts = document.createElement("option");
        option_ts.value = "2";
        option_ts.innerHTML = "Time Sharing";
        this._append(this.classSel, [option_rt, option_ts]);
        this.submitButton_svr4 = document.createElement('button');
        this.submitButton_svr4.textContent = 'Add process';
        this.submitButton_svr4.addEventListener('click', event => {
            event.preventDefault();
            this.addSVR4ProcessEvent.trigger(this._getSvr4Input());
            this._resetSvr4Input();
        });
        this._append(this.addForm, 
            [this.inputBurst_svr4, this.inputCPU_svr4, this.inputIO_svr4, 
            this.classSel, this.inputPriority_svr4, this.submitButton_svr4]);
        this.startButton_svr4 = document.createElement('button');
        this.startButton_svr4.id = 'startButton';
        this.startButton_svr4.textContent = 'Start';
        this.startButton_svr4.classList.add('startButton');
        this.startButton_svr4.style.display = "none";
        this.startButton_svr4.addEventListener('click', () => {
            console.log("Starting SVR4...");
            this.startSimulationEvent.trigger();
            this._createStart();
        });
        this.startDiv.appendChild(this.startButton_svr4);
    }

    _showSvr3Add() {
        this._hideSvr4Add();
        this.addTitle.textContent = "SVR3 : Add Process";
        this.inputBurst_svr3.style.display = "inline";
        this.inputCPU_svr3.style.display = "inline";
        this.inputIO_svr3.style.display = "inline";
        this.inputPriority_svr3.style.display = "inline";
        this.submitButton_svr3.style.display = "inline";
        this.startButton_svr3.style.display = "inline";
        this.startDiv.style.display = "none";
    }

    _showSvr4Add() {
        this._hideSvr3Add();
        this.addTitle.textContent = "SVR4 : Add Process";
        this.inputBurst_svr4.style.display = "inline";
        this.inputCPU_svr4.style.display = "inline";
        this.inputIO_svr4.style.display = "inline";
        this.inputPriority_svr4.style.display = "inline";
        this.submitButton_svr4.style.display = "inline";
        this.classSel.style.display = "inline";
        this.startButton_svr4.style.display = "inline";
        this.startDiv.style.display = "none";
    }

    _hideSvr3Add() {
        this._clearPTable();
        this.inputBurst_svr3.style.display = "none";
        this.inputCPU_svr3.style.display = "none";
        this.inputIO_svr3.style.display = "none";
        this.inputPriority_svr3.style.display = "none";
        this.submitButton_svr3.style.display = "none";
        this.startButton_svr3.style.display = "none";
    }

    _hideSvr4Add() {
        this._clearPTable();
        this.inputBurst_svr4.style.display = "none";
        this.inputCPU_svr4.style.display = "none";
        this.inputIO_svr4.style.display = "none";
        this.inputPriority_svr4.style.display = "none";
        this.classSel.style.display = "none";
        this.submitButton_svr4.style.display = "none";
        this.startButton_svr4.style.display = "none";
    }

    _clearPTable() {
        while (this.addTable.firstChild) {
            this.addTable.removeChild(this.addTable.firstChild);
        }
    }

    _getSvr3Input() {
        let data = {
            burst: parseInt(this.inputBurst_svr3.value, 10),
            cpu_cycle: parseInt(this.inputCPU_svr3.value, 10),
            io_cycle: parseInt(this.inputIO_svr3.value, 10),
            pri: parseInt(this.inputPriority_svr3.value, 10)
        }
        return data;
    }

    _getSvr4Input() {
        let pc = "RealTime"
        if (parseInt(this.classSel.value, 10) === 2) {pc = "TimeSharing";}
        let data = {
            burst: parseInt(this.inputBurst_svr4.value, 10),
            cpu_cycle: parseInt(this.inputCPU_svr4.value, 10),
            io_cycle: parseInt(this.inputIO_svr4.value, 10),
            pClass: pc,
            pri: parseInt(this.inputPriority_svr4.value, 10)
        }
        return data;
    }
    
    _resetSvr3Input() {
        this.inputPriority_svr3.value = '';
        this.inputBurst_svr3.value = '';
        this.inputCPU_svr3.value = '';
        this.inputIO_svr3.value = '';
    }

    _resetSvr4Input() {
        this.inputPriority_svr4.value = '';
        this.inputBurst_svr4.value = '';
        this.inputCPU_svr4.value = '';
        this.inputIO_svr4.value = '';
    }


    
    _createStart() {
        this._hideAddProcess();
        const title = document.createElement('h1');
        title.textContent = "Let's go";
        this.time = document.createElement('p');
        this.text = document.createElement('p');
        this.text.textContent = "Eventos:"
        this.events = document.createElement('ul');
        this.runrun = document.createElement('p');
        this.arrayQueue = document.createElement('p');
        this.pqTitle = document.createElement('p');
        this.priorityQueue = document.createElement('ul');
        this.pTable = document.createElement('table');
        this._append(this.states_div,
            [title, this.time, this.arrayQueue, this.pqTitle, this.priorityQueue, 
            this.runrun, this.pTable, this.text, this.events]);
    }
   
    _showSvr3State(state) {
        // Rellena los elementos creados en _showStart
        this.time.textContent = "Time: " + state.time + " ut";
        //this.text.textContent = "Eventos: \n" + state.text;
        state.journal.forEach(entry => {
            let li = document.createElement('li');
            li.innerHTML = entry;
            this.events.appendChild(li);
        });
        this.whichqs.textContent = "whichqs: " + state.whichqs;
        this.qsTitle.textContent = "qs:";
        state.qs.forEach(item => {
            let li = document.createElement('li');
            let listaProc = "";
            item.items.forEach(pr => {listaProc += pr.p_pri + " ";});
            li.innerHTML = item.priority + " -> " + listaProc;
            this.qs.appendChild(li);
        });
        this.runrun.textContent = "runrun: " + state.runrun;
        this.displayProcessTable(state.pTable);
    }

    _showSvr4State(state) {

    }

    _hideAddProcess() {
        this.addproc_div.style.display = "none";
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

    // Darle una vuelta para que sea comun a ambos planificadores
    displayProcessTable(pTable) {
        // Delete all nodes
        this._clearPTable();
        /*
        while (this.addTable.firstChild) {
            this.addTable.removeChild(this.addTable.firstChild);
        }
        */

        if (pTable.length > 0) {
            // TODO: Sacar el startbutton de aqui para reaprovechar esta funcion
            this.startDiv.style.display = "block";
            //this.startButton_svr3.style.display = "inline";
            this.thead = this.addTable.createTHead();
            this.tbody = this.addTable.createTBody();
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

    _append(parent, elements) {
        elements.forEach(item => {
            parent.appendChild(item);
        });
    }
}

export default View;