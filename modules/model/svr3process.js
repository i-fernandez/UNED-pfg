class Svr3Process {
    constructor(pid, execution, cpu_burst, io_burst, pri) {
        // constantes
        this.PUSER = 50;
        this.PRIORITIES = [10, 20, 21, 25, 28, 29, 30, 35 ,40];

        this.p_pid = pid;
        this.p_state = 'ready';
        this.p_pri = pri;
        this.p_usrpri = pri;
        this.p_cpu = 0;
        this.p_nice = 20;
        this.p_wchan = -1;

        this.execution = execution;
        this.cpu_burst = cpu_burst;
        this.io_burst = io_burst;
        this.wait_time = 0;
        this.current_cycle_time = 0;
        this.finish_time = 0;

        this.run_usr = 0;
        this.run_ker = 0;
        this.kernelCount = 0;  // numero de Ticks en modo nucleo
    }

    /* Recalcula la prioridad */
    calcPriority() {
        this.p_pri = Math.floor(this.PUSER + this.p_cpu/4 + this.p_nice*2);
        this.p_usrpri = this.p_pri;
        return `Recalculada la prioridad del proceso ${this.p_pid}.
            Nueva prioridad: ${this.p_pri}`;
    }

    /* Aplica factor decay al proceso */
    decay() {
        if (this.p_state != 'zombie' && this.p_state != 'finished')
            this.p_cpu = Math.floor(this.p_cpu/2);
    }

    /* Ejecuta un tick de reloj */
    runTick(time, currentTime) {
        let text = '';
        switch (this.p_state) {
            case 'running_kernel':
                text += this._tick_kernel(time);
            case 'running_user':
                text += this._tick_user(time, currentTime);
                break;
            case 'sleeping':
                text += this._tick_sleep(time);
                break;
            case 'ready':
                this.wait_time += time;
                break;
            case 'zombie':
                this.p_state = 'finished';
                break;
            default:
                break;
        }
        return text;
    }

    /* Datos de la pantalla añadir proceso */
    getData() {
        return {
            p_pid: this.p_pid,
            p_pri: this.p_pri,
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
            execution: this.execution,
            cpu_burst: this.cpu_burst,
            io_burst: this.io_burst,
            p_pri: this.p_pri,
            p_usrpri: this.p_usrpri,
            p_cpu: this.p_cpu,
            p_nice: this.p_nice,
            wait_time: this.wait_time,
            p_wchan: this.p_wchan
        };
    }

    /* Devuelve la informacion de los campos */
    getInfo() {
        return {
            p_pid: 'PID del proceso',
            p_state: 'Estado actual',
            execution: 'Tiempo restante hasta finalización',
            cpu_burst: 'Duración del ciclo de CPU',
            io_burst: 'Duración del ciclo de IO',
            p_pri: 'Prioridad actual',
            p_usrpri: 'Prioridad en modo usuario',
            p_cpu: 'Tics de uso de CPU',
            p_nice: 'Factor de amabilidad',
            wait_time: 'Tiempo de espera acumulado',
            p_wchan: 'Dirección de dormir'
        };
    }

    /* Datos para la vista resumen */
    getSummaryData() {
        return [this.wait_time, this.run_usr-this.run_ker, this.run_ker];
    }

    /* Devuelve la representacion numerica del estado */
    getStateNumber() {
        switch (this.p_state) {
            case 'running_kernel':
                return 5;
            case 'running_user':
                return 4;
            case 'ready':
                return 3;
            case 'sleeping':
                return 2;
            case 'zombie':
                return 1;
            case 'finished':
                return 0;
            default:
                return -1;
        }
    }

    /* Ejecuta un tick en modo núcleo */
    _tick_kernel(time) {
        this.run_ker += time;
        if (this.kernelCount > 1) {
            this.kernelCount--;
        }
        else {
            this.kernelCount = 2;
            this.p_pri = this.p_usrpri;
            this.p_state = 'running_user';
            return `Proceso ${this.p_pid} finaliza llamada al sistema. `;
        }
        return '';
    }

    /* Ejecuta un tick en modo usuario */
    _tick_user(time, currentTime) {                        
        this.run_usr += time;
        if (this.p_cpu < 127)   
            this.p_cpu++;
        if (this.execution <= time)  {
            // Ejecución finalizada
            this.execution = 0;
            this.p_state = 'zombie';
            return `Proceso ${this.p_pid} finalizado en ${currentTime} ut. `;
        } else {
            this.execution -= time;
            this.current_cycle_time += time;
            if (this.current_cycle_time >= this.cpu_burst) {
                // Finalizado ciclo CPU
                this.p_state = 'sleeping';
                this.current_cycle_time = 0;
                this.kernelCount = 2;
                this.p_wchan = this.PRIORITIES[Math.floor(Math.random() * this.PRIORITIES.length)]
                return `Proceso ${this.p_pid} finaliza su ciclo de CPU.
                    Direccion de dormir: ${this.p_wchan} `;
            }
        }
        return '';
    }

    /* Ejecuta un tick en estado sleeping */
    _tick_sleep(time) {
        this.current_cycle_time += time;
        if (this.current_cycle_time >= this.io_burst) {
            // Finaliza ciclo IO
            this.p_state = 'ready';
            this.current_cycle_time = 0;
            this.p_pri = this.p_wchan;
            this.p_wchan = -1;
            return `Proceso ${this.p_pid} finaliza su espera por I/O. 
                Aumentada prioridad temporalmente a ${this.p_pri} `;
        }
        return '';
    }
}

export default Svr3Process;