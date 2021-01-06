import PriorityQueue from './priorityqueue.js'


class Svr3Scheduler {
    constructor(stateManager) {
        // constantes
        this.QUANTUM = 100;
        this.SCHED = 1000;
        this.CCONTEXT = 10;
        this.TICK = 10;

        this.name = "SVR3";
        this.stateManager = stateManager;
        this.time = 0;
        this.whichqs = [];
        this.qs = [];
        this.processTable = [];
        this.runrun = false;
        this.nextRoundRobin = this.QUANTUM;
        this.contextChangeCount = 0;
        this.inContextChange = false;
        this.journal = [];
        

        // Datos de ejemplo
        
        /*
        this.addProcess({
            burst: 1000,
            cpu_cycle: 80,
            io_cycle: 20,
            pri: 50
        });
        this.addProcess({
            burst: 1200,
            cpu_cycle: 20,
            io_cycle: 80,
            pri: 65
        });
        this.addProcess({
            burst: 2000,
            cpu_cycle: 40,
            io_cycle: 40,
            pri: 110
        });
        this.addProcess({
            burst: 1600,
            cpu_cycle: 160,
            io_cycle: 40,
            pri: 71
        });

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
            this.processTable.length+1, data.burst, data.cpu_cycle, data.io_cycle, data.pri);
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


    start() {
        this.journal.push("Inicio de la ejecucion");
        let pr = this._dequeueProcess();
        pr.state = "running_user";
        this.journal.push("Proceso " + pr.pid + " seleccionado para ejecucion");
        this._sendState();
    }

    nextTick() {
        // Inicio de ejecucion
        /*
        if (this.time === 0) {
            this.journal.push("Inicio de la ejecucion");
            let pr = this._dequeueProcess();
            pr.state = "running_user";
            this.journal.push("Proceso " + pr.pid + " seleccionado para ejecucion");
            this._sendState();
            return;
        }
        */

        this.time += this.TICK;
        let procesos = this.processTable.filter(pr => pr.state != "zombie");
        procesos.forEach (pr => {
            let out = pr.runTick(this.TICK);
            if (out)
                this.journal.push(out);
        });

        // cuando empieza cambio de contexto
        // poner this.inContextChange = true;
        // añadir al journal
        // aumentar el tiempo y terminar el tick
        // en el proximo tick, se llama a swtch()


        let running = this.processTable.filter(pr => pr.state != "/running.*/");

        this._sendState();
    }

    isFinished() {
        let procesos = this.processTable.filter(pr => pr.state != "zombie");
        return (procesos.length === 0);
    }

    _sendState() {
        if (this.journal.length > 0) {
            // TODO: hacer una copia de los objetos
            this.stateManager.pushState({
                time: this.time, 
                journal: this.journal, 
                pTable: this.processTable,
                qs: this.qs, 
                whichqs: this.whichqs,
                runrun: this.runrun
            });
            this.journal = [];
        }
    }

    // Realiza un cambio de contexto
    _swtch() {
        this.runrun = false;
        this.inContextChange = false;
        // Proximo proceso a ejecutar
        let next_pr = this._dequeueProcess();
        if (next_pr == null) {
            return;
        }
        // Proceso en ejecucion
        let running = this.processTable.filter(pr => pr.state != "/running.*/");
        if (running.pid != next_pr.pid) {
            next_pr.state = "running_user";
            this.nextRoundRobin = this.QUANTUM;
            // Aumenta los tiempos de cambio de contexto
            // TODO: Falta aumentar el contador de tiempo 
                //con el tiempo perdido por el cambio de contexto
            this.contextChangeCount++;
            this.journal.push("Proceso " + next_pr.pid + "Seleccionado para ejecucion");
        }
    }

    // Aplica decay y recalcula prioridades para cada proceso
    _schedCPU() {
        this.journal.push("Iniciada rutina schedcpu");
        let procesos = this.processTable.filter(pr => pr.state != "zombie");
        procesos.forEach (pr => {
            //pr.p_cpu = Math.floor(pr.p_cpu/2);
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
        //let pri = Math.floor(this.PUSER + process.p_cpu/4 + process.p_nice*2);
        //process.p_pri = pri;
        //process.p_usrpri = pri;
        process.calcPriority();
        this.journal.push("schedCPU: nueva prioridad proceso " + 
            process.pid + " = " + process.p_pri);
        // Encola el proceso
        this._enqueueProcess(process);
    }
}

class Svr3Process {
    constructor(pid, burst, cpu_cycle, io_cycle, pri) {
        // constantes
        this.PUSER = 50;

        this.pid = pid;
        this.state = "ready";
        this.burst_time = burst;
        this.cpu_cycle = cpu_cycle;
        this.io_cycle = io_cycle;
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
                    if (this.current_cycle_time == this.cpu_cycle) {
                        this.state = "sleeping";
                        this.current_cycle_time = 0;
                        text += "Proceso " + this.pid + " finaliza su ciclo de CPU";
                    }
                }
                break;
            case "sleeping":
                this.current_cycle_time += time;
                if (this.current_cycle_time == this.io_cycle) {
                    this.state = "ready";
                    this.current_cycle_time = 0;
                    text += "Proceso " + this.pid + " finaliza su espera por I/O";
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
}


export default Svr3Scheduler;