
class Svr4RT {
    constructor(pri, pid) {
        this.name = "RealTime"
        this.p_pid = pid;
        /*
        this.rtdpent = {
            rt_glopri: pri,
            rt_quantum: rt_dptbl(pri)
        };
        this.rtproc = {
            rt_pquantum: this.rtdpent.rt_quantum,
            rt_timeleft: this.rtdpent.rt_quantum,
            rt_pri: pri
        };
        */

        this.rt_glopri = pri;
        this.rt_quantum = rt_dptbl(pri);
        this.rt_pquantum = this.rt_quantum;
        this.rt_timeleft = this.rt_quantum;
        this.rt_pri = pri;


    }

    getPriority() {
        //return this.rtproc.rt_pri;
        return this.rt_pri;
    }

    getData() {
        /*
        return {
            p_pid: this.p_pid,
            rtdpent: this.rtdpent,
            rtproc: this.rtproc
        };
        */
        return {
            p_pid: this.p_pid,
            rt_glopri: this.rt_glopri,
            rt_quantum: this.rt_pquantum,
            rt_pquantum: this.rt_pquantum,
            rt_timeleft: this.rt_timeleft,
            rt_pri: this.rt_pri
        };
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