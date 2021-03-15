import PriorityQueue from './priorityqueue.js'
import Svr4RT from './srv4RT.js'
import Svr4TS from './svr4TS.js'

class Svr4Scheduler {
    constructor(stateManager) {
        // constantes
        this.CONTEXT_SWITCH = 10;
        this.TICK = 10;

        this.name = "SVR4";
        this.stateManager = stateManager;
        this.time = 0;
        this.dqactmap = [];
        this.dispq = [];
        this.processTable = [];
        this.runrun = false;
        this.kprunrun = false;
        this.contextSwitchCount = 0;
        this.inContextSwitch = false;
        this.inRoundRobin = false;
        this.journal = [];
        this.running = "";
    }

    addProcess(data) {
        let pr = new Svr4Process(
            this, this.processTable.length+1, data.execution, data.cpu_burst, 
            data.io_burst, data.pClass, data.pri
        );
        this.processTable.push(pr);
        this.setBackDQ(pr);
    }

    // Añade un proceso al inicio de la cola (proceso expropiado)
    _setFrontDQ(process) {
        let qn = process.p_pri;
        this._setDqactmap(qn);
        let queue = this.dispq.find(item => item.priority == qn);
        if (queue)
            queue.addFront(process);
        else
            this.dispq.push(new PriorityQueue(qn, process));

        this._sortDispq();
    }

    // Añade un proceso al final de la cola (nuevo proceso)
    setBackDQ(process) {
        let qn = process.p_pri;
        this._setDqactmap(qn);
        let queue = this.dispq.find(item => item.priority == qn);
        if (queue)
            queue.enqueue(process);
        else
            this.dispq.push(new PriorityQueue(qn, process));

        this._sortDispq();
    }

    _setDqactmap(qn) {
        if (!(this.dqactmap.includes(qn))) {
            this.dqactmap.push(qn);
        }
        this.dqactmap.sort(function(a, b) { return a - b;});
    }

    // Ordena el array disqp
    _sortDispq () {
        this.dispq.sort(function (a, b) {
            if (a.priority > b.priority)
                return 1;
            if (a.priority < b.priority)
                return -1;
            return 0;
        });
    }

    // Elige un proceso para ser planificado y lo desencola
    dequeueProcess() {
        let qn = this.dqactmap[this.dqactmap.length-1];
        let queue = this.dispq.find(item => item.priority == qn);
        if (queue) {
            let pr = queue.dequeue();
            if (queue.isEmpty()) {
                this.dqactmap.pop();
                this.dispq.pop();
            }
            return pr;
        }
    }

    // Muestra el proximo proceso para ejecutarse, sin desencolarlo
    _getNextProcess() {
        let queue = this.dispq.find(item => item.priority == this.dqactmap[this.dqactmap.length-1]);
        if (queue) {
            return queue.front();
        }
    }

    start() {
        this.journal.push("Inicio de la ejecucion");
        let pr = this.dequeueProcess();
        this.running = pr;
        pr.startRun();
        this.journal.push("Proceso " + pr.p_pid + " cargado para ejecucion");
        this._sendState();
    }

    getPTable() {
        let pTable = [];
        this.processTable.forEach(pr => {pTable.push(pr.getData());});
        return pTable;
    }

    nextTick() {
        this.time += this.TICK;
        let sleeping_pr  = this.processTable.filter(pr => pr.p_state == "sleeping");

        // Actualiza los procesos
        this.processTable.forEach (pr => {
            let out = pr.runTick();
            if (out)
                this.journal.push(out);
        });
        // Actualiza el proceso en ejecucion
        if (this.running.p_state != "running_user" && this.running.p_state != "running_kernel")
            this.running = "";  

        if (this.inContextSwitch)
            // Finaliza el cambio de contexto
            this._swtch();

        // Encola procesos que finalizaron IO
        sleeping_pr.forEach(pr => {
            if (pr.p_state != "sleeping") 
                this.setBackDQ(pr);
        });
                    
        // Comprueba si empieza un cambio de contexto
        this._startSwtch();

        // Encola procesos cuya prioridad ha cambiado
        //this._reQueue();

        this._sendState();

    }

