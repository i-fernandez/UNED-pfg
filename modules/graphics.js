
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
                                    state = 'runngin_user';
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
                                        return 'runngin_user';
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

    // Dibuja un grafico de barras
    drawBarChart(canvas) {

        let barData = {
            //labels: ['pid 1', 'pid 2', 'pid 3', 'pid 4'],
            labels: ['pid 1'],
            datasets: [{
                label: 'Tiempo de espera',
                data: [10],
                //data: [10, 20, 30, 15],
                backgroundColor: 'RGB(239, 134, 119)',
            }, {
                label: 'Tiempo de ejecución',
                //data: [100, 150, 130, 90],
                data: [100],
                backgroundColor: 'RGB(160, 231, 125)',
            }]
        };

     

        new Chart(canvas, {
            type: 'bar',
            data: barData,
            options: {
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        });

    }

    // Convierte el formato de tiempos/estados
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

    // Genera el siguiente color
    _getColor() {
        let colors = [
            'RGB(239, 134, 119)',
            'RGB(160, 231, 125)',
            'RGB(130, 182, 217)',
            'RGB(255, 219, 148)'
        ];
        let i = this.colorIndex % colors.length;
        this.colorIndex++;
        return colors[i];
    }
}

export default Graphics;

