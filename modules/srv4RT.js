
class Svr4RT {
    constructor(pri, pid) {
        this.name = "RealTime"
        this.p_pid = pid;
        // rtdpent
        this.rt_glopri = pri;
        this.rt_quantum = rt_dptbl(pri);
        // rtproc
        this.rt_pquantum = this.rt_quantum;
        this.rt_timeleft = this.rt_quantum;
        this.rt_pri = pri;
    }

    getPriority() {
        return this.rt_pri;
    }

    getData() {
        return {
            p_pid: this.p_pid,
            rt_glopri: this.rt_glopri,
            rt_quantum: this.rt_pquantum,
            rt_pquantum: this.rt_pquantum,
            rt_timeleft: this.rt_timeleft,
            rt_pri: this.rt_pri
        };
    }

    resetQuantum() {
        this.rt_timeleft = this.rt_pquantum;
    }

    runTick(pr, time, currentTime) {
        let text = "";
        switch (pr.p_state) {
            case "running_kernel":

            case "running_user":
                if (pr.burst_time <= time)
                    text = this._toZombie(pr, currentTime);
                else {
                    this.rt_timeleft -= time;
                    pr.burst_time -= time;
                    pr.current_cycle_time += time;
                    if (pr.current_cycle_time >= pr.cpu_burst) 
                        text = this._toSleep(pr);
                    else if (this.rt_timeleft <= 0) 
                        pr.roundRobin = true;
                }
                break;

            default:
                break;
        }
        return text;
    }

    _toZombie(pr, currentTime) {
        pr.burst_time = 0;
        pr.p_state = "zombie";
        pr.finish_time = currentTime;
        return "Proceso " + this.p_pid + " finalizado en " + currentTime + " ut.";
    }

    _toSleep(pr) {
        pr.p_state = "sleeping";
        pr.current_cycle_time = 0;
        return "Proceso " + this.p_pid + " finaliza su ciclo de CPU.";
    }
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