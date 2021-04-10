import Svr4ProcRT from './svr4procRT.js'
import Svr4ProcTS from './svr4procTS.js'

class Svr4Process {
    constructor(sched, pid, execution, cpu_burst, io_burst, pClass, pri) {
        // constantes
        this.STATES = ['finished','zombie','sleeping','ready','running_user','running_kernel'];

        this.sched = sched;
        this.p_pid = pid;
        this.p_state = 'ready';
        this.p_pri = pri;
        this.execution = execution;
        this.cpu_burst = cpu_burst;
        this.io_burst = io_burst;
        this.current_cycle_time = 0;
        this.wait_time = 0;
        this.run_usr = 0;
        this.run_ker = 0;
        this.finish_time = 0;    // tiempo de finalización  
        this.kernelCount = 0;    // numero de Ticks en modo nucleo
        this.class = (pClass == 'RealTime') ? new Svr4ProcRT(this) : new Svr4ProcTS(this);
    }

    /* Ejecuta un tick de reloj */
    runTick() {
        let text = '';
        switch (this.p_state) {
            case 'running_kernel':
                text += this._tick_kernel();
            case 'running_user':
                text += this._tick_user();       
                break;
            case 'sleeping':
                text += this._tick_sleep();
                break;
            case 'ready':
                this.wait_time += this.sched.TICK;
                break;
            case 'zombie':
                this.p_state = 'finished';
                break;
            default:
                break;
        }
        return text;
    }

    /* Inicia la ejecución del proceso */
    startRun() {
        if (this.kernelCount  > 0)
            this.p_state = 'running_kernel';
        else
            this.p_state = 'running_user';

        this.roundRobin = false;
        this.resetQuantum();
    }

    /* Reinicia el cuanto asociado */
    resetQuantum() {
        this.class.resetQuantum();
    }

    /* Datos de la pantalla añadir proceso */
    getData() {
        return {
            p_pid: this.p_pid,
            p_pri: this.p_pri,
            class: this.class.name,
            execution: this.execution,
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
            execution: this.execution,
            cpu_burst: this.cpu_burst,
            io_burst: this.io_burst,
            wait_time: this.wait_time
        };
    }

    /* Devuelve la informacion de los campos */
    getInfo() {
        return {
            p_pid: 'PID del proceso',
            p_state: 'Estado actual',
            p_pri: 'Prioridad actual',
            class: 'Clase del proceso',
            execution: 'Tiempo restante hasta finalización',
            cpu_burst: 'Duración del ciclo de CPU',
            io_burst: 'Duración del ciclo de IO',
            wait_time: 'Tiempo de espera acumulado'  
        };
    }

    /* Devuelve la información de los campos de cada clase */
    getClassInfo() {
        return this.class.getInfo();
    }

    /* Devuelve los datos para la vista resumen */
    getSummaryData() {
        return [this.wait_time, this.run_usr-this.run_ker, this.run_ker];
    }

    /* Devuelve los datos pertenecientes a la clase */
    getClassData() {
        return this.class.getData();
    }

    /* Devuelve la representacion numerica del estado */
    getStateNumber() {
        return this.STATES.indexOf(this.p_state);
    }

    /* Ejecuta un tick en modo running_kernel */
    _tick_kernel() {
        this.run_ker += this.sched.TICK;
        if (this.kernelCount > 1) {
            this.kernelCount--;
        }
        else {
            this.kernelCount = 2;
            this.p_state = 'running_user';
            this.class.fromSysCall();
            return `Proceso ${this.p_pid} finaliza llamada al sistema. `;
        }
        return '';
    }

    /* Ejecuta un tick en modo running_user */
    _tick_user() {
        this.run_usr += this.sched.TICK;
        if (this.execution <= this.sched.TICK) {
            // finalizada ejecucion
            this.execution = 0;
            this.p_state = 'zombie';
            return `Proceso ${this.p_pid} finalizado en ${this.sched.time} ut. `;
        } else {
            this.execution -= this.sched.TICK;
            this.current_cycle_time += this.sched.TICK;
            return this.class.tick_user();
        }
    }

    /* Ejecuta un tick en modo sleeping */
    _tick_sleep() {
        this.current_cycle_time += this.sched.TICK;
        if (this.current_cycle_time >= this.io_burst) {
            this.p_state = 'ready';
            this.current_cycle_time = 0;
            return this.class.fromSleep();
        }
        return '';
    } 
}

export default Svr4Process;