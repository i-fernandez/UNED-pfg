class Event {
    constructor() {
      this.listeners = [];
    }
  
    /* Añade un listener al evento */
    addListener(listener) {
      this.listeners.push(listener);
    }
  
    /* Añade el disparador al evento */
    trigger(params) {
      this.listeners.forEach(listener => { listener(params); });
    }
 }
  
export default Event;