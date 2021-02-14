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
        

        // Datos de ejemplo  
        /*
        this.addProcess({
            burst: 500,
            cpu_burst: 200,
            io_burst: 10,
            pri: 65
        });
        
        
        this.addProcess({
            burst: 500,
            cpu_burst: 200,
            io_burst: 20,
            pri: 65
        });
        
        this.addProcess({
            burst: 600,
            cpu_burst: 250,
            io_burst: 20,
            pri: 65
        });
        this.addProcess({
            burst: 600,
            cpu_burst: 80,
            io_burst: 10,
            pri: 66
        });

        this.addProcess({
            burst: 300,
            cpu_burst: 50,
            io_burst: 200,
            pri: 67
        });
        */

        
    }

    
    addProcess(data) {
        let pr = new Svr3Process(
            this.processTable.length+1, data.burst, data.cpu_burst, data.io_burst, data.pri);
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

    
    getPTable() {
        let pTable = [];
        this.processTable.forEach(pr => {pTable.push(pr.getData());});
        return pTable;
    }
    

    start() {
        this.journal.push("Inicio de la ejecucion");
        let pr = this._dequeueProcess();
        pr.state = "running_user";
        this.journal.push("Proceso " + pr.pid + " seleccionado para ejecucion");
        this._sendState();
    }

    nextTick() {
        this.time += this.TICK;
        this.nextRoundRobin -= this.TICK;
        let sleeping_pr  = this.processTable.filter(pr => pr.state == "sleeping");
        // Actualiza los procesos
        this.processTable.forEach (pr => {
            let out = pr.runTick(this.TICK);
            if (out)
                this.journal.push(out);
        });

        // Encola procesos que finalizaron IO
        sleeping_pr.forEach(pr => {
            if (pr.state != "sleeping")
                this._enqueueProcess(pr);
        });
        
        // Ocurre schedCPU;
        if (this.time % this.SCHED == 0)
            this._schedCPU();

        if (this.inContextSwitch) 
            this._swtch();
        
        // Cuanto finalizado, comprueba round robin
        else if (this.nextRoundRobin == 0) 
            this._roundRobin();
        
        // Comprueba si empieza un cambio de contexto
        this._startSwtch();
    
        this._sendState();
    }

    isFinished() {
        let procesos = this.processTable.filter(pr => pr.state != "finished");
        return (procesos.length === 0);
    }

    getSummary() {
        let n_proc = this.processTable.length;
        let t_wait = 0;
        this.processTable.forEach(pr => t_wait += pr.wait_time);

        return {
            n_proc : n_proc,
            t_time : this.time,
            wait : Math.floor(t_wait / n_proc),
            cswitch : this.contextSwitchCount
        }
    }

    _sendState() {
        if (this.isFinished())
            this.journal.push("Ejecución finalizada.");

        if (this.journal.length > 0) {
            let pTable = [];
            this.processTable.filter(pr => pr.state != "finished").forEach(pr => {
                pTable.push(pr.getFullData());
            });
            let _qs = [];
            this.qs.forEach(q => {_qs.push(q.getData());});

            this.stateManager.pushState({
                time: this.time, 
                journal: this.journal, 
                pTable: pTable,
                qs: _qs,
                whichqs: Array.from(this.whichqs),
                runrun: this.runrun
            });
            this.journal = [];
        }
    }

    // Inicio de cambio de contexto
    _startSwtch() {
        let running = this._getRunningProcess();
        // No hay ningun proceso en ejecucion 
        if (typeof running === 'undefined' && this.whichqs.length > 0) {
            this.journal.push("Ningun proceso en ejecucion - llamada a rutina swtch");
            this.inContextSwitch = true;
        } 
        // Proceso encolado con mayor prioridad y actual no esta en modo kernel
        else if (typeof running !== 'undefined' && 
            this.whichqs[0] < Math.floor(running.p_pri/4) &&
            running.state != "running_kernel") {

            this.journal.push("CPU expropiada debido a proceso "+this.qs[0].front().pid);
            this.inContextSwitch = true;
            running.state = "ready";
            this._enqueueProcess(running);
        }
        // Round robin
        else if (this.inRoundRobin) {
            this.journal.push("CPU expropiada debido a rutina roundrobin");
            this.inContextSwitch = true;
            this.inRoundRobin = false;
            running.state = "ready";
            this._enqueueProcess(running);
        }
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
            next_pr.state = "running_kernel";
        else
            next_pr.state = "running_user";
        this.nextRoundRobin = this.QUANTUM;
        this.journal.push("Proceso " + next_pr.pid + " Seleccionado para ejecucion");
    }

    // Aplica decay y recalcula prioridades para cada proceso
    _schedCPU() {
        this.journal.push("Iniciada rutina schedcpu");
        let procesos = this.processTable.filter(
            pr => (pr.state != "zombie" && pr.state != "finished"));
        procesos.forEach (pr => {
            pr.decay();
            // Desencola el proceso
            if (pr.state == "ready") {
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
            pr.calcPriority();
            this.journal.push("schedCPU: nueva prioridad proceso " + pr.pid + " = " + pr.p_pri);
            // Encola el proceso
            if (pr.state == "ready") 
                this._enqueueProcess(pr);
            
        });

    }

    // Comprueba si round robin produce cambio de contexto
    _roundRobin() {
        let running = this._getRunningProcess();
        if (typeof running !== 'undefined' && this.whichqs[0] == Math.floor(running.p_pri/4)) 
            this.inRoundRobin = true;
    }

    _getRunningProcess() {
        return this.processTable.filter(pr => pr.state.indexOf("running") != -1)[0];
    }
}

class Svr3Process {
    constructor(pid, burst, cpu_burst, io_burst, pri) {
        // constantes
        this.PUSER = 50;
        this.PRIORITIES = [10, 20, 21, 25, 28, 29, 30, 35 ,40];

        this.pid = pid;
        this.state = "ready";
        this.p_pri = pri;
        this.p_usrpri = pri;
        this.p_cpu = 0;
        this.p_nice = 20;
        this.p_wchan = -1;

        this.burst_time = burst;
        this.cpu_burst = cpu_burst;
        this.io_burst = io_burst;
        this.wait_time = 0;
        this.current_cycle_time = 0;
        
        this.text = "";
    }

    calcPriority() {
        this.p_pri = Math.floor(this.PUSER + this.p_cpu/4 + this.p_nice*2);
        this.p_usrpri = this.p_pri;
    }

    decay() {
        if (this.state != "zombie" && this.state != "finished")
            this.p_cpu = Math.floor(this.p_cpu/2);
    }

    runTick(time) {
        this.text = "";
        switch (this.state) {
            case "running_kernel":
                this._fromSysCall();
            case "running_user":
                if (this.p_cpu < 127)   
                    this.p_cpu++;
                if (this.burst_time <= time) 
                    this._toZombie();
                else {
                    this.burst_time -= time;
                    this.current_cycle_time += time;
                    if (this.current_cycle_time >= this.cpu_burst)
                        this._goToSleep()
                }
                break;
            case "sleeping":
                this.current_cycle_time += time;
                if (this.current_cycle_time >= this.io_burst) 
                    this._fromSleep();
                break;
            case "ready":
                this.wait_time += time;
                break;
            case "zombie":
                this.state = "finished";
                break;
            default:
                break;
        }
        return this.text;

    }

    /* Datos de la pantalla añadir proceso */
    getData() {
        return {
            pid: this.pid,
            state: this.state,
            burst_time: this.burst_time,
            cpu_burst: this.cpu_burst,
            io_burst: this.io_burst,
            p_pri: this.p_pri
        };
    }

    /* Datos para visualizacion de estados */
    getFullData() {
        return {
            pid: this.pid,
            state: this.state,
            burst_time: this.burst_time,
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

    _goToSleep() {
        this.state = "sleeping";
        this.current_cycle_time = 0;
        this.p_wchan = this.PRIORITIES[Math.floor(Math.random() * this.PRIORITIES.length)]
        this.text = "Proceso " + this.pid + " finaliza su ciclo de CPU. "+
            "Direccion de dormir: " + this.p_wchan;
    }

    _fromSleep() {
        this.state = "ready";
        this.current_cycle_time = 0;
        this.p_pri = this.p_wchan;
        this.p_wchan = -1;
        this.text = "Proceso " + this.pid + " finaliza su espera por I/O. " + 
            "Aumentada prioridad temporalmente a " + this.p_pri;
    }

    _fromSysCall() {
        this.p_pri = this.p_usrpri;
        this.state = "running_user";
        this.text = "Proceso " + this.pid + " finaliza llamada al sistema";
    }

    _toZombie() {
        this.burst_time = 0;
        this.state = "zombie";
        this.text = "Proceso " + this.pid + " finalizado";
    }
}


export default Svr3Scheduler;