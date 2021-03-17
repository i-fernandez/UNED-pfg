

class Svr4TS {
    constructor(proc) {
        this.name = "TimeSharing";
        this.proc = proc;
        //this.p_pid = pid;

        // Tiempo de inicio del cuanto
        this.startQuantum = 0;

        // Prioridad global
        this.ts_globpri = 0;
        // Cuanto asignado a la prioridad
        this.ts_quantum = 0;
        // Valor ts_cpupri asignado cuando expira el cuanto
        this.ts_tqexp = 0;
        // Valor ts_cpupri asignado cuando vuelve a modo usuario despues de dormir
        this.ts_slpret = 0;
        // Segundos de espera a que el cuanto expire antes de usar ts_lwait
        this.ts_maxwait = 0;
        // Usado en lugar de ts_tqexp si el proceso tarda mas de ts_maxwait en usar su cuanto
        this.ts_lwait = 0;
        
        this._readDptbl(proc.p_pri);

        // Tiempo restante del cuanto asignado
        this.ts_timeleft = this.ts_quantum;
        // Parte de prioridad del sistema
        this.ts_cpupri = proc.p_pri;
        // Parte de prioridad del usuario (nice)
        this.ts_upri = 0;
        // Prioridad en modo usuario (cpu_pri+upri), menor de 59
        this.ts_umdpri = proc.p_pri;
        // Número de segundos desde que comenzó el cuanto
        this.ts_dispwait = 0;        
        // Número de ut desde que comenzo el cuanto
        this.wait = 0;
    }

    getPriority() {
        return this.ts_umdpri;
    }

    getData() {
        return {
            p_pid: this.proc.p_pid,
            ts_timeleft: this.ts_timeleft,
            ts_cpupri: this.ts_cpupri,
            ts_upri: this.ts_upri,
            ts_umdpri: this.ts_umdpri,
            ts_dispwait: this.ts_dispwait,
            ts_globpri: this.ts_globpri,
            ts_quantum: this.ts_quantum,
            ts_tqexp: this.ts_tqexp,
            ts_slpret: this.ts_slpret,
            ts_maxwait: this.ts_maxwait,
            ts_lwait: this.ts_lwait
        }
    }

    getInfo() {
        return {
            p_pid: "PID del proceso",
            ts_timeleft: "Tiempo restante del cuanto",
            ts_cpupri: "Parte de prioridad del sistema",
            ts_upri: "Parte de prioridad del usuario",
            ts_umdpri: "Prioridad en modo usuario",
            ts_dispwait: "Segundos desde que comenzo el cuanto",
            ts_globpri: "Prioridad global",
            ts_quantum: "Cuanto asignado a la prioridad",
            ts_tqexp: "Prioridad de sistema asignada cuando expira el cuanto",
            ts_slpret: "Prioridad del sistema al volver a modo usuario despues de dormir",
            ts_maxwait: "Segundos de espera a que el cuanto finalice antes de usar ts_lwait",
            ts_lwait: "Usado en lugar de ts_tqexp si el proceso tarda mas de ts_maxwait segundos en finalizar su cuanto"
        }
    }

    resetQuantum() {
        this.ts_timeleft = this.ts_quantum;
        this.wait = 0;
        this.ts_dispwait = 0;
    }

    _updateQuantum() {
        this.wait += this.proc.sched.TICK * this.proc.sched.time;
        this.ts_dispwait = Math.floor(this.wait / 1000);
    }

    
    _readDptbl(pri) {
        this.ts_globpri = pri;
        this.ts_quantum = ts_dptbl(pri)[1];
        this.ts_tqexp = ts_dptbl(pri)[2];
        this.ts_slpret = ts_dptbl(pri)[3];
        this.ts_maxwait = ts_dptbl(pri)[4];
        this.ts_lwait = ts_dptbl(pri)[5];
    }

    _setPri() {
        this.ts_umdpri = this.ts_cpupri + this.ts_upri;
        if (this.ts_umdpri > 59)
            this.ts_umdpri = 59;

        this.proc.p_pri = this.ts_umdpri;
        this._readDptbl(this.ts_umdpri);
        this.resetQuantum();
    }

    _quantumExpired() {
        if (this.ts_dispwait >= this.ts_maxwait)
            this.ts_cpupri = this.ts_lwait;            
        else 
            this.ts_cpupri = this.ts_tqexp;
        
        this._setPri();
        this.proc.sched.roundRobin();
        return "Cuanto del proceso " + this.proc.p_pid + " expirado." + 
                " Nueva prioridad: " + this.ts_umdpri;           
    }


