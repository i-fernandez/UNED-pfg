import Event from '../util/event.js';
import Graphics from './graphics.js';

class View {
    constructor() {
        // Eventos
        this.newFCFSEvent = new Event();
        this.newSJFEvent = new Event();
        this.newRREvent = new Event();
        this.newPRIEvent = new Event();
        this.newSVR3Event = new Event();
        this.newSVR4Event = new Event();
        this.addProcessEvent = new Event();       
        this.startSimulationEvent = new Event();
        this.nextStateEvent = new Event();
        this.previousStateEvent = new Event();
        // Diagramas
        this.charts = new Graphics();
    }

    /* Elementos iniciales */
    render() {
        // Cabecera inicial
        let header_div = document.createElement('div');
        header_div.id = 'header_div';
        let logo = document.createElement('img');
        logo.src = './resources/uned_etsi_60.png';
        logo.classList.add('image-right');
        header_div.appendChild(logo);

        // Menu de navegacion
        let header_menu_div = document.createElement('div');
        header_menu_div.id = 'header_menu_div';
        header_menu_div.style.display = 'none';

        // Bienvenida inicial
        let init_div = document.createElement('div');
        init_div.id = 'init_div';
        init_div.classList.add('div-main');

        // Añadir proceso 
        let addproc_div = document.createElement('div');
        addproc_div.id = 'addproc_div';
        addproc_div.classList.add('div-main');
        addproc_div.style.display = 'none';

        // Explorador de estados
        let states_div = document.createElement('div');
        states_div.id = 'states_div';
        states_div.classList.add('div-main');
        states_div.style.display = 'none';

        // Progreso de la ejecucion
        let progress_div = document.createElement('div');
        progress_div.id = 'progress_div';
        progress_div.classList.add('div-main');
        progress_div.style.display = 'none';

        // Resumen de la ejecucion
        let summary_div = document.createElement('div');
        summary_div.id = 'summary_div';
        summary_div.classList.add('div-main');
        summary_div.style.display = 'none';
        
        this._append(document.body, 
            [header_div, header_menu_div, init_div, addproc_div, 
            summary_div, progress_div, states_div]
        );
        // Selector de algoritmo
        this._schedulerSelector();
        // Bienvenida
        this._createWellcome();
    }

    /* Crea los elementos del selector de algoritmo */
    _schedulerSelector() {
        let header_div = document.getElementById('header_div');
        let sch_selector = document.createElement('ul');
        sch_selector.classList.add('header-menu-ul-center');
        let sel_svr3 = document.createElement('li');
        sel_svr3.textContent = 'SVR 3';
        sel_svr3.classList.add('header-menu-li');
        sel_svr3.addEventListener('click', event => {
            this._clickAlgorithm();
            sel_svr3.classList.add('header-menu-sel');
            this._createSvr3Add();
            this.newSVR3Event.trigger();
        });
        let sel_svr4 = document.createElement('li');
        sel_svr4.textContent = 'SVR 4';
        sel_svr4.classList.add('header-menu-li');
        sel_svr4.addEventListener('click', event => {
            this._clickAlgorithm();
            sel_svr4.classList.add('header-menu-sel');    
            this._createSvr4Add();
            this.newSVR4Event.trigger();
        });
        let sel_fcfs = document.createElement('li');
        sel_fcfs.textContent = 'FCFS';
        sel_fcfs.classList.add('header-menu-li');
        sel_fcfs.addEventListener('click', event => {
            this._clickAlgorithm();
            sel_fcfs.classList.add('header-menu-sel');
            this._createAddForm();
            this.newFCFSEvent.trigger();
        });
        let sel_sjf = document.createElement('li');
        sel_sjf.textContent = 'SJF';
        sel_sjf.classList.add('header-menu-li');
        sel_sjf.addEventListener('click', event => {
            this._clickAlgorithm();
            sel_sjf.classList.add('header-menu-sel');
            this._createAddForm();
            this.newSJFEvent.trigger();
        });
        let sel_rr = document.createElement('li');
        sel_rr.textContent = 'RR';
        sel_rr.classList.add('header-menu-li');
        sel_rr.addEventListener('click', event => {
            this._clickAlgorithm();
            sel_rr.classList.add('header-menu-sel');
            this._createAddForm();
            this.newRREvent.trigger();
        });
        let sel_pri = document.createElement('li');
        sel_pri.textContent = 'PRI';
        sel_pri.classList.add('header-menu-li');
        sel_pri.addEventListener('click', event => {
            this._clickAlgorithm();
            sel_pri.classList.add('header-menu-sel');
            this._createAddForm(true);
            this.newPRIEvent.trigger();
        });

        this._append(sch_selector, 
            [sel_fcfs, sel_sjf, sel_rr, sel_pri, sel_svr3, sel_svr4]);
        header_div.appendChild(sch_selector);
    }

