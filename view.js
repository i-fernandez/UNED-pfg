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
        this.sel_svr3.addEventListener('click', event => {
            this._hideSvr4Add();
            this._showSvr3Add();
        });

        this.sel_svr4 = document.createElement('li');
        this.sel_svr4.textContent = 'SVR 4';
        this.sel_svr4.classList.add('header-menu-li');
        this.sel_svr4.addEventListener('click', event => {
            this._hideSvr3Add();
            this._showSvr4Add();
        });

        this.sch_selector.appendChild(this.sel_svr3);
        this.sch_selector.appendChild(this.sel_svr4);
        this.header_menu.appendChild(this.sch_selector);
        this.addproc_div = document.createElement('div');

        //this.title = document.createElement('h1');
        //this.form = document.createElement('form');

        // Sacar a svr3
        
//        this.title.textContent = "SVR3 : Add Process";
        
        // TODO: Validacion de datos de entrada (rangos y no vacios)
        /*
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
        */


        





        this._createSvr3Add();
        this._createSvr4Add();

        /*
        this.startButton.addEventListener('click', () => {
            this.startSimulationEvent.trigger();
        }); 
        */

        document.body.appendChild(this.header);
        document.body.appendChild(this.header_menu);
        document.body.appendChild(this.addproc_div);
        
        //document.body.appendChild(this.title_svr3);
        //document.body.appendChild(this.form_svr3);
        //document.body.appendChild(this.table);
        //document.body.appendChild(this.startDiv);


        this._hideSvr4Add();
    }

    _createSvr3Add() {
        this.title_svr3 = document.createElement('h1');
        this.title_svr3.textContent = "SVR3 : Add Process";
        this.form_svr3 = document.createElement('form');
        this.form_svr3.addEventListener('submit', event => {
            event.preventDefault();
            this.addProcessEvent.trigger(this._getInputData());
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
        this.form_svr3.appendChild(this.inputPriority_svr3);
        this.form_svr3.appendChild(this.inputBurst_svr3);
        this.form_svr3.appendChild(this.inputCPU_svr3);
        this.form_svr3.appendChild(this.inputIO_svr3);
        this.form_svr3.appendChild(this.submitButton_svr3);
        this.table_svr3 = document.createElement('table');
        this.startDiv_svr3 = document.createElement('div');
        this.startDiv_svr3.id = 'startDiv_svr3';
        this.startButton_svr3 = document.createElement('button');
        this.startButton_svr3.id = 'startButton';
        this.startButton_svr3.textContent = 'Start';
        this.startButton_svr3.style.display = "none";
        this.startButton_svr3.addEventListener('click', () => {
            console.log("Starting SVR3...");
            this.startSimulationEvent.trigger();
        });
        this.startDiv_svr3.appendChild(this.startButton_svr3);

        this.addproc_div.appendChild(this.title_svr3);
        this.addproc_div.appendChild(this.form_svr3);
        this.addproc_div.appendChild(this.table_svr3);
        this.addproc_div.appendChild(this.startDiv_svr3);
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
        this.form_svr4.appendChild(this.inputPriority_svr4);
        this.form_svr4.appendChild(this.inputBurst_svr4);
        this.form_svr4.appendChild(this.inputCPU_svr4);
        this.form_svr4.appendChild(this.inputIO_svr4);
        this.form_svr4.appendChild(this.submitButton_svr4);
        this.table_svr4 = document.createElement('table');
        this.startDiv_svr4 = document.createElement('div');
        this.startDiv_svr4.id = 'startDiv_svr4';
        this.startButton_svr4 = document.createElement('button');
        this.startButton_svr4.id = 'startButton';
        this.startButton_svr4.textContent = 'Start';
        this.startButton_svr4.style.display = "none";
        this.startButton_svr4.addEventListener('click', () => {
            console.log("Starting SVR4...");
            //this.startSimulationEvent.trigger();
        });
        this.startDiv_svr3.appendChild(this.startButton_svr4);



        this.addproc_div.appendChild(this.title_svr4);
        this.addproc_div.appendChild(this.form_svr4);
        this.addproc_div.appendChild(this.table_svr4);
        this.addproc_div.appendChild(this.startDiv_svr4);
    }

    _showSvr3Add() {
        this.title_svr3.style.display = "block";
        this.form_svr3.style.display = "inline";
        this.table_svr3.style.display = "inline";
        this.startDiv_svr3.style.display = "inline";
    }

    _showSvr4Add() {
        this.title_svr4.style.display = "block";
        this.form_svr4.style.display = "inline";
        this.table_svr4.style.display = "inline";
        this.startDiv_svr4.style.display = "inline";;
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

    _getInputData() {
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


    // TODO: desarrollar
    _showStart(state) {
        this._hideAddProcess();
        const title = document.createElement('h1');
        title.textContent = "Let's go";
        
        // Crea los elementos que se usaran
        // Time
        this.time = document.createElement('p');
        // Text
        this.text = document.createElement('p');
        // whichqs
        this.whichqs = document.createElement('p');
        // qs
        this.qsTitle = document.createElement('p');
        this.qs = document.createElement('ul');
        // runrun
        this.runrun = document.createElement('p');
        // pTable
        this.table_svr3 = document.createElement('table');

        document.body.appendChild(title);
        document.body.appendChild(this.time);
        
        document.body.appendChild(this.whichqs);
        document.body.appendChild(this.qsTitle);
        document.body.appendChild(this.qs);
        document.body.appendChild(this.runrun); 
        document.body.appendChild(this.table_svr3);
        document.body.appendChild(this.text);
        this._showSvr3State(state);
    }
   
    _showSvr3State(state) {
        // Rellena los elementos creados en _showStart
        this.time.textContent = "Time: " + state.time + " ut";
        this.text.textContent = "Eventos: " + state.text;
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
        this.form_svr4.style.display = "none"; 
        this.table_svr3.style.display = "none";  
        this.startButton_svr3.style.display = "none";
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
}

export default View;