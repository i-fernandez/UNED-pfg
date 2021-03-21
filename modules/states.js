class StateManager {
    constructor() {
        this.currentState = 0;
        this.states = [];
        this.timeSeries = [];
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

    pushState(state) {
        this.states.push(state);
    }

    pushTime(timeData) {
        this.timeSeries.push(timeData);
    }

    getTimeSeries() {
        return this.timeSeries;
    }

}

export default StateManager;

