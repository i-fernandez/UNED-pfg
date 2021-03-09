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

    /* Añadir proceso */

    render() {
        // Elementos comunes
        let header_div = document.createElement('div');
        header_div.id = 'header_div';
        let logo = document.createElement('img');
        logo.src = './resources/uned_etsi_60.png';
        logo.classList.add('image-right');
        header_div.appendChild(logo);

        let header_menu_div = document.createElement('div');
        header_menu_div.id = 'header_menu_div';
        header_menu_div.style.display = 'none';
        let nav_menu = document.createElement('ul');
        nav_menu.classList.add('states-menu-ul');
        let summary_li = document.createElement('li');
        summary_li.textContent = 'RESUMEN';
        summary_li.classList.add('states-menu-li');
        summary_li.addEventListener('click', event => {
            summary_li.classList.add('states-menu-li-sel');
            states_li.classList.remove('states-menu-li-sel');
            this.summary_div.style.display = 'inherit';
            this.states_div.style.display = 'none';
        });

        let states_li = document.createElement('li');
        states_li.textContent = 'ESTADOS';
        states_li.classList.add('states-menu-li');
        states_li.addEventListener('click', event => {
            states_li.classList.add('states-menu-li-sel');
            summary_li.classList.remove('states-menu-li-sel');
            this.states_div.style.display = 'inherit';
            this.summary_div.style.display = 'none';
        });
        
        header_menu_div.appendChild(nav_menu);
        this._append(nav_menu, [summary_li, states_li]);


        let sch_selector = document.createElement('ul');
        sch_selector.classList.add('header-menu-ul-center');
        let sel_svr3 = document.createElement('li');
        sel_svr3.textContent = 'SVR 3';
        sel_svr3.classList.add('header-menu-li');
        sel_svr3.addEventListener('click', event => {
            sel_svr3.classList.add('header-menu-sel');
            sel_svr4.classList.remove('header-menu-sel');
            this._showAddProcess();
            init_div.style.display = 'none';
            header_menu_div.style.display = 'none';
            this.states_div.style.display = 'none';
            this.summary_div.style.display = 'none';
            this._showSvr3Add();
            this.newSVR3Event.trigger();
        });
        let sel_svr4 = document.createElement('li');
        sel_svr4.textContent = 'SVR 4';
        sel_svr4.classList.add('header-menu-li');
        sel_svr4.addEventListener('click', event => {
            sel_svr4.classList.add('header-menu-sel');
            sel_svr3.classList.remove('header-menu-sel');
            this._showAddProcess();
            init_div.style.display = 'none';
            header_menu_div.style.display = 'none';
            this.states_div.style.display = 'none';
            this.summary_div.style.display = 'none';
            this._showSvr4Add();
            this.newSVR4Event.trigger();
        });
        this._append(sch_selector, [sel_svr3, sel_svr4]);
        header_div.appendChild(sch_selector);

        let init_div = document.createElement('div');
        init_div.classList.add('div-main');
        let title = document.createElement('h1');
        title.classList.add('text');
        title.textContent = 'Simulador de algoritmos de planificación de procesos';
        let description = document.createElement('p');
        description.textContent = "Seleccione un algoritmo de planificación para empezar...";

        this._append(init_div, [title, description]);

        let addproc_div = document.createElement('div');
        addproc_div.id = 'addproc_div';
        addproc_div.classList.add('div-main');
        addproc_div.style.display = "none";
        let addTitle = document.createElement('h1');
        //addTitle.id = 'addTitle';
        addTitle.textContent = 'Añadir proceso';
        addTitle.classList.add('text');
        let formDiv = document.createElement('div');        
        formDiv.id = 'inputform_div'
        let addTable = document.createElement('table');
        addTable.id = 'addTable';
        addTable.classList.add('proc_table');
        let start_div = document.createElement('div');
        start_div.id = 'states_div';
        start_div.classList.add('high_margin','div-states');
        start_div.style.display = 'none';

        let startButton = document.createElement('button');
        startButton.textContent = 'Simular';
        startButton.classList.add('startButton');
        startButton.addEventListener('click', () => {
            //this._hideAddProcess();
            addproc_div.style.display = "none";
            this.summary_div.style.display = 'inherit';
            header_menu_div.style.display = 'inherit';
            summary_li.classList.add('states-menu-li-sel');
            states_li.classList.remove('states-menu-li-sel');
            this.startSimulationEvent.trigger();
        });
        start_div.appendChild(startButton);
        this._append(addproc_div, [addTitle, formDiv, addTable, start_div]);
        this.states_div = document.createElement('div');
        this.states_div.classList.add('div-main');
        this.states_div.style.display = "none";
        this.summary_div = document.createElement('div');
        this.summary_div.classList.add('div-main');
        this.summary_div.style.display = 'none';
        this._createStates();
        this._append(document.body, 
            [header_div, header_menu_div, init_div, addproc_div, 
            this.summary_div, this.states_div]
        );
        this._createSvr3Add();
        this._createSvr4Add();
        this._hideSvr3Add();
        this._hideSvr4Add();
    }

    _createSvr3Add() {
        // TODO: Opcion para eliminar un proceso
        let addForm_svr3 = document.createElement('form');
        addForm_svr3.id = 'addForm_svr3';
        addForm_svr3.addEventListener('submit', event => {
            event.preventDefault();
            this.addSVR3ProcessEvent.trigger(this._getSvr3Input());
            this._resetInput();
        });
        let inputPriority_svr3 = document.createElement('input');
        inputPriority_svr3.id = 'inputPriority_svr3';
        inputPriority_svr3.type = 'number';
        inputPriority_svr3.placeholder = 'prioridad';
        inputPriority_svr3.classList.add('inputProcess');
        inputPriority_svr3.required = true;
        inputPriority_svr3.min = 50;
        inputPriority_svr3.max = 127;
        let inputBurst_svr3 = document.createElement('input');
        inputBurst_svr3.id = 'inputBurst_svr3';
        inputBurst_svr3.type = 'number';
        inputBurst_svr3.placeholder = 't. ejecucion';
        inputBurst_svr3.classList.add('inputProcess');
        inputBurst_svr3.required = true;
        let inputCPU_svr3 = document.createElement('input');
        inputCPU_svr3.id = 'inputCPU_svr3';
        inputCPU_svr3.type = 'number';
        inputCPU_svr3.placeholder = 'ciclo cpu';
        inputCPU_svr3.classList.add('inputProcess');
        inputCPU_svr3.required = true;
        let inputIO_svr3 = document.createElement('input');
        inputIO_svr3.id = 'inputIO_svr3';
        inputIO_svr3.type = 'number';
        inputIO_svr3.placeholder = 'ciclo io';
        inputIO_svr3.classList.add('inputProcess');
        inputIO_svr3.required = true;
        let addButton_svr3 = document.createElement('button');
        addButton_svr3.textContent = 'Agregar';
        addButton_svr3.classList.add('startButton');
        //addButton_svr3.classList.add('addButton');
        document.getElementById('inputform_div').appendChild(addForm_svr3);
        this._append(addForm_svr3, 
            [inputPriority_svr3, inputBurst_svr3, inputCPU_svr3, 
            inputIO_svr3, addButton_svr3]
        );
    }

    _createSvr4Add() {
        let addForm_svr4 = document.createElement('form');
        addForm_svr4.id = 'addForm_svr4';
        addForm_svr4.addEventListener('submit', event => {
            event.preventDefault();
            this.addSVR4ProcessEvent.trigger(this._getSvr4Input());
            this._resetInput();
        });
        let inputPriority_svr4 = document.createElement('input');
        inputPriority_svr4.id = 'inputPriority_svr4';
        inputPriority_svr4.type = 'number';
        inputPriority_svr4.placeholder = 'prioridad';
        inputPriority_svr4.classList.add('inputProcess');
        inputPriority_svr4.required = true;
        inputPriority_svr4.min = 100;
        inputPriority_svr4.max = 159;
        let inputBurst_svr4 = document.createElement('input');
        inputBurst_svr4.id = 'inputBurst_svr4';
        inputBurst_svr4.type = 'number';
        inputBurst_svr4.placeholder = 't. ejecucion';
        inputBurst_svr4.classList.add('inputProcess');
        inputBurst_svr4.required = true;
        let inputCPU_svr4 = document.createElement('input');
        inputCPU_svr4.id = 'inputCPU_svr4';
        inputCPU_svr4.type = 'number';
        inputCPU_svr4.placeholder = 'ciclo cpu';
        inputCPU_svr4.classList.add('inputProcess');
        inputCPU_svr4.required = true;
        let inputIO_svr4 = document.createElement('input');
        inputIO_svr4.id = 'inputIO_svr4';
        inputIO_svr4.type = 'number';
        inputIO_svr4.placeholder = 'ciclo io';
        inputIO_svr4.classList.add('inputProcess');
        inputIO_svr4.required = true;
        let classSel = document.createElement('select');
        classSel.id = 'class_sel';
        classSel.addEventListener('change', event => {
            if (classSel.value == 1) {
                inputPriority_svr4.min = 100;
                inputPriority_svr4.max = 159;
            } else if (classSel.value ==  2) {
                inputPriority_svr4.min = 0;
                inputPriority_svr4.max = 59;
            }
        });
        let option_rt = document.createElement("option");
        option_rt.value = "1";
        option_rt.innerHTML = "Real Time";
        let option_ts = document.createElement("option");
        option_ts.value = "2";
        option_ts.innerHTML = "Time Sharing";
        this._append(classSel, [option_rt, option_ts]);
        let addButton_svr4 = document.createElement('button');
        addButton_svr4.textContent = 'Agregar';
        addButton_svr4.classList.add('startButton');
        document.getElementById('inputform_div').appendChild(addForm_svr4);
        this._append(addForm_svr4, 
            [inputBurst_svr4, inputCPU_svr4, inputIO_svr4, 
            classSel, inputPriority_svr4, addButton_svr4]
        );
    }

    _showSvr3Add() {
        this._hideSvr4Add();
        //document.getElementById('addTitle').textContent = "SVR3 : Agregar procesos";
        document.getElementById('addForm_svr3').style.display = "inherit";
    }

    _showSvr4Add() {
        this._hideSvr3Add();
        //document.getElementById('addTitle').textContent = "SVR4 : Agregar procesos";
        document.getElementById('addForm_svr4').style.display = "inherit";
    }

    _hideSvr3Add() {
        this._clearChilds(document.getElementById('addTable'));
        document.getElementById('addForm_svr3').style.display = "none";
    }

    _hideSvr4Add() {
        this._clearChilds(document.getElementById('addTable'));
        this._clearChilds(document.getElementById('rtTable'));
        this._clearChilds(document.getElementById('tsTable'));
        document.getElementById('addForm_svr4').style.display = "none";
    }


    _getSvr3Input() {
        let data = {
            burst: parseInt(document.getElementById('inputBurst_svr3').value, 10),
            cpu_burst: parseInt(document.getElementById('inputCPU_svr3').value, 10),
            io_burst: parseInt(document.getElementById('inputIO_svr3').value, 10),
            pri: parseInt(document.getElementById('inputPriority_svr3').value, 10)
        }
        return data;
    }

    _getSvr4Input() {
        let pc = "RealTime"
        if (document.getElementById('class_sel').value == 2) {pc = "TimeSharing";}
        let data = {
            burst: parseInt(document.getElementById('inputBurst_svr4').value, 10),
            cpu_burst: parseInt(document.getElementById('inputCPU_svr4').value, 10),
            io_burst: parseInt(document.getElementById('inputIO_svr4').value, 10),
            pClass: pc,
            pri: parseInt(document.getElementById('inputPriority_svr4').value, 10)
        }
        return data;
    }

    _resetInput() {
        let items = document.getElementsByClassName('inputProcess');
        Array.prototype.forEach.call(items, function(i) {i.value = ''});
    }

    _showAddProcess() {
        document.getElementById('addproc_div').style.display = "inherit";
        this.states_div.style.display = "none";
    }
    

    /* Simulacion */

    createSummary(data) {
        this._clearChilds(this.summary_div);
        let title_div = document.createElement('div');
        title_div.classList.add('div-states');
        let title = document.createElement('h1');
        title.textContent = "Resumen de la simulacion";
        title.classList.add('text');
        title_div.appendChild(title);
        let data_div = document.createElement('div');
        data_div.classList.add('div-states');
        let data_table = document.createElement('table');
        this._addBinaryRow(data_table, "Número de procesos: ", data.n_proc);
        this._addBinaryRow(data_table, "Tiempo de ejecución: ", data.t_time + " ut.");
        this._addBinaryRow(data_table, "Tiempo medio de espera: ", data.wait);
        this._addBinaryRow(data_table, "Número de cambios de contexto: ", data.cswitch);
        data_div.appendChild(data_table);
        let table_div = document.createElement('div');
        table_div.classList.add('div-states');
        this._createSummaryTable(table_div, data.proc_data);
        this._append(this.summary_div, [title_div, data_div, table_div]);
    }

    _createStates() {

        let navigation_div = document.createElement('div');
        navigation_div.classList.add('div-nav', 'div-states');
        let prev = document.createElement('button');
        prev.textContent = 'Anterior';
        prev.classList.add('startButton');
        prev.addEventListener('click', () => {
            this.previousStateEvent.trigger();
        });
        let next = document.createElement('button');
        next.textContent = 'Siguiente';
        next.classList.add('startButton');
        next.addEventListener('click', () => {
            this.nextStateEvent.trigger();
        });
        this._append(navigation_div, [prev, next]);

        //let statesTitle = document.createElement('h1');;
        //statesTitle.textContent = "Simulacion";
        //statesTitle.classList.add('text');

        let state_div = document.createElement('div');
        state_div.classList.add('div-states');
        let state_table = document.createElement('table');
        state_table.id = 'state_table';
        state_div.appendChild(state_table);

        //let lineP = document.createElement('hr');
        //lineP.classList.add('separator-line');

        let pTable_div = document.createElement('div');
        pTable_div.classList.add('div-states');
        let pTable = document.createElement('table');
        pTable.id = 'pTable';
        pTable.classList.add('proc_table');
        pTable_div.appendChild(pTable);

        //let lineR = document.createElement('hr');
        //lineR.classList.add('separator-line');

        let rtTable_div = document.createElement('div');
        rtTable_div.classList.add('div-states');
        let rtTable = document.createElement('table');
        rtTable.id = "rtTable";
        rtTable.classList.add('proc_table');
        rtTable_div.appendChild(rtTable);

        //let lineS = document.createElement('hr');
        //lineS.classList.add('separator-line');

        let tsTable_div = document.createElement('div');
        tsTable_div.classList.add('div-states');
        let tsTable = document.createElement('table');
        tsTable.id = "tsTable";
        tsTable.classList.add('proc_table');
        tsTable_div.appendChild(tsTable);

        //let lineE = document.createElement('hr');
        //lineE.classList.add('separator-line');

        let events_div = document.createElement('div');
        events_div.classList.add('div-states');
        let text = document.createElement('p');
        text.textContent = "Eventos:"
        let events = document.createElement('ul');
        events.id = 'events';
        this._append(events_div, [text, events]);

        this._append(this.states_div,
            [navigation_div, state_div, pTable_div,
            rtTable_div, tsTable_div, events_div]
        );
        
    }

    // Elementos para mostrar un estado (comunes)
    showState(data) {
        let state = data.state;
        let s_table = document.getElementById('state_table');
        this._clearChilds(s_table);
        this._addBinaryRow(s_table, "Time: ", state.time + " ut.");
        this._addBinaryRow(s_table, "runrun: ", state.runrun);
        this._displayProcessTable(state.pTable, document.getElementById('pTable'));

        // Eventos
        let events = document.getElementById('events');
        this._clearChilds(events);
        state.journal.forEach(entry => {
            let li = document.createElement('li');
            li.innerHTML = entry;
            events.appendChild(li);
        });
        // Campos especificos
        if (data.name == "SVR3") 
            this._showSvr3State(state);
        else if (data.name == "SVR4") {
            this._showSvr4State(state);
            let rtt = document.getElementById('rtTable');
            let tst = document.getElementById('tsTable');
            this._showSvr4ClassDepent(data.rt_data.rt, rtt, "rtdpent", "2", "rtproc", "3");
            this._showSvr4ClassDepent(data.ts_data.ts, tst, "tsdpent", "6", "tsproc", "5");
        }    
    }
   
    // Elementos para mostrar un estado de SVR3
    _showSvr3State(state) {
        let s_table = document.getElementById('state_table');
        let row_qs = s_table.insertRow();
        let td_t = document.createElement('td');
        td_t.classList.add('bold');
        td_t.appendChild(document.createTextNode("qs:"));
        td_t.classList.add('top');
        let td_d = document.createElement('td');
        this._fillPriorityQueue(td_d, state.qs);
        this._append(row_qs, [td_t, td_d]);
        let row_wq = s_table.insertRow();
        let td_w = document.createElement('td');
        td_w.classList.add('bold');
        td_w.appendChild(document.createTextNode("whichqs: "));
        td_w.classList.add('top');
        let td_a = document.createElement('td');
        // Tabla para datos de whichqs
        let aq_table = document.createElement('table');
        td_a.appendChild(aq_table);
        this._showArrayQueue(state.whichqs, aq_table, "", 0, 31);   
        this._append(row_wq, [td_w, td_a]); 
    }

    // Elementos para mostrar un estado de SVR4
    _showSvr4State(state) {
        let s_table = document.getElementById('state_table');
        this._addBinaryRow(s_table, "kprunrun: ", state.kprunrun);
        let row_qs = s_table.insertRow();
        let td_t = document.createElement('td');
        td_t.classList.add('bold');
        td_t.appendChild(document.createTextNode("dispq:"));
        td_t.classList.add('top');
        let td_d = document.createElement('td');
        this._fillPriorityQueue(td_d, state.dispq);
        this._append(row_qs, [td_t, td_d]);
        let row_wq = s_table.insertRow();
        let td_w = document.createElement('td');
        td_w.classList.add('bold');
        td_w.appendChild(document.createTextNode("dqactmap: "));
        td_w.classList.add('top');
        let td_a = document.createElement('td');
        // Tabla para datos de whichqs
        let aq_table = document.createElement('table');
        td_a.appendChild(aq_table);
        this._showArrayQueue(state.dqactmap, aq_table, "TimeSharing: ", 0, 59);
        this._showArrayQueue(state.dqactmap, aq_table, "Kernel: ", 60, 99);
        this._showArrayQueue(state.dqactmap, aq_table, "RealTime: ", 100, 159);
        this._append(row_wq, [td_w, td_a]);
    }


    // Muestra los datos dependientes de la clase 
    _showSvr4ClassDepent(state, domElement, dpent, n_dpent, proc, n_proc) {
        this._clearChilds(domElement);
        if (state.length > 0) {
            let thead = domElement.createTHead();
            let tbody = domElement.createTBody();

            // Table head
            let row = thead.insertRow();
            row.classList.add('pr_class_header');
            row.appendChild(document.createElement('th'));
            let dp = document.createElement('th');
            dp.appendChild(document.createTextNode(dpent));
            dp.colSpan = n_dpent;
            row.appendChild(dp);
            let pr = document.createElement('th');
            pr.appendChild(document.createTextNode(proc));
            pr.colSpan = n_proc;
            row.appendChild(pr);

            // First row
            let row1 = tbody.insertRow();
            row1.classList.add('bold');
            let data = Object.keys(state[0]);
            for (let key of data) {
                let td = document.createElement('td');
                td.appendChild(document.createTextNode(key));
                row1.appendChild(td);
            }

            // Table data
            state.forEach(pr => {
                let r = tbody.insertRow();
                for (let item in pr) {
                    let td = document.createElement('td');
                    td.appendChild(document.createTextNode(pr[item]));
                    r.appendChild(td);
                }
            });
        }

    }


    /* Funciones auxiliares */

    _showArrayQueue(data, table, text, start, end) {
        let row = table.insertRow();
        let td_txt = document.createElement('td');
        td_txt.classList.add('table-italic');
        td_txt.appendChild(document.createTextNode(text));
        row.appendChild(td_txt);
        let td_data = document.createElement('td');
        row.appendChild(td_data);

        for (let i=start; i<=end; i++) {
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
            
            td_data.appendChild(d);
        }
    }

    _setRowClass(row, pr) {
        switch (pr.p_state) {
            case "running_user":
                row.classList.add('pr_run_user', 'row_ptable');
                break;
            case "running_kernel":
                row.classList.add('pr_run_kernel', 'row_ptable');
                break;
            case "sleeping":
                row.classList.add('pr_sleeping', 'row_ptable');
                break;
            case "zombie":
                row.classList.add('pr_zombie', 'row_ptable');
                break;
            default:
                row.classList.add('pr_ready', 'row_ptable');
        }
    }


    _displayProcessTable(pTable, domElement) {
        this._clearChilds(domElement)
        if (pTable.length > 0) {
            let thead = domElement.createTHead();
            let tbody = domElement.createTBody();
            // Table head
            let row = thead.insertRow();
            let data = Object.keys(pTable[0]);
            for (let key of data) {
                let th = document.createElement('th');
                th.classList.add('th_ptable');
                let text = document.createTextNode(key);
                th.appendChild(text);
                row.appendChild(th);
            }
            // Table Data
            pTable.forEach(pr => {
                let row = tbody.insertRow();
                this._setRowClass(row, pr);
                for (let item in pr) {
                    let tb = document.createElement('td');
                    tb.appendChild(document.createTextNode(pr[item]));
                    row.appendChild(tb)
                }
            });
        }
    }

    _createSummaryTable(domElement, data) {
        if (data.length > 0) {
            let table = document.createElement('table');
            table.id = 'summary_table';
            table.classList.add('proc_table');
            // Head
            let thead = table.createTHead();
            thead.id = 'summary_thead';
            let head_row = thead.insertRow();
            let th_1 = document.createElement('th');
            th_1.appendChild(document.createTextNode('pid'));
            head_row.appendChild(th_1);
            let th_2 = document.createElement('th');
            th_2.appendChild(document.createTextNode('tiempo de espera'));
            head_row.appendChild(th_2);
            let th_3 = document.createElement('th');
            th_3.appendChild(document.createTextNode('tiempo de ejecución'));
            head_row.appendChild(th_3);
            // Body
            let tbody = table.createTBody();
            data.forEach(pr => {
                let row = tbody.insertRow();
                row.classList.add('row_summary');
                for (let item in pr) {
                    let tb = document.createElement('td');
                    tb.appendChild(document.createTextNode(pr[item]));
                    row.appendChild(tb);
                }
            });
            domElement.appendChild(table);
        }
        
    }

    _addBinaryRow(table, text, data) {
        let row = table.insertRow();
        let td_t = document.createElement('td');
        td_t.classList.add('bold');
        td_t.appendChild(document.createTextNode(text));
        let td_d = document.createElement('td');
        td_d.appendChild(document.createTextNode(data));
        this._append(row, [td_t, td_d]);
    }

    _fillPriorityQueue(domElement, data) {
        let table = document.createElement('table');
        data.forEach(item => {
            let listaProc = "";
            item.items.forEach(pr => {listaProc += pr.p_pid + " <--> ";});
            let row = table.insertRow();
            let td_t = document.createElement('td');
            td_t.appendChild(document.createTextNode(item.priority));
            let td_a = document.createElement('td');
            td_a.appendChild(document.createTextNode(" --> "));
            let td_p = document.createElement('td');
            td_p.appendChild(document.createTextNode(listaProc.slice(0, -6)));
            this._append(row, [td_t, td_a, td_p]);
        });
        domElement.appendChild(table);
    }

    pTableChanged(pTable) {
        if(pTable.length > 0) 
            document.getElementById('states_div').style.display = "block";
        
        this._displayProcessTable(pTable, document.getElementById('addTable'));
    }

    

    _append(parent, elements) {
        elements.forEach(item => {
            parent.appendChild(item);
        });
    }


    // Elimina los elementos de una tabla
    _clearChilds(domElement) {
        while (domElement.firstChild) {
            domElement.removeChild(domElement.firstChild);
        }
    }

}

export default View;