    _swtch() {
        this.runrun = false;
        this.kprunrun = false;
        this.inContextSwitch = false;
        // Proximo proceso a ejecutar
        let next_pr = this.dequeueProcess();
        if (next_pr == null) 
            return;
        
        this.contextSwitchCount++;
        next_pr.startRun();
        this.running = next_pr;
        this.journal.push("Proceso " + next_pr.p_pid + " cargado para ejecucion. ");
    }

    _startSwtch() {
        //let running = this._getRunningProcess();
        let n = this._getNextProcess();
        // No hay ningun proceso en ejecucion 
        if (!(this.running) && this.dqactmap.length > 0) {
        //if (typeof running === 'undefined' && this.dqactmap.length > 0) {
            this.journal.push("Rutina swtch selecciona al proceso " + n.p_pid + " para su ejecución. ");
            this.inContextSwitch = true;
        }
        // Proceso encolado con mayor prioridad y actual no esta en modo kernel
        //else if (typeof running !== 'undefined' && 
        //    this.dqactmap[this.dqactmap.length-1] > running.p_pri &&
        // 
        else if (this.running && this.dqactmap[this.dqactmap.length-1] >this.running.p_pri){
            if (this.running.p_state == "running_kernel") {
                // Proceso con llamada al sistema
                this.runrun = true;
                this.journal.push("Proceso " + n.p_pid + " encolado con mayor prioridad. " + 
                    "Esperando finalizacion de llamada al sistema.")
            } else {
                this.journal.push("CPU expropiada debido a proceso " + 
                    this.dispq[this.dispq.length-1].front().p_pid);
                this.inContextSwitch = true;
                this.running.p_state = "ready";
                this._setFrontDQ(this.running);
            }
        }    
        // Round robin
        else if (this.inRoundRobin) {
            this.journal.push("CPU expropiada debido a rutina roundrobin. ");
            this.inRoundRobin = false;
            this.inContextSwitch = true;
            this.running.p_state = "ready";
            this.setBackDQ(this.running);
        }
    }

    // Comprueba si round robin produce un cambio de contexto
    roundRobin() {
        if (this.dqactmap.find(item => item == this.running.p_pri))
            this.inRoundRobin = true;
        else
            this.running.resetQuantum();
    }

    /*
    // Reencola procesos ready cuya prioridad ha cambiado
    _reQueue() {
        
        let procesos = this.processTable.filter(pr => pr.p_state == "ready" && pr.changePriority == "true");
        procesos.forEach(pr => {
            console.log("_reQueue:  WTF");

            pr.changePriority = false;
            // Elimina el  proceso de la cola actual
            // Hay que buscar en todas las colas
            let queue = this.qs.find(item => item.priority == pr.p_pri);
            if (queue) {
                queue.remove(pr);
                if (queue.isEmpty()) {
                    this.dqactmap.pop();
                    this.dispq.pop();
                }
            }

            // Encola el proceso de nuevo
            this.setBackDQ(pr);
            console.log(this.time + " : Proceso " + pr.p_pid + " reencolado: " + pr.p_pri);
        });
    }
    */

    isFinished() {
        // GUARDA
        if (this.time > 50000) {
            console.log("Alcanzado tiempo máximo de ejecución");
            return true;
        }

        let procesos = this.processTable.filter(pr => pr.p_state != "finished");
        return (procesos.length === 0);
    }

    getSummary() {
        let n_proc = this.processTable.length;
        let t_wait = 0;
        this.processTable.forEach(pr => t_wait += pr.wait_time);
        let table = [];
        this.processTable.forEach(pr => {table.push(pr.getSummaryData())});

        return {
            n_proc : n_proc,
            t_time : this.time,
            wait : Math.floor(t_wait / n_proc),
            cswitch : this.contextSwitchCount,
            proc_data: table
        }
    }

    _sendState() {
        if (this.isFinished())
            this.journal.push("Ejecución finalizada.");

        if (this.journal.length > 0) {
            let pTable = [];
            let notFinished = this.processTable.filter(pr => pr.p_state != "finished");
            notFinished.forEach(pr => {
                pTable.push(pr.getFullData());
            });

            let _dispq = [];
            this.dispq.forEach(q => {_dispq.push(q.getData());});

            // Datos de la clase
            let rt = [];
            let ts = [];
            notFinished.filter(pr => pr.class.name == "RealTime").forEach(pr => {
                rt.push(pr.getClassData());
            });
            notFinished.filter(pr => pr.class.name == "TimeSharing").forEach(pr => {
                ts.push(pr.getClassData());
            });

            this.stateManager.pushState({
                name: this.name,
                state: {
                    time: this.time, 
                    journal: this.journal, 
                    pTable: pTable,
                    dispq: _dispq,
                    dqactmap: Array.from(this.dqactmap),
                    runrun: this.runrun,
                    kprunrun: this.kprunrun
                },
                rt_data: {rt},
                ts_data: {ts},
                info: this.processTable[0].getInfo()
            });
            this.journal = [];
        }
    }
}


