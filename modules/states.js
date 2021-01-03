class StateManager {
    constructor() {
        this.currentState = 0;
        this.states = [];
    }

    getNextState() {
        if (this.currentState+1 < this.states.length) 
            this.currentState++;
        
        return states[this.currentState];
    }

    getPreviousState() {
        if (this.currentState > 0) 
            this.currentState--;
        
        return states[this.currentState];
    }

    pushState(state) {
        this.states.push(state);
    }

}

export default StateManager;