    /* Crea los elementos de la bienvenida inicial */
    _createWellcome() {
        let init_div = document.getElementById('init_div');
        let title = document.createElement('h1');
        title.classList.add('text');
        title.textContent = 'Simulador de algoritmos de planificación de procesos';
        let description = document.createElement('p');
        description.textContent = 'Seleccione un algoritmo de planificación para empezar...';
        this._append(init_div, [title, description]);
    }

    /* Algoritmo seleccionado */
    _clickAlgorithm() {
        this._clearChilds(addproc_div);
        this._addProcess();

        let menu_items = document.getElementsByClassName('header-menu-li');
        Array.prototype.forEach.call(menu_items, function(i) {
            i.classList.remove('header-menu-sel');
        });

        addproc_div.style.display = 'inherit';
        init_div.style.display = 'none';
        header_menu_div.style.display = 'none';
        states_div.style.display = 'none';
        summary_div.style.display = 'none';
        progress_div.style.display = 'none';
    }


    /* Crea los elementos de añadir proceso (comunes) */
    _addProcess() {
        let addTitle = document.createElement('h1');
        addTitle.textContent = 'Añadir proceso';
        addTitle.classList.add('text');
        let formDiv = document.createElement('div');        
        formDiv.id = 'inputform_div'
        // Formulario de entrada
        let addForm = document.createElement('form');
        addForm.id = 'add_form';
        formDiv.appendChild(addForm);        
        // Tabla de procesoso añadidos
        let addTable = document.createElement('table');
        addTable.id = 'addTable';
        addTable.classList.add('plain_table');
        // Iniciar simulacion
        let start_div = document.createElement('div');
        start_div.id = 'start_div';
        start_div.classList.add('high_margin','div-states');
        start_div.style.display = 'none';
        let startButton = document.createElement('button');
        startButton.textContent = 'Simular';
        startButton.addEventListener('click', () => {
            this._startSimulation();
        });
        start_div.appendChild(startButton);
        this._append(addproc_div, [addTitle, formDiv, addTable, start_div]);
    }

    /* Muestra la tabla de procesos (vista añadir proceso) */
    showProcessTable(pTable) {
        let table = JSON.parse(pTable);
        if (table.length > 0) {
            let addTable = document.getElementById('addTable');
            this._clearChilds(addTable);
            document.getElementById('start_div').style.display = 'block';
            // Table head
            let thead = addTable.createTHead();
            thead.classList.add('plain_table-th');
            let row = thead.insertRow();
            let data = Object.keys(table[0]);
            for (let key of data) {
                let th = document.createElement('th');
                th.classList.add('th_ptable');
                th.appendChild(document.createTextNode(key));
                row.appendChild(th);
            }
            // Table Data
            let tbody = addTable.createTBody();
            table.forEach(pr => {
                let row = tbody.insertRow();
                row.classList.add('plain_table-row');
                for (let item in pr) {
                    let tb = document.createElement('td');
                    tb.appendChild(document.createTextNode(pr[item]));
                    row.appendChild(tb)
                }
            }); 
        }
    }

    /* Comienzo de la simulacion */
    _startSimulation() {
        addproc_div.style.display = 'none';
        summary_div.style.display = 'inherit';
        header_menu_div.style.display = 'inherit';
        this._navigationMenu();
        this._createStates();
        this.startSimulationEvent.trigger();
    }

