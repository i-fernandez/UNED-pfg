import PriorityQueue from './priorityqueue.js'


class Svr3Scheduler {
    constructor(stateManager) {
        // constantes
        this.QUANTUM = 100;
        this.SCHED = 1000;
        this.CONTEXT_SWITCH = 10;
        this.TICK = 10;

        this.name = "SVR3";
        this.stateManager = stateManager;
        this.time = 0;
        this.whichqs = [];
        this.qs = [];
        this.processTable = [];
        this.runrun = false;
        this.nextRoundRobin = this.QUANTUM;
        this.contextSwitchCount = 0;
        this.inContextSwitch = false;
        this.inRoundRobin = false;
        this.journal = [];  
        this.running = "";
    }

    
    addProcess(data) {
        let pr = new Svr3Process(
            this.processTable.length+1, data.execution, data.cpu_burst, data.io_burst, data.pri);
        this.processTable.push(pr);
        this._enqueueProcess(pr);

    }

    // Añade un proceso a la cola, modifica qs y whichqs (y los ordena)
    _enqueueProcess(process) {
        let qn = Math.floor(process.p_pri / 4);
        if (!(this.whichqs.includes(qn))) {
            this.whichqs.push(qn);
        }
        this.whichqs.sort(function(a, b) { return a - b;});
        let queue = this.qs.find(item => item.priority == qn);
        if (queue)
            queue.enqueue(process);
        else
            this.qs.push(new PriorityQueue(qn, process));
        this.qs.sort(function (a, b) {
            if (a.priority > b.priority)
                return 1;
            if (a.priority < b.priority)
                return -1;
            return 0;
        });
    }

    // Elige un proceso para ser planificado y lo desencola
    _dequeueProcess() {
        let qn = this.whichqs[0];
        let queue = this.qs.find(item => item.priority == qn);
        if (queue) {
            let pr = queue.dequeue();
            if (queue.isEmpty()) {
                this.whichqs.shift();
                this.qs.shift();
            }
            return pr;
        }
    }

    // Muestra el proximo proceso para ejecutarse, sin desencolarlo
    _getNextProcess() {
        let queue = this.qs.find(item => item.priority == this.whichqs[0]);
        if (queue) {
            return queue.front();
        }
    }

    
    getPTable() {
        let pTable = [];
        this.processTable.forEach(pr => {pTable.push(pr.getData());});
        return pTable;
    }
    

    start() {
        this.journal.push("Inicio de la ejecucion");
        let pr = this._dequeueProcess();
        this.running = pr;
        pr.p_state = "running_user";
        this.journal.push("Proceso " + pr.p_pid + " cargado para ejecucion");
        this._sendState();
    }

    nextTick() {
        this.time += this.TICK;
        this.nextRoundRobin -= this.TICK;

        let sleeping_pr  = this.processTable.filter(pr => pr.p_state == "sleeping");
        // Actualiza los procesos
        this.processTable.forEach (pr => {
            let out = pr.runTick(this.TICK, this.time);
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
                this._enqueueProcess(pr);
        });
        
        if (this.time % this.SCHED == 0)
            // Ocurre schedCPU;
            this._schedCPU();
        else if (this.time % 40 == 0 && this.running) 
            // Recalcula prioridad del proceso en ejecucion
            this.journal.push(this.running.calcPriority());
        else if (this.nextRoundRobin == 0) 
            // Cuanto finalizado, comprueba round robin
            this._roundRobin();
        
        // Comprueba si empieza un cambio de contexto
        this._startSwtch();

        this._sendState();
    }

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
            this.processTable.filter(pr => pr.p_state != "finished").forEach(pr => {
                pTable.push(pr.getFullData());
            });
            let _qs = [];
            this.qs.forEach(q => {_qs.push(q.getData());});

            this.stateManager.pushState({
                name: this.name,
                state : {
                    time: this.time, 
                    journal: this.journal, 
                    pTable: pTable,
                    qs: _qs,
                    whichqs: Array.from(this.whichqs),
                    runrun: this.runrun
                }
            });
            this.journal = [];
        }
    }

    // Comprueba si se inicia un cambio de contexto
    _startSwtch() {
        let n = this._getNextProcess();

        // No hay ningun proceso en ejecucion 
        if (!(this.running) && this.whichqs.length > 0) {
            this.journal.push("Rutina swtch selecciona proceso " + n.p_pid + " para su ejecición.");
            this.inContextSwitch = true;
        } 
        // Proceso encolado con mayor prioridad
        else if (this.running && this.whichqs[0] < Math.floor(this.running.p_pri/4)) {
        //else if (this.running && n.p_pri < this.running.p_pri) {
            if (this.running.p_state == "running_kernel") {
                // Proceso con llamada al sistema
                this.runrun = true;
                this.journal.push("Proceso " + n.p_pid + " encolado con mayor prioridad. " + 
                    "Esperando finalizacion de llamada al sistema.")
            } else {
                this.journal.push("CPU expropiada debido a proceso " + 
                    n.p_pid + ". Comienza cambio de contexto.");
                this._preempt();
            }
        }
        // Round robin
        else if (this.inRoundRobin) {
            this.journal.push("CPU expropiada por proceso " + n.p_pid + 
                "debido a rutina roundrobin. Comienza cambio de contexto.");
            this.inRoundRobin = false;
            this._preempt();
        }
    }

    // Realiza la expropiacion del proceso en ejecucion
    _preempt() {
        this.inContextSwitch = true;
        this.running.p_state = "ready";
        this._enqueueProcess(this.running);
        this.running = "";
        
    }

    // Realiza un cambio de contexto
    _swtch() {
        this.runrun = false;
        this.inContextSwitch = false;
        // Proximo proceso a ejecutar
        let next_pr = this._dequeueProcess();
        if (next_pr == null) 
            return;
        
        this.contextSwitchCount++;
        if (next_pr.p_pri < 50)
            next_pr.p_state = "running_kernel";
        else
            next_pr.p_state = "running_user";
        this.running = next_pr;
        this.nextRoundRobin = this.QUANTUM;
        this.journal.push("Proceso " + next_pr.p_pid + " cargado para su ejecucion");
    }

    // Aplica decay y recalcula prioridades para cada proceso
    _schedCPU() {
        this.journal.push("Iniciada rutina schedcpu");
        let procesos = this.processTable.filter(
            pr => (pr.p_state != "zombie" && pr.p_state != "finished"));
        procesos.forEach (pr => {
            pr.decay();
            // Desencola el proceso
            if (pr.p_state == "ready") {
                let qn = Math.floor(pr.p_pri / 4);
                let queue = this.qs.find(item => item.priority == qn);
                if (queue) {
                    queue.remove(pr);
                    if (queue.isEmpty()) {
                        let i = this.whichqs.indexOf(qn);
                        this.whichqs.splice(i, 1);
                        this.qs.splice(i, 1);
                    }
                }
            }
            // Recalcula prioridad
            this.journal.push(pr.calcPriority());
            // Encola el proceso
            if (pr.p_state == "ready") 
                this._enqueueProcess(pr);
            
        });

    }

    // Comprueba si round robin produce cambio de contexto
    _roundRobin() {
        if (this.running && this.whichqs[0] == Math.floor(this.running.p_pri/4)) 
            this.inRoundRobin = true;
    }

    _getRunningProcess() {
        return this.processTable.filter(pr => pr.p_state.indexOf("running") != -1)[0];
    }
}

