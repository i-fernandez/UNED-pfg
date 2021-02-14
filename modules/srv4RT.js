
class Svr4RT {
    constructor(pri) {
        this.name = "RealTime"
        this.rtdpent = {
            rt_glopri: pri,
            rt_quantum: rt_dptbl(pri)
        };
        this.rtproc = {
            rt_pquantum: this.rtdpent.rt_quantum,
            rt_timeleft: this.rtdpent.rt_quantum,
            rt_pri: pri
        };
    }

    getPriority() {
        return this.rtproc.rt_pri;
    }

    getData() {
        return {
            rtdpent: this.rtdpent,
            rtproc: this.rtproc
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