    /* Elementos para añadir un proceso 
       Prioridad, t.ejecucion, cpu, io, clase */
    _createAddForm(pri, pClass) {
        let form = document.getElementById('add_form');
        form.addEventListener('submit', event => {
            event.preventDefault();
            this.addProcessEvent.trigger(this._getInput());
            this._resetInput();
        });

        if (pClass) {
            let cs_table = this._createInputAddTable(form, 'Clase');
            let classSel = document.createElement('select');
            classSel.id = 'class_sel';
            let option_rt = document.createElement('option');
            option_rt.value = '1';
            option_rt.innerHTML = 'Real Time';
            let option_ts = document.createElement('option');
            option_ts.value = '2';
            option_ts.innerHTML = 'Time Sharing';
            this._append(classSel, [option_rt, option_ts]);
            cs_table.appendChild(classSel);

        }

        if (pri) {
            let inputPriority = this._addInput(form, 'Prioridad');
            inputPriority.id = 'inputPriority';
            inputPriority.placeholder = '1-100';
            inputPriority.min = 1;
            inputPriority.max = 100;
        }
        
        let inputBurst = this._addInput(form, 'T. ejecución');
        inputBurst.id = 'inputBurst';
        let inputCPU = this._addInput(form, 'Ciclo CPU');
        inputCPU.id = 'inputCPU';
        let inputIO = this._addInput(form, 'Ciclo IO');
        inputIO.id = 'inputIO';
        let addButton = document.createElement('button');
        addButton.textContent = 'Agregar';
        form.appendChild(addButton);
    }


    /* Elementos adicionales para añadir proceso SVR3 */
    _createSvr3Add() {
        this._createAddForm(true);
        let inputPriority = document.getElementById('inputPriority')
        inputPriority.placeholder = '50-127';
        inputPriority.min = 50;
        inputPriority.max = 127;
    }

    /* Elementos para añadir proceso SVR4 */
    _createSvr4Add() {
        this._createAddForm(true, true);
        let inputPriority = document.getElementById('inputPriority')
        inputPriority.placeholder = '100-159';
        inputPriority.min = 100;
        inputPriority.max = 159;
        let classSel = document.getElementById('class_sel');
        classSel.addEventListener('change', event => {
            if (classSel.value == 1) {
                inputPriority.placeholder = '100-159';
                inputPriority.min = 100;
                inputPriority.max = 159;
            } else if (classSel.value ==  2) {
                inputPriority.placeholder = '0-59';
                inputPriority.min = 0;
                inputPriority.max = 59;
            }
        });
    }

    /* Devuelve los datos del formulario  */
    _getInput() {
        let data = {
            execution: parseInt(document.getElementById('inputBurst').value, 10),
            cpu_burst: parseInt(document.getElementById('inputCPU').value, 10),
            io_burst: parseInt(document.getElementById('inputIO').value, 10)
        }
        let pri = document.getElementById('inputPriority');
        if (pri) { data.pri = parseInt(pri.value, 10); }
        let class_sel = document.getElementById('class_sel');
        if (class_sel) {
            let pc = 'RealTime'
            if (class_sel.value == 2) {pc = 'TimeSharing';}
            data.pClass = pc;
        }
        // Convierte a JSON
        return JSON.stringify(data);
    }

    /* Restablece los valores de los elementos 'input' */
    _resetInput() {
        let items = document.getElementsByClassName('inputValue_input');
        Array.prototype.forEach.call(items, function(i) {i.value = ''});
    }

    

    /* Simulacion */

