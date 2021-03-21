
class Svr4RT {
    constructor(proc) {
        this.name = 'RealTime'
        this.proc = proc;      
        // Prioridad global
        this.rt_glopri = proc.p_pri;
        // Cuanto asociado a la prioridad
        this.rt_quantum = rt_dptbl(proc.p_pri);
        // Cuanto asignado
        this.rt_pquantum = this.rt_quantum;
        // Tiempo restante del cuanto
        this.rt_timeleft = this.rt_quantum;
        // Prioridad actual
        this.rt_pri = proc.p_pri;
    }

    getPriority() {
        return this.rt_pri;
    }

    getData() {
        return {
            p_pid: this.proc.p_pid,
            rtproc: {
                rt_pquantum: this.rt_pquantum,
                rt_timeleft: this.rt_timeleft,
                rt_pri: this.rt_pri
                },
            rtdpent: {
                rt_glopri: this.rt_glopri,
                rt_quantum: this.rt_pquantum
            }
        };
    }

    getInfo() {
        return {
            rt_pquantum: 'Cuanto asignado',
            rt_timeleft: 'Tiempo restante del cuanto',
            rt_pri: 'Prioridad actual',
            rt_glopri: 'Prioridad global',
            rt_quantum: 'Cuanto asignado a la prioridad'
        }
    }


    resetQuantum() {
        this.rt_timeleft = this.rt_pquantum;
    }

    runTick() {
        let text = '';
        switch (this.proc.p_state) {
            case 'running_kernel':

            case 'running_user':
                this.rt_timeleft -= this.proc.sched.TICK;
                if (this.proc.current_cycle_time >= this.proc.cpu_burst) 
                    text += this._toSleep();
                else if (this.rt_timeleft <= 0) 
                    this.proc.sched.roundRobin();
                break;

            case 'sleeping':
                text += this._fromSleep();
                break;
            default:
                break;
        }
        return text;
    }

    _toSleep() {
        this.proc.p_state = 'sleeping';
        this.proc.current_cycle_time = 0;
        this.proc.kernelCount = 2;
        return `Proceso ${this.proc.p_pid} finaliza su ciclo de CPU. `;
    }

    _fromSleep() {
        return `Proceso ${this.proc.p_pid} finaliza su espera por I/O. `;
    }

    // En esta clase no se hace nada especial al volver a modo usuario
    fromSysCall() {}


}

/* Devuelve el valor de cuanto correspondiente a la prioridad */
function rt_dptbl(pri) {
    if (pri >= 100 && pri < 110) return 100;
    if (pri >= 110 && pri < 120) return 80;
    if (pri >= 120 && pri < 130) return 60;
    if (pri >= 130 && pri < 140) return 40;
    if (pri >= 140 && pri < 150) return 20;
    if (pri >= 150 && pri < 160) return 10;
    return 0;
};

export default Svr4RT;