    runTick() {
        let text = "";
        switch (this.proc.p_state) {
            case "running_kernel":

            case "running_user":
                this._updateQuantum();
                this.ts_timeleft -= this.proc.sched.TICK;
                if (this.proc.current_cycle_time >= this.proc.cpu_burst) {
                    text = this._toSleep();
                } else if (this.ts_timeleft <= 0) {
                    text = this._quantumExpired();
                }
                break;

            case "sleeping":
                this._updateQuantum();
                text = this._fromSleep();
                break;

            default:
                break;
        }
        return text;
    }

    _toSleep() {
        this.proc.p_state = "sleeping";
        this.proc.current_cycle_time = 0;
        this.proc.p_pri = Math.floor(Math.random() * (100 - 60) + 60);
        this.proc.kernelCount = 2;
        return "Proceso " + this.proc.p_pid + " finaliza su ciclo de CPU.";
    }

    _fromSleep() {
        return "Proceso " + this.proc.p_pid + " finaliza su espera por I/O."+
        " Prioridad temporalmente aumentada a " + this.proc.p_pri + ". ";
    }

    fromSysCall() {
        this.ts_cpupri = this.ts_slpret;
        this._setPri();
    }
}


function ts_dptbl(pri) {
    /* ts_globpri, ts_quantum, ts_tqexp, ts_slpret, ts_maxwait, ts_lwait */
    let ts_dptbl_t = [
        [0,   100,   0,   10,   5,  10],
        [1,   100,   0,   11,   5,  11],
        [2,   100,   1,   12,   5,  12],
        [3,   100,   1,   13,   5,  13],
        [4,   100,   2,   14,   5,  14],
        [5,   100,   2,   15,   5,  15],
        [6,   100,   3,   16,   5,  16],
        [7,   100,   3,   17,   5,  17],
        [8,   100,   4,   18,   5,  18],
        [9,   100,   4,   19,   5,  19],
        [10,   80,   5,   20,   5,  20],
        [11,   80,   5,   21,   5,  21],
        [12,   80,   6,   22,   5,  22],
        [13,   80,   6,   23,   5,  23],
        [14,   80,   7,   24,   5,  24],
        [15,   80,   7,   25,   5,  25],
        [16,   80,   8,   26,   5,  26],
        [17,   80,   8,   27,   5,  27],
        [18,   80,   9,   28,   5,  28],
        [19,   80,   9,   29,   5,  29],
        [20,   60,  10,   30,   5,  30],
        [21,   60,  11,   31,   5,  31],
        [22,   60,  12,   32,   5,  32],
        [23,   60,  13,   33,   5,  33],
        [24,   60,  14,   34,   5,  34],
        [25,   60,  15,   35,   5,  35],
        [26,   60,  16,   36,   5,  36],
        [27,   60,  17,   37,   5,  37],
        [28,   60,  18,   38,   5,  38],
        [29,   60,  19,   39,   5,  39],
        [30,   40,  20,   40,   5,  40],
        [31,   40,  21,   41,   5,  41],
        [32,   40,  22,   42,   5,  42],
        [33,   40,  23,   43,   5,  43],
        [34,   40,  24,   44,   5,  44],
        [35,   40,  25,   45,   5,  45],
        [36,   40,  26,   46,   5,  46],
        [37,   40,  27,   47,   5,  47],
        [38,   40,  28,   48,   5,  48],
        [39,   40,  29,   49,   5,  49],
        [40,   20,  30,   50,   5,  50],
        [41,   20,  31,   50,   5,  50],
        [42,   20,  32,   51,   5,  51],
        [43,   20,  33,   51,   5,  51],
        [44,   20,  34,   52,   5,  52],
        [45,   20,  35,   52,   5,  52],
        [46,   20,  36,   53,   5,  53],
        [47,   20,  37,   53,   5,  53],
        [48,   20,  38,   54,   5,  54],
        [49,   20,  39,   54,   5,  54],
        [50,   10,  40,   55,   5,  55],
        [51,   10,  41,   55,   5,  55],
        [52,   10,  42,   56,   5,  56],
        [53,   10,  43,   56,   5,  56],
        [54,   10,  44,   57,   5,  57],
        [55,   10,  45,   57,   5,  57],
        [56,   10,  46,   58,   5,  58],
        [57,   10,  47,   58,   5,  58],
        [58,   10,  48,   59,   5,  59],
        [59,   10,  49,   59,   5,  59]
    ];
    if (pri < 0 || pri > 59) return null;
    return ts_dptbl_t[pri];
}



export default Svr4TS;