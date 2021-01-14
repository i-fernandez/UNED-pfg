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
            burst: 300,
            cpu_burst: 100,
            io_burst: 20,
            pri: 50
        });
        */
        
        this.addProcess({
            burst: 500,
            cpu_burst: 200,
            io_burst: 10,
            pri: 65
        });
        /*
        this.addProcess({
            burst: 2000,
            cpu_burst: 40,
            io_burst: 40,
            pri: 110
        });
        this.addProcess({
            burst: 1600,
            cpu_burst: 160,
            io_burst: 40,
            pri: 71
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
        // Numero de cola
        let qn = Math.floor(process.p_pri / 4);
        // whichqs
        if (!(this.whichqs.includes(qn))) {
            this.whichqs.push(qn);
        }
        this.whichqs.sort(function(a, b) { return a - b;});
        // qs
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
                // modifica el bit de whichqs
                this.whichqs.shift();
                // elimina la cola de qs
                this.qs.shift();
            }
            //this.journal.push("Desencolado proceso pid: " + pr.pid);
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
        let procesos = this.processTable.filter(pr => pr.state != "zombie");
        procesos.forEach (pr => {
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

        if (this.inContextSwitch) {
            this._swtch();
        } 
        // Cuanto finalizado, comprueba round robin
        else if (this.nextRoundRobin == 0) {
            this._roundRobin();
        }

        // Comprueba si empieza un cambio de contexto
        this._startSwtch();
    
        this._sendState();
    }

    isFinished() {
        let procesos = this.processTable.filter(pr => pr.state != "zombie");
        return (procesos.length === 0);
    }

    _sendState() {
        if (this.journal.length > 0) {
            // Copia la tabla de procesos
            let pTable = [];
            this.processTable.forEach(pr => {pTable.push(pr.getData());});
            // Copia array qs
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
            this.journal.push("Comienza cambio de contexto");
            this.inContextSwitch = true;
        } 
        // Proceso encolado con mayor prioridad
        else if (typeof running !== 'undefined' && this.whichqs[0] < Math.floor(running.p_pri/4)) {
            this.journal.push("Proceso en espera con mayor prioridad");
            this.journal.push("Comienza cambio de contexto");
            this.inContextSwitch = true;
            running.state = "ready";
            this._enqueueProcess(running);
        }
        // Round robin
        else if (this.inRoundRobin) {
            this.journal.push("Lanzada rutina round robin");
            this.journal.push("Comienza cambio de contexto");
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
        next_pr.state = "running_user";
        this.nextRoundRobin = this.QUANTUM;
        this.journal.push("Proceso " + next_pr.pid + " Seleccionado para ejecucion");
    }

    // Aplica decay y recalcula prioridades para cada proceso
    // TODO: probarlo bien
    _schedCPU() {
        this.journal.push("Iniciada rutina schedcpu");
        let procesos = this.processTable.filter(pr => pr.state != "zombie");
        procesos.forEach (pr => {
            pr.decay();
            
            // No desencolar/encolar si el proceso esta en ejecucion

            // Desencola el proceso
            let qn = Math.floor(pr.p_pri / 4);
            let queue = this.qs.find(item => item.priority == qn);
            if (queue) {
                //let pr = queue.dequeue();
                queue.dequeue();    // TODO: debe desencolar un proceso concreto
                if (queue.isEmpty()) {
                    let i = this.whichqs.indexOf(qn);
                    this.whichqs.splice(i, 1);
                    this.qs.splice(i, 1);
                }
            }
            // Recalcula prioridad
            pr.calcPriority();
            this.journal.push("schedCPU: nueva prioridad proceso " + pr.pid + " = " + pr.p_pri);
            // Encola el proceso
            this._enqueueProcess(pr);
        });

    }
    
    // Recalcula la prioridad de un proceso
    /*
    _recalculateProcessPriority(process) {
        // Desencola el proceso
        let qn = Math.floor(process.p_pri / 4);
        let queue = this.qs.find(item => item.priority == qn);
        if (queue) {
            let pr = queue.dequeue();
            if (queue.isEmpty()) {
                let i = this.whichqs.indexOf(qn);
                this.whichqs.splice(i, 1);
                this.qs.splice(i, 1);
            }
        }
        // Recalcula prioridad
        process.calcPriority();
        this.journal.push("schedCPU: nueva prioridad proceso " + 
            process.pid + " = " + process.p_pri);
        // Encola el proceso
        this._enqueueProcess(process);
    }
    */

    // Comprueba si se lanza rutina round robin
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

        this.pid = pid;
        this.state = "ready";
        this.burst_time = burst;
        this.cpu_burst = cpu_burst;
        this.io_burst = io_burst;
        this.p_pri = pri;
        this.p_usrpri = pri;
        this.p_cpu = 0;
        this.p_nice = 20;
        this.wait_time = 0;
        this.current_cycle_time = 0;
    }

    calcPriority() {
        this.p_pri = Math.floor(this.PUSER + this.p_cpu/4 + this.p_nice*2);
        this.p_usrpri = this.p_pri;
    }

    decay() {
        if (this.state != "zombie")
            this.p_cpu = Math.floor(this.p_cpu/2);
    }

    runTick(time) {
        let text = "";
        switch (this.state) {
            case "running_kernel":
            case "running_user":
                if (this.p_cpu < 127)   
                    this.p_cpu++;
                if (this.burst_time <= time) {
                    // Finaliza
                    this.burst_time = 0;
                    this.state = "zombie";
                    text += "Proceso " + this.pid + " finalizado";
                } else {
                    this.burst_time -= time;
                    this.current_cycle_time += time;
                    if (this.current_cycle_time == this.cpu_burst) {
                        this.state = "sleeping";
                        this.current_cycle_time = 0;
                        text += "Proceso " + this.pid + " finaliza su ciclo de CPU";
                        // TODO: guardar la prioridad de la vuelta
                    }
                }
                break;
            case "sleeping":
                this.current_cycle_time += time;
                if (this.current_cycle_time == this.io_burst) {
                    this.state = "ready";
                    this.current_cycle_time = 0;
                    text += "Proceso " + this.pid + " finaliza su espera por I/O";
                    // TODO: subir temporalmente la prioridad
                }
                break;
            case "ready":
                this.wait_time += time;
                break;
            default:
                break;
        }
        return text;

    }

    getData() {
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
        };
    }
}


export default Svr3Scheduler;