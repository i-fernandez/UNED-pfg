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
            this.sel_svr3.classList.add('header-menu-sel');
            this.sel_svr4.classList.remove('header-menu-sel');
            this._showAddProcess();
            this.startDiv.style.display = "none";
            this._showSvr3Add();
            this.newSVR3Event.trigger();
        });
        this.sel_svr4 = document.createElement('li');
        this.sel_svr4.textContent = 'SVR 4';
        this.sel_svr4.classList.add('header-menu-li');
        this.sel_svr4.addEventListener('click', event => {
            this.sel_svr4.classList.add('header-menu-sel');
            this.sel_svr3.classList.remove('header-menu-sel');
            this._showAddProcess();
            this.startDiv.style.display = "none";
            this._showSvr4Add();
            this.newSVR4Event.trigger();
        });
        this._append(this.sch_selector, [this.sel_svr3, this.sel_svr4]);
        this.header_menu.appendChild(this.sch_selector);
        this.addproc_div = document.createElement('div');
        this.addTitle = document.createElement('h1');
        this.formDiv = document.createElement('div');        
        this.addTable = document.createElement('table');
        this.startDiv = document.createElement('div');
        this.startDiv.classList.add('div-center');
        this.startDiv.style.display = "none";
        this.startButton = document.createElement('button');
        this.startButton.textContent = 'Simular';
        this.startButton.classList.add('startButton');
        this.startButton.addEventListener('click', () => {
            this._hideAddProcess();
            this.states_div.style.display = "inline";
            this.startSimulationEvent.trigger();
        });
        this.startDiv.appendChild(this.startButton);
        this._append(this.addproc_div, 
            [this.addTitle, this.formDiv, this.addTable, this.startDiv]);
        this.states_div = document.createElement('div');
        this.states_div.style.display = "none";
        this._createStart();
        this._append(document.body, 
            [this.header, this.header_menu, this.addproc_div, this.states_div]);
        this._createSvr3Add();
        this._createSvr4Add();
        this._hideSvr3Add();
        this._hideSvr4Add();
    }

    _createSvr3Add() {
        // TODO: Opcion para eliminar un proceso
        this.addForm_svr3 = document.createElement('form');
        this.addForm_svr3.addEventListener('submit', event => {
            event.preventDefault();
            this.addSVR3ProcessEvent.trigger(this._getSvr3Input());
            this._resetSvr3Input();
        });
        this.inputPriority_svr3 = document.createElement('input');
        this.inputPriority_svr3.type = 'number';
        this.inputPriority_svr3.placeholder = 'prioridad';
        this.inputPriority_svr3.classList.add('inputProcess');
        this.inputPriority_svr3.required = true;
        this.inputPriority_svr3.min = 50;
        this.inputPriority_svr3.max = 127;
        this.inputBurst_svr3 = document.createElement('input');
        this.inputBurst_svr3.type = 'number';
        this.inputBurst_svr3.placeholder = 't. ejecucion';
        this.inputBurst_svr3.classList.add('inputProcess');
        this.inputBurst_svr3.required = true;
        this.inputCPU_svr3 = document.createElement('input');
        this.inputCPU_svr3.type = 'number';
        this.inputCPU_svr3.placeholder = 'ciclo cpu';
        this.inputCPU_svr3.classList.add('inputProcess');
        this.inputCPU_svr3.required = true;
        this.inputIO_svr3 = document.createElement('input');
        this.inputIO_svr3.type = 'number';
        this.inputIO_svr3.placeholder = 'ciclo io';
        this.inputIO_svr3.classList.add('inputProcess');
        this.inputIO_svr3.required = true;
        this.addButton_svr3 = document.createElement('button');
        this.addButton_svr3.textContent = 'Agregar';
        this.addButton_svr3.classList.add('addButton');
        this.formDiv.appendChild(this.addForm_svr3);
        this._append(this.addForm_svr3, 
            [this.inputPriority_svr3, this.inputBurst_svr3, 
            this.inputCPU_svr3, this.inputIO_svr3, this.addButton_svr3]);
    }

    _createSvr4Add() {
        this.addForm_svr4 = document.createElement('form');
        this.addForm_svr4.addEventListener('submit', event => {
            event.preventDefault();
            this.addSVR4ProcessEvent.trigger(this._getSvr4Input());
            this._resetSvr4Input();
        });
        this.inputPriority_svr4 = document.createElement('input');
        this.inputPriority_svr4.type = 'number';
        this.inputPriority_svr4.placeholder = 'prioridad';
        this.inputPriority_svr4.classList.add('inputProcess');
        this.inputPriority_svr4.required = true;
        this.inputPriority_svr4.min = 100;
        this.inputPriority_svr4.max = 159;
        this.inputBurst_svr4 = document.createElement('input');
        this.inputBurst_svr4.type = 'number';
        this.inputBurst_svr4.placeholder = 't. ejecucion';
        this.inputBurst_svr4.classList.add('inputProcess');
        this.inputBurst_svr4.required = true;
        this.inputCPU_svr4 = document.createElement('input');
        this.inputCPU_svr4.type = 'number';
        this.inputCPU_svr4.placeholder = 'ciclo cpu';
        this.inputCPU_svr4.classList.add('inputProcess');
        this.inputCPU_svr4.required = true;
        this.inputIO_svr4 = document.createElement('input');
        this.inputIO_svr4.type = 'number';
        this.inputIO_svr4.placeholder = 'ciclo io';
        this.inputIO_svr4.classList.add('inputProcess');
        this.inputIO_svr4.required = true;
        this.classSel = document.createElement('select');
        this.classSel.addEventListener('change', event => {
            if (this.classSel.value == 1) {
                this.inputPriority_svr4.min = 100;
                this.inputPriority_svr4.max = 159;
            } else if (this.classSel.value ==  2) {
                this.inputPriority_svr4.min = 0;
                this.inputPriority_svr4.max = 59;
            }
        });
        let option_rt = document.createElement("option");
        option_rt.value = "1";
        option_rt.innerHTML = "Real Time";
        let option_ts = document.createElement("option");
        option_ts.value = "2";
        option_ts.innerHTML = "Time Sharing";
        this._append(this.classSel, [option_rt, option_ts]);
        this.addButton_svr4 = document.createElement('button');
        this.addButton_svr4.textContent = 'Agregar';
        this.addButton_svr4.classList.add('addButton');
        this.formDiv.appendChild(this.addForm_svr4);
        this._append(this.addForm_svr4, 
            [this.inputBurst_svr4, this.inputCPU_svr4, this.inputIO_svr4, 
            this.classSel, this.inputPriority_svr4, this.addButton_svr4]);
    }

    _showSvr3Add() {
        this._hideSvr4Add();
        this.addTitle.textContent = "SVR3 : Agregar procesos";
        this.addForm_svr3.style.display = "inline";
    }

    _showSvr4Add() {
        this._hideSvr3Add();
        this.addTitle.textContent = "SVR4 : Agregar procesos";
        this.addForm_svr4.style.display = "inline";
    }

    _hideSvr3Add() {
        this._clearPTable();
        this.addForm_svr3.style.display = "none";
    }

    _hideSvr4Add() {
        this._clearPTable();
        this.addForm_svr4.style.display = "none";
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
        if (this.classSel.value == 2) {pc = "TimeSharing";}
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
        this.statesTitle = document.createElement('h1');;
        this.statesTitle.textContent = "Simulacion";
        this.time = document.createElement('p');
        this.queue_div = document.createElement('div');
        this.pqTitle = document.createElement('p');
        this.priorityQueue = document.createElement('ul');
        this.runrun = document.createElement('p');
        this.pTable = document.createElement('table');
        this.text = document.createElement('p');
        this.text.textContent = "Eventos:"
        this.events = document.createElement('ul');
        this.navigation_div = document.createElement('div');
        this.navigation_div.classList.add('div-center');
        this.prev = document.createElement('button');
        this.prev.textContent = 'Anterior';
        this.prev.classList.add('navigationButton');
        this.prev.addEventListener('click', () => {
            console.log("Previous");
        });
        this.next = document.createElement('button');
        this.next.textContent = 'Siguiente';
        this.next.classList.add('navigationButton');
        this.next.addEventListener('click', () => {
            console.log("Next");
        });
        this._append(this.navigation_div, [this.prev, this.next]);
        this._append(this.states_div,
            [this.statesTitle, this.time, this.queue_div, this.pqTitle, this.priorityQueue, 
            this.runrun, this.pTable, this.text, this.events, this.navigation_div]);
    }

    showState(data) {
        // Campos comunes
        let state = data.state;
        this.time.textContent = "Time: " + state.time + " ut";
        this.runrun.textContent = "runrun: " + state.runrun;
        this._displayProcessTable(state.pTable, this.pTable);

        // Limpia arrayQueue
        while (this.queue_div.firstChild) {
            this.queue_div.removeChild(this.queue_div.firstChild);
        }
        // Crea arrayQueue
        let arrayQueue_div = document.createElement('div');
        arrayQueue_div.id = "arrayQueue_div";
        this.arrayQueue_p = document.createElement('p');
        arrayQueue_div.appendChild(this.arrayQueue_p);
        this.queue_div.appendChild(arrayQueue_div);

        // Limpia priorityQueue
        while (this.priorityQueue.firstChild) {
            this.priorityQueue.removeChild(this.priorityQueue.firstChild);
        }
        // Limpia eventos
        while (this.events.firstChild) {
            this.events.removeChild(this.events.firstChild);
        }
        state.journal.forEach(entry => {
            let li = document.createElement('li');
            li.innerHTML = entry;
            this.events.appendChild(li);
        });
        // Campos especificos
        if (data.name == "SVR3") 
            this._showSvr3State(state);
        else if (data.name == "SVR4") 
            this._showSvr4State(state);
    }
   
    _showSvr3State(state) {
        this._showArrayQueue(state.whichqs, "whichqs: ", 32);
        this.pqTitle.textContent = "qs:";
        state.qs.forEach(item => {
            let li = document.createElement('li');
            let listaProc = "";
            item.items.forEach(pr => {listaProc += pr.p_pri + " ";});
            li.innerHTML = item.priority + " -> " + listaProc;
            this.priorityQueue.appendChild(li);
        });
        
        
    }

    _showSvr4State(state) {
        this._showArrayQueue(state.dqactmap, "dqactmap: ", 160);
        this.pqTitle.textContent = "dispq:";
        state.dispq.forEach(item => {
            let li = document.createElement('li');
            let listaProc = "";
            item.items.forEach(pr => {listaProc += pr.pri + " ";});
            li.innerHTML = item.priority + " -> " + listaProc;
            this.priorityQueue.appendChild(li);
        });
    }

    _showArrayQueue(data, text, n) {
        this.arrayQueue_p.textContent = text;
        for (let i=0; i<n; i++) {
            let d = document.createElement('div');
            d.classList.add("array-queue");
            let sp = document.createElement('span');
            sp.classList.add('tooltip-text');
            sp.textContent = i;
            d.appendChild(sp);
            if (data.find(n => n == i))
                d.classList.add("array-queue-1");
            else
                d.classList.add("array-queue-0");
            
            this.queue_div.appendChild(d);
        }
    }

    _hideAddProcess() {
        this.addproc_div.style.display = "none";
    }

    _showAddProcess() {
        this.addproc_div.style.display = "inline";
        this.states_div.style.display = "none";
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


    _displayProcessTable(pTable, domElement) {
        while (domElement.firstChild) {
            domElement.removeChild(domElement.firstChild);
        }
        if (pTable.length > 0) {
            this.thead = domElement.createTHead();
            this.tbody = domElement.createTBody();
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

    pTableChanged(pTable) {
        if(pTable.length > 0) 
            this.startDiv.style.display = "block";
        
        this._displayProcessTable(pTable, this.addTable);
    }

    _append(parent, elements) {
        elements.forEach(item => {
            parent.appendChild(item);
        });
    }

}

export default View;