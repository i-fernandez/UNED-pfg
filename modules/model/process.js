class Process {
    constructor(pid, execution, cpu_burst, io_burst, pri) {
        // constantes
        this.STATES = ['finished','zombie','sleeping','ready','running'];

        this.p_pid = pid;
        this.p_state = 'ready';
        this.p_pri = pri;
        this.execution = execution;
        this.cpu_burst = cpu_burst;
        this.io_burst = io_burst;
        this.wait_time = 0;
        this.current_cycle_time = 0;
        this.finish_time = 0;
        this.run = execution;
    }


    /* Ejecuta un tick de reloj */
    runTick(time, currentTime) {
        let text = '';
        switch (this.p_state) {
            case 'running':
                text += this._tick_running(time, currentTime);
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
            p_pri: this.p_pri
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
            p_pri: 'Prioridad actual'
        };
    }

    /* Datos para la vista resumen */
    getSummaryData() {
        return [this.wait_time, this.run];
    }

    /* Devuelve la representacion numerica del estado */
    getStateNumber() {
        return this.STATES.indexOf(this.p_state);
    }

    /* Ejecuta un tick en modo usuario */
    _tick_running(time, currentTime) {                        
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
                return `Proceso ${this.p_pid} finaliza su ciclo de CPU y sale de ejecución`;
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
            return `Proceso ${this.p_pid} finaliza su espera por I/O y es encolado.`;
        }
        return '';
    }
}

export default Process;