class Svr3Process {
    constructor(pid, execution, cpu_burst, io_burst, pri) {
        // constantes
        this.PUSER = 50;
        this.PRIORITIES = [10, 20, 21, 25, 28, 29, 30, 35 ,40];

        this.p_pid = pid;
        this.p_state = "ready";
        this.p_pri = pri;
        this.p_usrpri = pri;
        this.p_cpu = 0;
        this.p_nice = 20;
        this.p_wchan = -1;

        this.execution = execution;
        this.cpu_burst = cpu_burst;
        this.io_burst = io_burst;
        this.wait_time = 0;
        this.current_cycle_time = 0;
        this.finish_time = 0;

        this.kernelCount = 2;  // numero de Ticks en modo nucleo
    }

    calcPriority() {
        this.p_pri = Math.floor(this.PUSER + this.p_cpu/4 + this.p_nice*2);
        this.p_usrpri = this.p_pri;
        return "Recalculada la prioridad del proceso " + this.p_pid + 
            ". Nueva prioridad: " + this.p_pri;
    }

    decay() {
        if (this.p_state != "zombie" && this.p_state != "finished")
            this.p_cpu = Math.floor(this.p_cpu/2);
    }

    runTick(time, currentTime) {
        let text = "";
        switch (this.p_state) {
            case "running_kernel":
                text = this._fromSysCall();
            case "running_user":
                if (this.p_cpu < 127)   
                    this.p_cpu++;
                if (this.execution <= time) 
                    text = this._toZombie(currentTime);
                else {
                    this.execution -= time;
                    this.current_cycle_time += time;
                    if (this.current_cycle_time >= this.cpu_burst)
                        text = this._toSleep();
                }
                break;
            case "sleeping":
                this.current_cycle_time += time;
                if (this.current_cycle_time >= this.io_burst) 
                    text = this._fromSleep();
                break;
            case "ready":
                this.wait_time += time;
                break;
            case "zombie":
                this.p_state = "finished";
                break;
            default:
                break;
        }
        return text;

    }

    /* Datos de la pantalla añadir proceso */
    getData() {
        return {
            p_pid: this.p_pid,
            p_pri: this.p_pri,
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
            execution: this.execution,
            cpu_burst: this.cpu_burst,
            io_burst: this.io_burst,
            p_pri: this.p_pri,
            p_usrpri: this.p_usrpri,
            p_cpu: this.p_cpu,
            p_nice: this.p_nice,
            wait_time: this.wait_time,
            p_wchan: this.p_wchan
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

    _toSleep() {
        this.p_state = "sleeping";
        this.current_cycle_time = 0;
        this.p_wchan = this.PRIORITIES[Math.floor(Math.random() * this.PRIORITIES.length)]
        return "Proceso " + this.p_pid + " finaliza su ciclo de CPU. "+
            "Direccion de dormir: " + this.p_wchan;
    }

    _fromSleep() {
        this.p_state = "ready";
        this.current_cycle_time = 0;
        this.p_pri = this.p_wchan;
        this.p_wchan = -1;
        return "Proceso " + this.p_pid + " finaliza su espera por I/O. " + 
            "Aumentada prioridad temporalmente a " + this.p_pri;
    }

    _fromSysCall() {
        if (this.kernelCount > 1) {
            this.kernelCount--;
        }
        else {
            this.kernelCount = 2;
            this.p_pri = this.p_usrpri;
            this.p_state = "running_user";
            return "Proceso " + this.p_pid + " finaliza llamada al sistema.";
        } 
    }

    _toZombie(currentTime) {
        this.execution = 0;
        this.p_state = "zombie";
        this.finish_time = currentTime;
        return "Proceso " + this.p_pid + " finalizado en " + currentTime + " ut.";
    }
}


export default Svr3Scheduler;