class Svr4Process {
    constructor(sched, pid, execution, cpu_burst, io_burst, pClass, pri) {
        this.sched = sched;
        this.p_pid = pid;
        this.p_state = "ready";
        this.p_pri = pri;
        this.execution = execution;
        this.cpu_burst = cpu_burst;
        this.io_burst = io_burst;
        this.current_cycle_time = 0;
        this.wait_time = 0;
        this.finish_time = 0;    // tiempo de finalización  
        this.kernelCount = 0;    // numero de Ticks en modo nucleo
        this.class = (pClass == "RealTime") ? new Svr4RT(this) : new Svr4TS(this);
    }

    runTick() {
        let text = "";
        switch (this.p_state) {
            case "running_kernel":
                if (this.kernelCount > 1) {
                    this.kernelCount--;
                }
                else {
                    this.kernelCount = 2;
                    this.p_state = "running_user";
                    this.class.fromSysCall();
                    text += "Proceso " + this.p_pid + " finaliza llamada al sistema. ";
                } 
            case "running_user":
                this.execution -= this.sched.TICK;
                if (this.execution <= 0)
                    text += this._toZombie();
                else {
                    this.current_cycle_time += this.sched.TICK;
                    text += this.class.runTick();
                }        
                break;
            case "sleeping":
                this.current_cycle_time += this.sched.TICK;
                if (this.current_cycle_time >= this.io_burst) {
                    this.p_state = "ready";
                    this.current_cycle_time = 0;
                    text += this.class.runTick()
                }
                break;
            case "ready":
                this.wait_time += this.sched.TICK;
                break;
            case "zombie":
                this.p_state = "finished";
                break;
            default:
                break;
        }
        return text;
    }

    startRun() {
        if (this.kernelCount  > 0)
            this.p_state = "running_kernel";
        else
            this.p_state = "running_user";

        this.roundRobin = false;
        this.resetQuantum();
    }

    resetQuantum() {
        this.class.resetQuantum();
    }

    /* Datos de la pantalla añadir proceso */
    getData() {
        return {
            p_pid: this.p_pid,
            p_pri: this.p_pri,
            class: this.class.name,
            execution: this.execution,
            cpu_burst: this.cpu_burst,
            io_burst: this.io_burst
        };
    }

    /* Datos para visualizacion de estados */
    getFullData() {
        return {
            p_pid: this.p_pid,
            p_state: this.p_state,
            p_pri: this.p_pri,
            class: this.class.name,
            execution: this.execution,
            cpu_burst: this.cpu_burst,
            io_burst: this.io_burst,
            wait_time: this.wait_time
        };
    }

    // Datos para la informacion de cada campo en estados
    getInfo() {
        return {
            p_pid: "pid",
            p_state: "estado",
            p_pri: "pri",
            class: "class",
            execution: "execution",
            cpu_burst: "cpu",
            io_burst: "io",
            wait_time: "wait"
        };
    }

    /* Datos para la vista resumen */
    getSummaryData() {
        return {
            p_pid: this.p_pid,
            wait_time: this.wait_time,
            ex_time: this.finish_time
        }
    }

    getClassData() {
        return this.class.getData();
    }

    _fromSysCall() {
        if (this.kernelCount > 1) {
            this.kernelCount--;
        }
        else {
            this.kernelCount = 2;
            this.p_state = "running_user";
            this.class.fromSysCall();
            return "Proceso " + this.p_pid + " finaliza llamada al sistema. ";
        } 
    }

    _toZombie() {
        this.execution = 0;
        this.p_state = "zombie";
        this.finish_time = this.sched.time;
        return "Proceso " + this.p_pid + " finalizado en " + this.finish_time + " ut. ";
    }    
}


export default Svr4Scheduler;