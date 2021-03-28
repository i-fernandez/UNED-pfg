
class Graphics {
    constructor() {
        this.colorIndex = 0;
    }

    // Dibuja un grafico de lineas
    drawLineChart (canvas, time) {
        // Convierte los datos
        let prData = this._parseTimeData(time);
        // Genera los datasets
        let params = [];
        let n_pid = 0;
        Object.keys(prData.pids).forEach(pid => {
            let color = this._getColor();
            let dataset = {
                label: `pid ${n_pid + 1}`,
                data: prData["pids"][n_pid],
                borderWidth: 3,
                fill: false,
                steppedLine: true,
                borderColor: color,
                backgroundColor: color
            }
            params.push(dataset);
            n_pid++;
        });
        // Muestra la grafica
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: prData.time,
                datasets: params
            },
            options: {    
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data){
                            let label = data.datasets[tooltipItem.datasetIndex].label || '';
                            let state = '';
                            switch (tooltipItem.yLabel) {
                                case 0:
                                    state = 'finished';
                                    break;
                                case 1:
                                    state = 'zombie';
                                    break;
                                case 2: 
                                    state = 'sleeping';
                                    break;
                                case 3:
                                    state = 'ready';
                                    break;
                                case 4:
                                    state = 'running_user';
                                    break;
                                case 5:
                                    state = 'running_kernel';
                                    break;
                                default:
                                    state = tooltipItem.yLabel;
                            };
                            return `${label}: ${state}`;   
                        },
                        title: function(tooltipItems, data) {
                            return `${tooltipItems[0].xLabel} ut.`;
                        }
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: 5,
                            sampleSize: 1,
                            callback: function(value) {
                                switch (value) {
                                    case 0:
                                        return 'finished';
                                    case 1:
                                        return 'zombie';
                                    case 2: 
                                        return 'sleeping';
                                    case 3:
                                        return 'ready';
                                    case 4:
                                        return 'running_user';
                                    case 5:
                                        return 'running_kernel';
                                    default:
                                        return '';
                                };
                            }
                        }
                    }],
                    xAxes:[{
                        ticks: {
                            callback: function(value) {return `${value} ut.`;}
                        }
                    }]
                }
            }
        });
    }

    /* Dibuja un grafico de barras */
    drawBarChart(canvas, proc_data) {
        let labels = [];
        let wait = [];
        let run_user = [];
        let run_kernel = [];
        proc_data.pids.forEach(pid => {labels.push(`pid ${pid}`)});
        proc_data.time.forEach(proc => {
            wait.push(proc[0]);
            run_user.push(proc[1]);
            run_kernel.push(proc[2]);
        });


        let barData = {
            labels: labels,
            datasets: [{
                label: 'En espera',
                data: wait,
                backgroundColor: 'RGB(239, 134, 119)',
            }, {
                label: 'Ejecución en modo usuario',
                data: run_user,
                backgroundColor: 'RGB(160, 231, 125)',
            }, {
                label: 'Ejecución en modo núcleo',
                data: run_kernel,
                backgroundColor: 'RGB(85, 125, 65)',
            }]
        };
        
        new Chart(canvas, {
            type: 'bar',
            data: barData,
            options: {
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            let label = data.datasets[tooltipItem.datasetIndex].label || '';
                            return `${label}: ${tooltipItem.yLabel} ut.`
                        },
                        title: function(tooltipItems, data) {
                            return `${tooltipItems[0].xLabel}`;
                        }
                    }
                },
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            callback: function(value) {return `${value} ut.`}
                        },
                        stacked: true
                    }]
                }
            }
        });

    }

    // Convierte el formato de tiempos/estados
    // TODO: usar el JSON generado por los estados
    _parseTimeData(timeSeries) {
        let time = [];
        let pids = [];
        // Crea los arrays vacios de los pids
        for (let i=1; i< timeSeries[0].length; i++) {
            pids.push([]);
        }
        // Rellena los datos
        timeSeries.forEach(item => {
            time.push(item[0]);
            for (let i=1; i< item.length; i++) {
                pids[i-1].push(item[i]);
            }
        });
        return {time: time, pids: pids}
    }

    // Genera los colores de forma ciclica
    _getColor() {
        let colors = [
            'RGB(239, 134, 119)',
            'RGB(160, 231, 125)',
            'RGB(130, 182, 217)',
            'RGB(255, 219, 148)',
            'RGB(225, 150, 220)',
            'RGB(170, 215, 220)',
            'RGB(190, 170, 235)'
        ];
        let i = this.colorIndex % colors.length;
        this.colorIndex++;
        return colors[i];
    }
}

export default Graphics;

