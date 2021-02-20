import PriorityQueue from './priorityqueue.js'
import Svr4RT from './srv4RT.js'
import Svr4TS from './svr4TS.js'

class Svr4Scheduler {
    constructor(stateManager) {
        this.name = "SVR4";
        this.stateManager = stateManager;
        this.time = 0;
        this.dqactmap = [];
        this.dispq = [];
        this.processTable = [];
        this.runrun = false;
        this.kprunrun = false;
        this.contextSwitchCount = 0;
        this.journal = [];

        /* BORRAR */
        this.count = 0;
    }

    addProcess(data) {
        let pr = new Svr4Process(
            this.processTable.length+1, data.burst, data.cpu_burst, data.io_burst, data.pClass, data.pri
        );
        this.processTable.push(pr);
        this._enqueueProcess(pr);
    }

    // Añade un proceso a la cola, modifica dispq y dqactmap (y los ordena)
    _enqueueProcess(process) {
        // Numero de cola
        let qn = process.p_pri;
        // dqactmap
        if (!(this.dqactmap.includes(qn))) {
            this.dqactmap.push(qn);
        }
        this.dqactmap.sort(function(a, b) { return a - b;});
        // dispq
        let queue = this.dispq.find(item => item.priority == qn);
        if (queue)
            queue.enqueue(process);
        else
            this.dispq.push(new PriorityQueue(qn, process));
        this.dispq.sort(function (a, b) {
            if (a.priority > b.priority)
                return 1;
            if (a.priority < b.priority)
                return -1;
            return 0;
        });
    }

    // Elige un proceso para ser planificado y lo desencola
    _dequeueProcess() {
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

    start() {
        this.journal.push("Inicio de la ejecucion");
        let pr = this._dequeueProcess();
        pr.p_state = "running_user";
        this.journal.push("Proceso " + pr.p_pid + " seleccionado para ejecucion");
        this._sendState();
    }

    getPTable() {
        let pTable = [];
        this.processTable.forEach(pr => {pTable.push(pr.getData());});
        return pTable;
    }

    nextTick() {
        /* BORRAR */
        this.count++;

    }

    isFinished() {
        /* BORRAR */
        if (this.count >= 5) return true;

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
            let _dispq = [];
            this.dispq.forEach(q => {_dispq.push(q.getData());});

            // Datos de la clase
            let rt = [];
            let ts = [];
            this.processTable.filter(pr => pr.class.name == "RealTime").forEach(pr => {
                rt.push(pr.getClassData());
            });
            this.processTable.filter(pr => pr.class.name == "TimeSharing").forEach(pr => {
                ts.push(pr.getClassData());
            })
            

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
                ts_data: {ts}
            });
            this.journal = [];
        }
    }
}


class Svr4Process {
    constructor(pid, burst, cpu_burst, io_burst, pClass, pri) {
        this.p_pid = pid;
        this.p_state = "ready";
        this.p_pri = pri;

        this.burst_time = burst;
        this.cpu_burst = cpu_burst;
        this.io_burst = io_burst;
        this.current_cycle_time = 0;
        this.wait_time = 0;

        this.class = (pClass == "RealTime") ? new Svr4RT(pri, pid) : new Svr4TS(pri, pid);
    }

    runTick(time) {

    }

    /* Datos de la pantalla añadir proceso */
    getData() {
        return {
            p_pid: this.p_pid,
            p_state: this.p_state,
            p_pri: this.p_pri,
            class: this.class.name,
            burst_time: this.burst_time,
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
            burst_time: this.burst_time,
            cpu_burst: this.cpu_burst,
            io_burst: this.io_burst,
            current_cycle_time: this.current_cycle_time,
            wait_time: this.wait_time,
        };
    }

    getClassData() {
        return this.class.getData();
    }
}


export default Svr4Scheduler;