class StateManager {
    constructor() {
        this.currentState = 0;
        this.states = [];
        this.timeSeries = [];
        this.progressData = '';
    }

    getNextState() {
        if (this.currentState+1 < this.states.length) 
            this.currentState++;
        
        return this.states[this.currentState];
    }

    getPreviousState() {
        if (this.currentState > 0) 
            this.currentState--;
        
        return this.states[this.currentState];
    }

    // TODO: modificar el formato
    // [time, time, time]
    // [pid1, pid1, pid1]
    // [pid2, pid2, pid2]
    pushState(state) {
        this.states.push(state);
    }

    /*
    pushJSON(json) {
        let data = JSON.parse(json);
        if (this.timeData) {
            this.timeData.time.push(data.time[0]);
            this.timeData.pids.forEach(pr => {
                this.timeData.pids[pr].push(data.pids[pr][0]);
            });
        } else {
            this.timeData = data;
        }
        console.log(this.timeData);

    }
    */

    pushTime(timeData) {
        this.timeSeries.push(timeData);
    }

    /*
    getTimeSeries() {
        return this.timeSeries;
    }
    */

    getProgressData() {
        return this.progressData;
    }

    /* Genera los datos de progreso en formato JSON */
    createJSON() {
        this.progressData = `{ "time" : [`
        this.timeSeries.forEach(item => {this.progressData += `${item[0]}, `});
        this.progressData = this.progressData.slice(0, -2);
        this.progressData += `], `;
        this.progressData += `"pids" : {`
        
        for (let i=1; i<this.timeSeries[0].length; i++) {
            // Añade los pids
            this.progressData += `"${i}" : [`;
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

