class View {
    constructor() {
    }

    render() {
        const header = document.createElement('div');
        header.className = 'header';


        
        document.body.appendChild(header);
    }

}

export default View;