    /* Crea el menu de navegacion */
    _navigationMenu() {
        let header_menu_div = document.getElementById('header_menu_div');
        this._clearChilds(header_menu_div);
        let nav_menu = document.createElement('ul');
        nav_menu.classList.add('states-menu-ul');
        let summary_li = document.createElement('li');
        summary_li.id = 'summary_li';
        summary_li.textContent = 'RESUMEN';
        summary_li.classList.add('states-menu-li','states-menu-li-sel');
        summary_li.addEventListener('click', event => {
            summary_li.classList.add('states-menu-li-sel');
            states_li.classList.remove('states-menu-li-sel');
            progress_li.classList.remove('states-menu-li-sel');
            summary_div.style.display = 'inherit';
            progress_div.style.display = 'none';
            states_div.style.display = 'none';
        });
        let progress_li = document.createElement('li');
        progress_li.id = 'progress_li';
        progress_li.textContent = 'PROGRESO';
        progress_li.classList.add('states-menu-li');
        progress_li.addEventListener('click', event => {
            progress_li.classList.add('states-menu-li-sel');
            summary_li.classList.remove('states-menu-li-sel');
            states_li.classList.remove('states-menu-li-sel');
            progress_div.style.display = 'inherit';
            states_div.style.display = 'none';
            summary_div.style.display = 'none';
        });
        let states_li = document.createElement('li');
        states_li.id = 'states_li';
        states_li.textContent = 'ESTADOS';
        states_li.classList.add('states-menu-li');
        states_li.addEventListener('click', event => {
            states_li.classList.add('states-menu-li-sel');
            summary_li.classList.remove('states-menu-li-sel');
            progress_li.classList.remove('states-menu-li-sel');
            states_div.style.display = 'inherit';
            progress_div.style.display = 'none';
            summary_div.style.display = 'none';
        }); 
        this._append(nav_menu, [summary_li, progress_li, states_li]);
        header_menu_div.appendChild(nav_menu);
    }

    /* Apartado Resumen */
    createSummary(summary) {
        let summary_div = document.getElementById('summary_div');
        this._clearChilds(summary_div);
        let data = JSON.parse(summary);
        let title_div = document.createElement('div');
        title_div.classList.add('div-states');
        let title = document.createElement('h1');
        title.textContent = 'Resumen de la simulacion';
        title.classList.add('text');
        title_div.appendChild(title);
        let data_div = document.createElement('div');
        data_div.classList.add('div-states');
        let data_table = document.createElement('table');
        this._addBinaryRowText(data_table, 'Duración del tick: ', `${data.tick} ut.`);
        this._addBinaryRowText(data_table, 'Duracion del cambio de contexto: ', `${data.cs_duration} ut. `);
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
        this._append(summary_div, [title_div, data_div]);
        if (data.name == 'SVR3' || data.name == 'SVR4')
            this.charts.drawBarChart(cv.getContext('2d'), data.chart);
        else
            this.charts.drawSimpleBarChart(cv.getContext('2d'), data.chart);
    }

    /* Apartado Progreso */
    createProgress(data) {
        let progress_div = document.getElementById('progress_div');
        this._clearChilds(progress_div);
        let cv = document.createElement('canvas');
        cv.width = 1000;
        cv.height = 200;
        progress_div.appendChild(cv);
        let prData = JSON.parse(data);
        if (prData.name == 'SVR3' || prData.name == 'SVR4')
            this.charts.drawLineChart(cv.getContext('2d'), prData);
        else
            this.charts.drawSimpleLineChart(cv.getContext('2d'), prData);
    }

    /* Apartado Estados */
    _createStates() {
        let states_div = document.getElementById('states_div');
        this._clearChilds(states_div);
        // Botones navegation
        let navigation_div = document.createElement('div');
        navigation_div.classList.add('div-nav', 'div-states');
        //this._clearChilds(navigation_div);
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
//        let states_div = document.getElementById('states_div');
        this._append(states_div,[navigation_div, state_div]
        );

        // Muestra el primer estado
        //this.showState(data);
    }

