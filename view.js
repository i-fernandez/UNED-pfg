import Event from './event.js';

class View {
    constructor() {
        this.addProcessEvent = new Event();
        this.startSimulationEvent = new Event();
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
        this.sel_svr3.addEventListener('click', event => {this._showSvr3Add();});
        this.sel_svr4 = document.createElement('li');
        this.sel_svr4.textContent = 'SVR 4';
        this.sel_svr4.classList.add('header-menu-li');
        this.sel_svr4.addEventListener('click', event => {this._showSvr4Add();});
        this._append(this.sch_selector,
            [this.sel_svr3, this.sel_svr4]);
        //this.sch_selector.appendChild(this.sel_svr3);
        //this.sch_selector.appendChild(this.sel_svr4);
        this.header_menu.appendChild(this.sch_selector);
        this.addproc_div = document.createElement('div');
        this.states_div = document.createElement('div');
        
        /*
        document.body.appendChild(this.header);
        document.body.appendChild(this.header_menu);
        document.body.appendChild(this.addproc_div);
        document.body.appendChild(this.states_div);
        */

        this._append(document.body, 
            [this.header, this.header_menu, this.addproc_div, this.states_div]);

        this._createSvr3Add();
        this._createSvr4Add();
        this._showSvr3Add();
    }

    _createSvr3Add() {
        this.title_svr3 = document.createElement('h1');
        this.title_svr3.textContent = "SVR3 : Add Process";
        this.form_svr3 = document.createElement('form');
        this.form_svr3.addEventListener('submit', event => {
            event.preventDefault();
            this.addProcessEvent.trigger(this._getSvr3Input());
            this._resetSvr3Input();
        });

        // TODO: Validacion de datos de entrada (rangos y no vacios)
        this.inputPriority_svr3 = document.createElement('input');
        this.inputPriority_svr3.type = 'number';
        this.inputPriority_svr3.placeholder = 'prioridad';
        this.inputPriority_svr3.classList.add('inputProcess','svr3-input');
        this.inputBurst_svr3 = document.createElement('input');
        this.inputBurst_svr3.type = 'number';
        this.inputBurst_svr3.placeholder = 't. ejecucion';
        this.inputBurst_svr3.classList.add('inputProcess','svr3-input');
        this.inputCPU_svr3 = document.createElement('input');
        this.inputCPU_svr3.type = 'number';
        this.inputCPU_svr3.placeholder = 'ciclo cpu';
        this.inputCPU_svr3.classList.add('inputProcess','svr3-input');
        this.inputIO_svr3 = document.createElement('input');
        this.inputIO_svr3.type = 'number';
        this.inputIO_svr3.placeholder = 'ciclo io';
        this.inputIO_svr3.classList.add('inputProcess','svr3-input');
        this.submitButton_svr3 = document.createElement('button');
        this.submitButton_svr3.textContent = 'Add process';
        /*
        this.form_svr3.appendChild(this.inputPriority_svr3);
        this.form_svr3.appendChild(this.inputBurst_svr3);
        this.form_svr3.appendChild(this.inputCPU_svr3);
        this.form_svr3.appendChild(this.inputIO_svr3);
        this.form_svr3.appendChild(this.submitButton_svr3);
        */
        
        this._append(this.form_svr3, 
            [this.inputPriority_svr3, this.inputBurst_svr3, 
            this.inputCPU_svr3, this.inputIO_svr3, this.submitButton_svr3]);
        
        this.table_svr3 = document.createElement('table');
        this.startDiv_svr3 = document.createElement('div');
        this.startDiv_svr3.id = 'startDiv_svr3';
        this.startDiv_svr3.classList.add('startDiv');
        this.startButton_svr3 = document.createElement('button');
        this.startButton_svr3.id = 'startButton';
        this.startButton_svr3.textContent = 'Start';
        this.startButton_svr3.classList.add('startButton');
        this.startButton_svr3.style.display = "none";
        this.startButton_svr3.addEventListener('click', () => {
            console.log("Starting SVR3...");
            this.startSimulationEvent.trigger();
        });
        this.startDiv_svr3.appendChild(this.startButton_svr3);

        this._append(this.addproc_div,
            [this.title_svr3, this.form_svr3, this.table_svr3, this.startDiv_svr3]);
        /*
        this.addproc_div.appendChild(this.title_svr3);
        this.addproc_div.appendChild(this.form_svr3);
        this.addproc_div.appendChild(this.table_svr3);
        this.addproc_div.appendChild(this.startDiv_svr3);
        */
    }

