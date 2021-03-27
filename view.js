import Event from './event.js';
import Graphics from './modules/graphics.js';

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
            progress_li.classList.remove('states-menu-li-sel');
            this.summary_div.style.display = 'inherit';
            this.progress_div.style.display = 'none';
            this.states_div.style.display = 'none';
        });
        let progress_li = document.createElement('li');
        progress_li.textContent = 'PROGRESO';
        progress_li.classList.add('states-menu-li');
        progress_li.addEventListener('click', event => {
            progress_li.classList.add('states-menu-li-sel');
            summary_li.classList.remove('states-menu-li-sel');
            states_li.classList.remove('states-menu-li-sel');
            this.progress_div.style.display = 'inherit';
            this.states_div.style.display = 'none';
            this.summary_div.style.display = 'none';
        });
        let states_li = document.createElement('li');
        states_li.textContent = 'ESTADOS';
        states_li.classList.add('states-menu-li');
        states_li.addEventListener('click', event => {
            states_li.classList.add('states-menu-li-sel');
            summary_li.classList.remove('states-menu-li-sel');
            progress_li.classList.remove('states-menu-li-sel');
            this.states_div.style.display = 'inherit';
            this.progress_div.style.display = 'none';
            this.summary_div.style.display = 'none';
        });
        
        header_menu_div.appendChild(nav_menu);
        this._append(nav_menu, [summary_li, progress_li, states_li]);
        
        /* Selector de algoritmo */
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
            this.progress_div.style.display = 'none';
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
            this.progress_div.style.display = 'none';
            this._showSvr4Add();
            this.newSVR4Event.trigger();
        });
        this._append(sch_selector, [sel_svr3, sel_svr4]);
        header_div.appendChild(sch_selector);

        /* Bienvenida inicial */
        let init_div = document.createElement('div');
        init_div.classList.add('div-main');
        let title = document.createElement('h1');
        title.classList.add('text');
        title.textContent = 'Simulador de algoritmos de planificación de procesos';
        let description = document.createElement('p');
        description.textContent = 'Seleccione un algoritmo de planificación para empezar...';
        this._append(init_div, [title, description]);

        /* Añadir proceso */
        let addproc_div = document.createElement('div');
        addproc_div.id = 'addproc_div';
        addproc_div.classList.add('div-main');
        addproc_div.style.display = 'none';
        let addTitle = document.createElement('h1');
        addTitle.textContent = 'Añadir proceso';
        addTitle.classList.add('text');
        let formDiv = document.createElement('div');        
        formDiv.id = 'inputform_div'
        let addTable = document.createElement('table');
        addTable.id = 'addTable';
        addTable.classList.add('plain_table');
        let start_div = document.createElement('div');
        start_div.id = 'start_div';
        start_div.classList.add('high_margin','div-states');
        start_div.style.display = 'none';

        let startButton = document.createElement('button');
        startButton.textContent = 'Simular';
        startButton.addEventListener('click', () => {
            addproc_div.style.display = 'none';
            this.summary_div.style.display = 'inherit';
            header_menu_div.style.display = 'inherit';
            summary_li.classList.add('states-menu-li-sel');
            progress_li.classList.remove('states-menu-li-sel');
            states_li.classList.remove('states-menu-li-sel');
            this.startSimulationEvent.trigger();
        });
        start_div.appendChild(startButton);
        this._append(addproc_div, [addTitle, formDiv, addTable, start_div]);
        this.states_div = document.createElement('div');
        this.states_div.classList.add('div-main');
        this.states_div.style.display = 'none';

        this.progress_div = document.createElement('div');
        this.progress_div.classList.add('div-main');
        this.progress_div.style.display = 'none';

        this.summary_div = document.createElement('div');
        this.summary_div.classList.add('div-main');
        this.summary_div.style.display = 'none';
        this._createStates();
        this._append(document.body, 
            [header_div, header_menu_div, init_div, addproc_div, 
            this.summary_div, this.progress_div, this.states_div]
        );
        this._createSvr3Add();
        this._createSvr4Add();
        this._hideSvr3Add();
        this._hideSvr4Add();
    }

    _createSvr3Add() {
        let addForm_svr3 = document.createElement('form');
        addForm_svr3.id = 'addForm_svr3';
        addForm_svr3.addEventListener('submit', event => {
            event.preventDefault();
            this.addSVR3ProcessEvent.trigger(this._getSvr3Input());
            this._resetInput();
        });
        let inputPriority_svr3 = this._addInput(addForm_svr3, 'Prioridad');
        inputPriority_svr3.id = 'inputPriority_svr3';
        inputPriority_svr3.placeholder = '50-127';
        inputPriority_svr3.min = 50;
        inputPriority_svr3.max = 127;
        let inputBurst_svr3 = this._addInput(addForm_svr3, 'T. ejecución');
        inputBurst_svr3.id = 'inputBurst_svr3';
        let inputCPU_svr3 = this._addInput(addForm_svr3, 'Ciclo CPU');
        inputCPU_svr3.id = 'inputCPU_svr3';
        let inputIO_svr3 = this._addInput(addForm_svr3, 'Ciclo IO');
        inputIO_svr3.id = 'inputIO_svr3';
        let addButton_svr3 = document.createElement('button');
        addButton_svr3.textContent = 'Agregar';
        addForm_svr3.appendChild(addButton_svr3);
        document.getElementById('inputform_div').appendChild(addForm_svr3);
    }

    _createSvr4Add() {
        let addForm_svr4 = document.createElement('form');
        addForm_svr4.id = 'addForm_svr4';
        addForm_svr4.addEventListener('submit', event => {
            event.preventDefault();
            this.addSVR4ProcessEvent.trigger(this._getSvr4Input());
            this._resetInput();
        });
        /* Selector de clase */
        let cs_table = this._createInputAddTable(addForm_svr4, 'Clase');
        let classSel = document.createElement('select');
        classSel.id = 'class_sel';
        classSel.addEventListener('change', event => {
            if (classSel.value == 1) {
                inputPriority_svr4.placeholder = '100-159';
                inputPriority_svr4.min = 100;
                inputPriority_svr4.max = 159;
            } else if (classSel.value ==  2) {
                inputPriority_svr4.placeholder = '0-59';
                inputPriority_svr4.min = 0;
                inputPriority_svr4.max = 59;
            }
        });
        let option_rt = document.createElement('option');
        option_rt.value = '1';
        option_rt.innerHTML = 'Real Time';
        let option_ts = document.createElement('option');
        option_ts.value = '2';
        option_ts.innerHTML = 'Time Sharing';
        this._append(classSel, [option_rt, option_ts]);
        cs_table.appendChild(classSel);
        // Campos numericos
        let inputPriority_svr4 = this._addInput(addForm_svr4, 'Prioridad');
        inputPriority_svr4.id = 'inputPriority_svr4';
        inputPriority_svr4.placeholder = '100-159';
        inputPriority_svr4.min = 100;
        inputPriority_svr4.max = 159;
        let inputBurst_svr4 = this._addInput(addForm_svr4, 'T. ejecución');
        inputBurst_svr4.id = 'inputBurst_svr4';
        let inputCPU_svr4 = this._addInput(addForm_svr4, 'Ciclo CPU');
        inputCPU_svr4.id = 'inputCPU_svr4';
        let inputIO_svr4 = this._addInput(addForm_svr4, 'Ciclo IO');
        inputIO_svr4.id = 'inputIO_svr4';
        // Boton
        let addButton_svr4 = document.createElement('button');
        addButton_svr4.textContent = 'Agregar';
        addForm_svr4.appendChild(addButton_svr4);
        document.getElementById('inputform_div').appendChild(addForm_svr4);
    }

    _showSvr3Add() {
        this._hideSvr4Add();
        document.getElementById('addForm_svr3').style.display = 'inline-flex';
    }

    _showSvr4Add() {
        this._hideSvr3Add();
        document.getElementById('addForm_svr4').style.display = 'inline-flex';
    }

    _hideSvr3Add() {
        this._clearChilds(document.getElementById('addTable'));
        document.getElementById('addForm_svr3').style.display = 'none';
    }

    _hideSvr4Add() {
        this._clearChilds(document.getElementById('addTable'));
        document.getElementById('addForm_svr4').style.display = 'none';
    }


    _getSvr3Input() {
        let data = {
            execution: parseInt(document.getElementById('inputBurst_svr3').value, 10),
            cpu_burst: parseInt(document.getElementById('inputCPU_svr3').value, 10),
            io_burst: parseInt(document.getElementById('inputIO_svr3').value, 10),
            pri: parseInt(document.getElementById('inputPriority_svr3').value, 10)
        }
        return data;
    }

    _getSvr4Input() {
        let pc = 'RealTime'
        if (document.getElementById('class_sel').value == 2) {pc = 'TimeSharing';}
        let data = {
            execution: parseInt(document.getElementById('inputBurst_svr4').value, 10),
            cpu_burst: parseInt(document.getElementById('inputCPU_svr4').value, 10),
            io_burst: parseInt(document.getElementById('inputIO_svr4').value, 10),
            pClass: pc,
            pri: parseInt(document.getElementById('inputPriority_svr4').value, 10)
        }
        return data;
    }

    _resetInput() {
        let items = document.getElementsByClassName('inputValue_input');
        Array.prototype.forEach.call(items, function(i) {i.value = ''});
    }

    _showAddProcess() {
        document.getElementById('addproc_div').style.display = 'inherit';
        document.getElementById('start_div').style.display = 'none';
        this.states_div.style.display = 'none';
    }
    

    /* Simulacion */

    createSummary(data) {
        this._clearChilds(this.summary_div);
        let title_div = document.createElement('div');
        title_div.classList.add('div-states');
        let title = document.createElement('h1');
        title.textContent = 'Resumen de la simulacion';
        title.classList.add('text');
        title_div.appendChild(title);
        let data_div = document.createElement('div');
        data_div.classList.add('div-states');
        let data_table = document.createElement('table');
        this._addBinaryRowText(data_table, 'Número de procesos: ', data.n_proc);
        this._addBinaryRowText(data_table, 'Tiempo de ejecución: ', `${data.t_time} ut.`);
        this._addBinaryRowText(data_table, 'Tiempo medio de espera: ', `${data.wait} ut.`);
        this._addBinaryRowText(data_table, 'Número de cambios de contexto: ', data.cswitch);

        /* Grafico de barras */
        let tiempos_td = this._addBinaryRow(data_table, 'Tiempos por proceso: ');
        tiempos_td.id = 'barChart_td';
        data_div.appendChild(data_table);
        let cv = document.createElement('canvas');
        tiempos_td.appendChild(cv);
        this._append(this.summary_div, [title_div, data_div]);
        new Graphics().drawBarChart(cv.getContext('2d'), data.chart);
    }


    /* Grafica de progreso */
    createProgress(time) {
        this._clearChilds(this.progress_div);
        let cv = document.createElement('canvas');
        cv.width = 1000;
        cv.height = 200;
        this.progress_div.appendChild(cv);
        new Graphics().drawLineChart(cv, time);
    }

    _createStates() {
        // Botones navegation
        let navigation_div = document.createElement('div');
        navigation_div.classList.add('div-nav', 'div-states');
        let prev = document.createElement('button');
        prev.textContent = 'Anterior';
        prev.addEventListener('click', () => {
            this.previousStateEvent.trigger();
        });
        let next = document.createElement('button');
        next.textContent = 'Siguiente';
        next.addEventListener('click', () => {
            this.nextStateEvent.trigger();
        });
        this._append(navigation_div, [prev, next]);
        // Tabla estados
        let state_div = document.createElement('div');
        state_div.classList.add('div-states');
        let state_table = document.createElement('table');
        state_table.id = 'state_table';
        state_div.appendChild(state_table);
        this._append(this.states_div,[navigation_div, state_div]
        ); 
    }


    // Elementos para mostrar un estado (comunes)
    showState(data) {
        let state = data.state;
        let s_table = document.getElementById('state_table');
        this._clearChilds(s_table);
        this._addBinaryRowText(s_table, 'Time: ', `${state.time} ut.`);
        // runrun
        let rr_td = this._addBinaryRow(s_table, 'runrun: ');
        let rr_div = document.createElement('div');
        rr_div.classList.add('array-queue');
        rr_td.appendChild(rr_div);
        if (state.runrun)
            rr_div.classList.add('array-queue-1');
        else
            rr_div.classList.add('array-queue-0');

        // Campos especificos (colas y bitmap)
        if (data.name == 'SVR3') 
            this._showSvr3State(state);
        else if (data.name == 'SVR4')
            this._showSvr4State(state);
        
        // Tabla de procesos
        if (state.pTable.length > 0) {
            let pt_td = this._addBinaryRow(s_table, 'Tabla de \nprocesos: ');
            this._displayProcessTable(state.pTable, data.info, pt_td);
        }
        
        // Tablas de clase (SVR4)
        if (data.name == 'SVR4') { 
            if (data.rt_data.rt.length > 0) {
                let rt_td = this._addBinaryRow(s_table, 'Procesos \nRealTime: ');
                this._showSvr4ClassDepent(data.rt_data.rt, data.rt_info, rt_td, state.pTable);
            }
            if (data.ts_data.ts.length > 0) {
                let ts_td = this._addBinaryRow(s_table, 'Procesos \nTimeSharing: ');
                this._showSvr4ClassDepent(data.ts_data.ts, data.ts_info, ts_td, state.pTable);
            }
        }
        // Eventos
        let ev_td = this._addBinaryRow(s_table, 'Eventos: ');
        state.journal.forEach(entry => {
            let li = document.createElement('li');
            li.classList.add('event_li');
            li.innerHTML = entry;
            ev_td.appendChild(li);
        });   
    }
   
    // Elementos para mostrar un estado de SVR3
    _showSvr3State(state) {
        let s_table = document.getElementById('state_table');
        // whichqs
        let wq_td = this._addBinaryRow(s_table, 'whichqs: ');
        let aq_table = document.createElement('table');
        wq_td.appendChild(aq_table);
        this._showArrayQueue(state.whichqs, aq_table, '', 0, 31);   
        // qs
        if (state.qs.length > 0) {
            let qs_td = this._addBinaryRow(s_table, 'qs: ');
            this._fillPriorityQueue(qs_td, state.qs, 'SVR3');
        }
    }

    // Elementos para mostrar un estado de SVR4
    _showSvr4State(state) {
        let s_table = document.getElementById('state_table');
        // kprunrun
        let krr_td = this._addBinaryRow(s_table, 'kprunrun: ');
        let krr_div = document.createElement('div');
        krr_div.classList.add('array-queue');
        krr_td.appendChild(krr_div);
        if (state.kprunrun)
            krr_div.classList.add('array-queue-1');
        else
            krr_div.classList.add('array-queue-0');

        //dqactmap
        let dq_td = this._addBinaryRow(s_table, 'dqactmap: ');
        let aq_table = document.createElement('table');
        dq_td.appendChild(aq_table);
        this._showArrayQueue(state.dqactmap, aq_table, 'TimeSharing: ', 0, 59);
        this._showArrayQueue(state.dqactmap, aq_table, 'Kernel: ', 60, 99);
        this._showArrayQueue(state.dqactmap, aq_table, 'RealTime: ', 100, 159);
        // dispq
        if (state.dispq.length > 0) {
            let dp_td = this._addBinaryRow(s_table, 'dispq: ');
            this._fillPriorityQueue(dp_td, state.dispq, 'SVR4');    
        }
    }


    // Muestra los datos dependientes de la clase 
    _showSvr4ClassDepent(state, info, domElement, pTable) {
        let table = document.createElement('table');
        table.classList.add('classTable');
        domElement.appendChild(table);
        let tbody = table.createTBody();
        // Table heads
        let row1 = tbody.insertRow();
        row1.classList.add('main_classTable_row');
        let row2 = tbody.insertRow();
        row2.classList.add('sub_classTable_row');
        for (let key of Object.keys(state[0])) {
            let td1 = document.createElement('td');
            td1.classList.add('main_classTable_th');
            td1.colSpan = Object.keys(state[0][key]).length;
            if (td1.colSpan > 1) {
                let c = 0;
                for (let subkey of Object.keys(state[0][key])) {
                    c++;
                    let td2 = document.createElement('td');
                    td2.classList.add('th_tooltip','sub_classTable_th');
                    if (c == td1.colSpan)
                        td2.classList.add('rightBorder_td');
                    td2.appendChild(document.createTextNode(subkey));
                    let sp = document.createElement('span');
                    sp.classList.add('th_tooltip_text');
                    sp.textContent = info[subkey];
                    td2.appendChild(sp);
                    row2.appendChild(td2)
                }
            }
            if (key == 'p_pid')
                td1.rowSpan = 2;
            td1.appendChild(document.createTextNode(key));
            row1.appendChild(td1);
        }

        // Table data
        state.forEach(pr => {
            let r = tbody.insertRow();
            // formato de la fila
            pTable.forEach(p => {
                if (p.p_pid == pr.p_pid)
                    this._setRowClass(r, p.p_state);
            });
            for (let item in pr) {
                if (Object.keys(pr[item]).length == 0) {
                    let td = document.createElement('td');
                    td.classList.add('rightBorder_td');
                    td.appendChild(document.createTextNode(pr[item]));
                    r.appendChild(td);
                } else {
                    let c = 0;
                    for (let key of Object.keys(pr[item])) {
                        c++;
                        let td = document.createElement('td');
                        td.appendChild(document.createTextNode(pr[item][key]));
                        if (c == Object.keys(pr[item]).length) 
                            td.classList.add('rightBorder_td');
                        r.appendChild(td);
                    }
                }
            }
        });
    }

    // Muestra la tabla resumen
    /*
    _createSummaryTable(domElement, data) {
        if (data.length > 0) {
            let table = document.createElement('table');
            table.id = 'summary_table';
            table.classList.add('plain_table');
            // Head
            let thead = table.createTHead();
            thead.classList.add('plain_table-th');
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
                row.classList.add('plain_table-row');
                for (let item in pr) {
                    let tb = document.createElement('td');
                    tb.appendChild(document.createTextNode(pr[item]));
                    row.appendChild(tb);
                }
            });
            domElement.appendChild(table);
        }
    }
    */

    // Muestra la tabla de procesos en la vista Añadir proceso
    _createAddTable(domElement, pTable) {
        this._clearChilds(domElement);
        // Table head
        let thead = domElement.createTHead();
        thead.classList.add('plain_table-th');
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
        let tbody = domElement.createTBody();
        pTable.forEach(pr => {
            let row = tbody.insertRow();
            row.classList.add('plain_table-row');
            for (let item in pr) {
                let tb = document.createElement('td');
                tb.appendChild(document.createTextNode(pr[item]));
                row.appendChild(tb)
            }
        });
    }


    /* Funciones auxiliares */

    // Crea un objeto para añadir datos numericos y lo devuelve
    _addInput(domElement, text) {
        let item = this._createInputAddTable(domElement, text);
        let input = document.createElement('input');
        input.classList.add('inputValue_input');
        input.type = 'number';
        input.required = true;
        input.placeholder = 0;
        item.appendChild(input);
        return input;
    }

    _createInputAddTable(domElement, text) {
        let table = document.createElement('table');
        table.classList.add('input_table');
        let row = table.insertRow();
        let tda = document.createElement('td');
        tda.classList.add('inputText_td');
        tda.appendChild(document.createTextNode(text));
        let tdb = document.createElement('td');
        tdb.classList.add('inputValue_td');
        this._append(row, [tda, tdb]);
        domElement.appendChild(table);
        return tdb;
    }


    _showArrayQueue(data, table, text, start, end) {
        let row = table.insertRow();
        if (text) {
            let td_txt = document.createElement('td');
            td_txt.classList.add('table-italic');
            td_txt.appendChild(document.createTextNode(text));
            row.appendChild(td_txt);
        }
        let td_data = document.createElement('td');
        row.appendChild(td_data);

        for (let i=start; i<=end; i++) {
            let d = document.createElement('div');
            d.classList.add('array-queue');
            let sp = document.createElement('span');
            sp.classList.add('tooltip-text');
            sp.textContent = i;
            d.appendChild(sp);
            if (data.find(n => n == i))
                d.classList.add('array-queue-1');
            else
                d.classList.add('array-queue-0');
            
            td_data.appendChild(d);
        }
    }

    _setRowClass(row, state) {
        switch (state) {
            case 'running_user':
                row.classList.add('pr_run_user', 'row_ptable');
                break;
            case 'running_kernel':
                row.classList.add('pr_run_kernel', 'row_ptable');
                break;
            case 'sleeping':
                row.classList.add('pr_sleeping', 'row_ptable');
                break;
            case 'zombie':
                row.classList.add('pr_zombie', 'row_ptable');
                break;
            default:
                row.classList.add('pr_ready', 'row_ptable');
        }
    }


    _displayProcessTable(pTable, info, domElement) {
        // Crea la tabla
        let table = document.createElement('table');
        table.classList.add('colored_table');
        domElement.appendChild(table);
        // Table head
        let thead = table.createTHead();
        thead.classList.add('plain_table-th');
        let row = thead.insertRow();
        let data = Object.keys(pTable[0]);
        for (let key of data) {
            let th = document.createElement('th');
            th.classList.add('th_tooltip', 'th_ptable');
            th.appendChild(document.createTextNode(key));
            let sp = document.createElement('span');
            sp.classList.add('th_tooltip_text');
            sp.textContent = info[key];
            th.appendChild(sp);
            row.appendChild(th);
        }
        // Table Data
        let tbody = table.createTBody();
        pTable.forEach(pr => {
            let row = tbody.insertRow();
            this._setRowClass(row, pr.p_state);
            for (let item in pr) {
                let tb = document.createElement('td');
                tb.appendChild(document.createTextNode(pr[item]));
                row.appendChild(tb)
            }
        });
    }

    // Añade una fila a la tabla con tupla de texto
    _addBinaryRowText(table, text, data) {
        let row = table.insertRow();
        let td_t = document.createElement('td');
        td_t.classList.add('state-left');
        td_t.appendChild(document.createTextNode(text));
        let td_d = document.createElement('td');
        td_d.classList.add('state-right');
        td_d.appendChild(document.createTextNode(data));
        this._append(row, [td_t, td_d]);
    }

    // Añade una fila a la tabla solo con texto, devuelve la segunda columna
    _addBinaryRow(table, text) {
        let row = table.insertRow();
        let td_t = document.createElement('td');
        td_t.classList.add('state-left');
        td_t.appendChild(document.createTextNode(text));
        let td_d = document.createElement('td');
        td_d.classList.add('state-right');
        this._append(row, [td_t, td_d]);
        return td_d;
    }

    _fillPriorityQueue(domElement, data, name) {
        let table = document.createElement('table');
        let img_path = './resources/bi_arrow_15.png';

        data.forEach(item => {
            let row = table.insertRow();
            // Cola
            let td_t = document.createElement('td');
            let pri = item.priority;
            if (name == 'SVR3') 
                pri = `${item.priority*4} - ${((item.priority*4)+4)}`;
            
            td_t.appendChild(document.createTextNode(pri));
            td_t.classList.add('priorityQueueNumber');
            let td_a = document.createElement('td');
            item.items.forEach(pr => {
                // Flecha
                let da = document.createElement('div');
                da.classList.add('priorityQueue_div');
                let bi_arrow = document.createElement('img');
                bi_arrow.src = img_path;
                da.appendChild(bi_arrow);
                // PID
                let dt = document.createElement('div');
                dt.classList.add('priorityQueue_div');
                dt.appendChild(document.createTextNode(pr.p_pid));
                this._append(td_a, [da, dt]);
            });
            this._append(row, [td_t, td_a]);
        });
        domElement.appendChild(table);
    }

    pTableChanged(pTable) {
        if(pTable.length > 0) {
            document.getElementById('start_div').style.display = 'block';
            this._createAddTable(document.getElementById('addTable'), pTable);
        }
    }

    // Añade varios elementos al padre
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