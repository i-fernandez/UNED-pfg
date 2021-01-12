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
        this.journal = [];
        

        // Datos de ejemplo
        
        
        this.addProcess({
            burst: 1000,
            cpu_burst: 80,
            io_burst: 20,
            pri: 50
        });
        this.addProcess({
            burst: 1200,
            cpu_burst: 20,
            io_burst: 80,
            pri: 65
        });
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
        /*
        let p1 = this.processTable[0];
        p1.p_cpu = 40;
        let p2 = this.processTable[1];
        p2.p_cpu = 50;
        let p3 = this.processTable[2];
        p3.p_cpu = 80;
        p3.state = "sleeping";
        let p4 = this.processTable[3];
        p4.p_cpu = 25;
        p4.state = "zombie";
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
        //console.log("encolado proceso pid: " + process.pid + " en cola " + qn);
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
        // Actualiza los procesos
        let procesos = this.processTable.filter(pr => pr.state != "zombie");
        procesos.forEach (pr => {
            let out = pr.runTick(this.TICK);
            if (out)
                this.journal.push(out);
        });

        // Ocurre schedCPU;
        if (this.time % this.SCHED == 0)
            this._schedCPU();

        if (this.inContextSwitch) {
            this._swtch();
        } else if (this.nextRoundRobin == 0) {
            this._roundRobin();
        }

        // No hay ningun proceso en ejecucion o hay encolado uno con mayor prioridad
        let running = this._getRunningProcess();
        if (typeof running === 'undefined' && this.whichqs.length > 0) {
            this.journal.push("Comienza cambio de contexto");
            this.inContextSwitch = true;
        } else if (typeof running !== 'undefined' && this.whichqs[0] < Math.floor(running.p_pri/4)) {
            this.journal.push("Proceso en espera con mayor prioridad");
            this.inContextSwitch = true;
        }
    
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
                //qs: Array.from(this.qs), 
                qs: _qs,
                whichqs: Array.from(this.whichqs),
                runrun: this.runrun
            });
            this.journal = [];
        }
    }

    // Realiza un cambio de contexto
    _swtch() {
        this.runrun = false;
        this.nextRoundRobin = this.QUANTUM;
        this.inContextSwitch = false;
        // Proximo proceso a ejecutar
        let next_pr = this._dequeueProcess();
        if (next_pr == null) {
            return;
        }

        
        // Proceso en ejecucion
        let running = this._getRunningProcess();
        if (typeof running === 'undefined' || running.pid != next_pr.pid) {
            this.contextSwitchCount++;
            next_pr.state = "running_user";
            this.nextRoundRobin = this.QUANTUM;
            this.journal.push("Proceso " + next_pr.pid + " Seleccionado para ejecucion");
        }
    }

    // Aplica decay y recalcula prioridades para cada proceso
    _schedCPU() {
        this.journal.push("Iniciada rutina schedcpu");
        let procesos = this.processTable.filter(pr => pr.state != "zombie");
        procesos.forEach (pr => {
            pr.decay();
            this._recalculateProcessPriority(pr);
        });

    }
    
    // Recalcula la prioridad de un proceso
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
                //console.log("schedCPU: desencolado proceso pid: " + pr.pid);
            }
        }
        // Recalcula prioridad
        process.calcPriority();
        this.journal.push("schedCPU: nueva prioridad proceso " + 
            process.pid + " = " + process.p_pri);
        // Encola el proceso
        this._enqueueProcess(process);
    }

    // TODO: completar
    _roundRobin() {
        this.journal.push("Lanzada rutina round robin");
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