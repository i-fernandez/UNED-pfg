class Process {
    constructor(pid, execution, cpu_burst, io_burst, pri) {
        // constantes
        this.STATES = ['finished','zombie','sleeping','ready','running_user'];

        this.p_pid = pid;
        this.p_state = 'ready';
        this.p_pri = pri;
        this.execution = execution;
        this.cpu_burst = cpu_burst;
        this.io_burst = io_burst;
        this.wait_time = 0;
        this.current_cycle_time = 0;
        this.finish_time = 0;
    }
}

export default Process;