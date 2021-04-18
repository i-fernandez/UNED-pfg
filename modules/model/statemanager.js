class StateManager {
    constructor() {
        this.currentState = 0;
        this.states = [];
        this.timeSeries = [];
        this.progressData = '';
    }

    /* Devuelve el estado posterior (si existe) */
    getNextState() {
        if (this.currentState+1 < this.states.length) 
            this.currentState++;
        
        return this.states[this.currentState];
    }

    /* Devuelve el estado anterior (si existe) */
    getPreviousState() {
        if (this.currentState > 0) 
            this.currentState--;
        
        return this.states[this.currentState];
    }

    /* Envia un estado al almacen */
    pushState(state) {
        this.states.push(state);
    }

    /* Envía datos de progreso de un tiempo determinado */
    pushTime(timeData) {
        this.timeSeries.push(timeData);
    }

    /* Devuelve los datos de progreso en formato JSON */
    getProgressData() {
        return this.progressData;
    }

    /* Genera los datos de progreso en formato JSON */
    generateProgress() {
        this.progressData = `{ "name" : "${this.timeSeries[0][0]}", "time" : [`
        this.timeSeries.forEach(item => {this.progressData += `${item[1]}, `});
        this.progressData = this.progressData.slice(0, -2);
        this.progressData += `], `;
        this.progressData += `"pids" : {`
        
        for (let i=2; i<this.timeSeries[0].length; i++) {
            // Añade los pids
            this.progressData += `"${i-1}" : [`;
            // Añade los estados
            this.timeSeries.forEach(item => {
                this.progressData += `${item[i]}, `
            });
            this.progressData = this.progressData.slice(0, -2);
            this.progressData += `], `;
        }
        this.progressData = this.progressData.slice(0, -2);
        this.progressData += `}}`;
    }
}

export default StateManager;

