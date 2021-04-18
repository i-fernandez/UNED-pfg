class PriorityQueue { 
    constructor(pri, element) {
        this.priority = pri;
        this.items = [];
        if (element)
            this.items.push(element);
    }
    
                  
    /* Añade un elemento al final de la cola */
    enqueue(element) {     
        this.items.push(element); 
    } 

    /* Añade un elemento al inicio de la cola */
    addFront(element) {
        this.items.unshift(element);
    }

    /* Elimina de la cola un elemento concreto */
    remove(element) {
        let i = this.items.findIndex(item => item.pid == element.pid);
        this.items.splice(i,1);
    }

    /* Extrae un elemento del principio */
    dequeue() { 
        if(this.isEmpty()) 
            return "Underflow"; 
        return this.items.shift(); 
    }

    /* Comprueba si está vacía */
    isEmpty() { 
        return this.items.length == 0; 
    } 
    
    /* Devuelve el primer elemento sin eliminarlo */
    front() { 
        if(this.isEmpty()) 
            return "No elements in Queue"; 
        return this.items[0]; 
    }

    /* Devuelve el numero de cola seguido de los pids encolados */
    getData() {
        let pids = [];
        this.items.forEach(pr => {pids.push(pr.p_pid)});
        return {
            priority: this.priority,
            items: pids
        }
    }
} 

export default PriorityQueue;