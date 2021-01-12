class PriorityQueue 
{ 
    constructor(pri, element) { 
        this.items = [element]; 
        this.priority = pri;
    } 
                  
    // Añade un elemento al final de la cola
    enqueue(element) {     
        this.items.push(element); 
    } 

    // Extrae un elemento del principio
    dequeue() { 
        if(this.isEmpty()) 
            return "Underflow"; 
        return this.items.shift(); 
    }

    // Comprueba si está vacía
    isEmpty() { 
        return this.items.length == 0; 
    } 
    
    // Devuelve el primer elemento sin eliminarlo
    front() { 
        if(this.isEmpty()) 
            return "No elements in Queue"; 
        return this.items[0]; 
    }

    getData() {
        return {
            priority : this.priority,
            items : Array.from(this.items)
        }
    }
} 

export default PriorityQueue;