    _createSvr4Add() {
        this.title_svr4 = document.createElement('h1');
        this.title_svr4.textContent = "SVR4 : Add Process";
        this.form_svr4 = document.createElement('form');
        this.form_svr4.addEventListener('submit', event => {
            event.preventDefault();
            //this.addProcessEvent.trigger(this._getInputData());
            this._resetSvr4Input();
        });
        // TODO: Validacion de datos de entrada (rangos y no vacios)
        this.inputPriority_svr4 = document.createElement('input');
        this.inputPriority_svr4.type = 'number';
        this.inputPriority_svr4.placeholder = 'prioridad (4)';
        this.inputPriority_svr4.classList.add('inputProcess','svr4-input');
        this.inputBurst_svr4 = document.createElement('input');
        this.inputBurst_svr4.type = 'number';
        this.inputBurst_svr4.placeholder = 't. ejecucion (4)';
        this.inputBurst_svr4.classList.add('inputProcess','svr4-input');
        this.inputCPU_svr4 = document.createElement('input');
        this.inputCPU_svr4.type = 'number';
        this.inputCPU_svr4.placeholder = 'ciclo cpu (4)';
        this.inputCPU_svr4.classList.add('inputProcess','svr4-input');
        this.inputIO_svr4 = document.createElement('input');
        this.inputIO_svr4.type = 'number';
        this.inputIO_svr4.placeholder = 'ciclo io (4)';
        this.inputIO_svr4.classList.add('inputProcess','svr4-input');
        this.submitButton_svr4 = document.createElement('button');
        this.submitButton_svr4.textContent = 'Add process';
        
        /*
        this.form_svr4.appendChild(this.inputPriority_svr4);
        this.form_svr4.appendChild(this.inputBurst_svr4);
        this.form_svr4.appendChild(this.inputCPU_svr4);
        this.form_svr4.appendChild(this.inputIO_svr4);
        this.form_svr4.appendChild(this.submitButton_svr4);
        */
        this._append(this.form_svr4, 
            [this.inputPriority_svr4, this.inputBurst_svr4, 
            this.inputCPU_svr4, this.inputIO_svr4, this.submitButton_svr4]);

        this.table_svr4 = document.createElement('table');
        this.startDiv_svr4 = document.createElement('div');
        this.startDiv_svr4.id = 'startDiv_svr4';
        this.startDiv_svr4.classList.add('startDiv');
        this.startButton_svr4 = document.createElement('button');
        this.startButton_svr4.id = 'startButton';
        this.startButton_svr4.textContent = 'Start';
        this.startButton_svr4.classList.add('startButton');
        this.startButton_svr4.style.display = "none";
        this.startButton_svr4.addEventListener('click', () => {
            console.log("Starting SVR4...");
            //this.startSimulationEvent.trigger();
        });
        this.startDiv_svr3.appendChild(this.startButton_svr4);


        /*
        this.addproc_div.appendChild(this.title_svr4);
        this.addproc_div.appendChild(this.form_svr4);
        this.addproc_div.appendChild(this.table_svr4);
        this.addproc_div.appendChild(this.startDiv_svr4);
        */
        this._append(this.addproc_div,
            [this.title_svr4, this.form_svr4, this.table_svr4, this.startDiv_svr4]);
    }

    _showSvr3Add() {
        this._hideSvr4Add();
        this.title_svr3.style.display = "block";
        this.form_svr3.style.display = "inline";
        this.table_svr3.style.display = "inline";
        this.startDiv_svr3.style.display = "block";
    }

    _showSvr4Add() {
        this._hideSvr3Add();
        this.title_svr4.style.display = "block";
        this.form_svr4.style.display = "inline";
        this.table_svr4.style.display = "inline";
        this.startDiv_svr4.style.display = "block";
    }

    _hideSvr3Add() {
        this.title_svr3.style.display = "none";
        this.form_svr3.style.display = "none";
        this.table_svr3.style.display = "none";
        this.startDiv_svr3.style.display = "none";
    }

    _hideSvr4Add() {
        this.title_svr4.style.display = "none";
        this.form_svr4.style.display = "none";
        this.table_svr4.style.display = "none";
        this.startDiv_svr4.style.display = "none";
        
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


    // TODO: desarrollar, ver lo que es comun a SVR4
    _showStart(state) {
        this._hideAddProcess();
        const title = document.createElement('h1');
        title.textContent = "Let's go";
        this.time = document.createElement('p');
        this.text = document.createElement('p');
        this.text.textContent = "Eventos:"
        //this.text.classList.add('no-wrap');
        this.events = document.createElement('ul');
        this.whichqs = document.createElement('p');
        this.qsTitle = document.createElement('p');
        this.qs = document.createElement('ul');
        this.runrun = document.createElement('p');
        this.table_svr3 = document.createElement('table');
        /*
        this.states_div.appendChild(title);
        this.states_div.appendChild(this.time);
        this.states_div.appendChild(this.whichqs);
        this.states_div.appendChild(this.qsTitle);
        this.states_div.appendChild(this.qs);
        this.states_div.appendChild(this.runrun);
        this.states_div.appendChild(this.table_svr3);
        this.states_div.appendChild(this.text);
        this.states_div.appendChild(this.events);
        */
        this._append(this.states_div, 
            [title, this.time, this.whichqs, this.qsTitle, this.qs, 
            this.runrun, this.table_svr3, this.text, this.events]);
        this._showSvr3State(state);
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

    _hideAddProcess() {
        this.title_svr3.style.display = "none";  
        this.form_svr3.style.display = "none"; 
        this.table_svr3.style.display = "none";  
        this.startButton_svr3.style.display = "none";
        this.form_svr4.style.display = "none";
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
        while (this.table_svr3.firstChild) {
            this.table_svr3.removeChild(this.table_svr3.firstChild);
        }
        
        if (pTable.length > 0) {
            // TODO: Sacar el startbutton de aqui para reaprovechar esta funcion
            this.startButton_svr3.style.display = "inline";
            this.thead = this.table_svr3.createTHead();
            this.tbody = this.table_svr3.createTBody();
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