    /* Muesta un estado */
    showState(state_data) {
        let data = JSON.parse(state_data);
        let state = data.state;
        let s_table = document.getElementById('state_table');
        this._clearChilds(s_table);
        this._addBinaryRowText(s_table, 'Time: ', `${state.time} ut.`);
        // runrun
        if (data.name == 'SVR3' || data.name == 'SVR4') {
            let rr_td = this._addBinaryRow(s_table, 'runrun: ');
            let rr_div = document.createElement('div');
            rr_div.classList.add('array-queue');
            rr_td.appendChild(rr_div);
            if (state.runrun)
                rr_div.classList.add('array-queue-1');
            else
                rr_div.classList.add('array-queue-0');
        }
        // Campos especificos (colas y bitmap)
        if (data.name == 'SVR3') 
            this._showSvr3State(state);
        else if (data.name == 'SVR4')
            this._showSvr4State(state);
        else if (data.name == 'PRI')
            this._showPriState(state);
        else    
            this._showGenericState(state);

        
        // Tabla de procesos
        if (state.pTable.length > 0) {
            let pt_td = this._addBinaryRow(s_table, 'Tabla de \nprocesos: ');
            this._displayProcessTable(state.pTable, data.pt_info, pt_td);
        }
        
        // Tablas de clase (SVR4)
        if (data.name == 'SVR4') { 
            if (state.rt_data.length > 0) {
                let rt_td = this._addBinaryRow(s_table, 'Procesos \nRealTime: ');
                this._showSvr4ClassDepent(state.rt_data, data.rt_info, rt_td, state.pTable);
            }
            if (state.ts_data.length > 0) {
                let ts_td = this._addBinaryRow(s_table, 'Procesos \nTimeSharing: ');
                this._showSvr4ClassDepent(state.ts_data, data.ts_info, ts_td, state.pTable);
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

    /* Muestra un estado generico */
    _showGenericState(state) {
        let s_table = document.getElementById('state_table');
        let q_td = this._addBinaryRow(s_table, 'Queue: ');
        if (state.queue.items.length > 0)    
            this._fillQueue(q_td, state.queue.items);
        
    }
   
    /* Muestra un estado de planificador con Prioridades */
    _showPriState(state) {
        let s_table = document.getElementById('state_table');

    }

    /* Muestra un estado de SVR3 */
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

    /* Muestra un estado de SVR4 */
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

    /* Muestra los datos dependientes de la clase (SVR4)  */
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


    /* Funciones auxiliares */

    /* Crea un objeto tipo input para añadir datos numericos y lo devuelve */
    _addInput(domElement, text) {
        let item = this._createInputAddTable(domElement, text);
        let input = document.createElement('input');
        input.classList.add('inputValue_input');
        input.type = 'number';
        input.required = true;
        input.placeholder = 0;
        input.min = 0;
        item.appendChild(input);
        return input;
    }

    /* Crea una tabla para datos de entrada y devuelve la segunda columna */
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

    /* Muestra un bitmap de colas de prioridad */
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

    /* Establece la clase de una fila segun el estado */
    _setRowClass(row, state) {
        switch (state) {
            case 'running':
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

    /* Muestra una tabla de procesos */
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

    /* Añade una fila a la tabla con tupla de texto */
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

    /* Añade una fila a la tabla solo con texto, devuelve la segunda columna */
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

    /* Rellena la cola de prioridad con los procesos */
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
                dt.appendChild(document.createTextNode(pr));
                this._append(td_a, [da, dt]);
            });
            this._append(row, [td_t, td_a]);
        });
        domElement.appendChild(table);
    }

    /* Rellena la cola de procesos con sus datos */
    _fillQueue(domElement, data) {
        let img_path = './resources/left_arrow_15.png';
        // Queue head
        let dh = document.createElement('div');
        dh.classList.add('queueArrow_div');
        let hArrow = document.createElement('img');
        hArrow.src = img_path;
        dh.appendChild(hArrow);
        domElement.appendChild(dh);
        // Queue data
        data.forEach(pr => {
            let dp = document.createElement('div');
            dp.classList.add('queue_div');
            dp.appendChild(document.createTextNode(pr));
            domElement.appendChild(dp);
        });
        // Queue tail
        let dt = document.createElement('div');
        dt.classList.add('queueArrow_div');
        let tArrow = document.createElement('img');
        tArrow.src = img_path;
        dt.appendChild(tArrow);
        domElement.appendChild(dt);
    }

    /* Añade varios elementos al padre */
    _append(parent, elements) {
        elements.map(i => parent.appendChild(i));
    }

    /* Limpia todos los hijos de un elemento */
    _clearChilds(domElement) {
        while (domElement.firstChild) {
            domElement.removeChild(domElement.firstChild);
        }
    }
}

export default View;
