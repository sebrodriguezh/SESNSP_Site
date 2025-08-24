// Análisis de Mocorito con datos reales del CSV IDM_NM_jul25.csv
// SESNSP - Datos municipales enero 2024 a julio 2025

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando análisis de Mocorito...');
    
    // Datos reales extraídos del análisis del CSV
    const mocoritoData = {
        labels: ['Ene24', 'Feb24', 'Mar24', 'Abr24', 'May24', 'Jun24', 'Jul24', 'Ago24', 'Sep24', 'Oct24', 'Nov24', 'Dic24', 'Ene25', 'Feb25', 'Mar25', 'Abr25', 'May25', 'Jun25', 'Jul25'],
        datasets: [
            {
                label: 'Otros delitos que atentan contra la libertad personal (+409.1%)',
                data: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 3, 3, 1, 0, 3, 4, 1, 4],
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.1,
                fill: false
            },
            {
                label: 'Robo de vehículo automotor (+147.3%)',
                data: [2, 0, 0, 1, 1, 2, 3, 1, 5, 4, 2, 4, 3, 0, 0, 2, 7, 4, 3],
                borderColor: '#fd7e14',
                backgroundColor: 'rgba(253, 126, 20, 0.1)',
                tension: 0.1,
                fill: false
            },
            {
                label: 'Homicidio doloso (+134.3%)',
                data: [2, 1, 0, 2, 2, 0, 1, 1, 3, 2, 0, 1, 2, 1, 0, 3, 10, 7, 0],
                borderColor: '#e83e8c',
                backgroundColor: 'rgba(232, 62, 140, 0.1)',
                tension: 0.1,
                fill: false
            },

            {
                label: 'Feminicidio (+100.0%)',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                borderColor: '#20c997',
                backgroundColor: 'rgba(32, 201, 151, 0.1)',
                tension: 0.1,
                fill: false
            },
            {
                label: 'Violencia familiar (-45.1%)',
                data: [6, 7, 6, 6, 7, 6, 5, 6, 3, 4, 3, 3, 4, 3, 3, 4, 3, 3, 4],
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                tension: 0.1,
                fill: false
            }
        ]
    };

    // Crear gráfica
    createMocoritoChart();
    
    // Crear tabla
    createMocoritoTable();
    
    // Agregar línea vertical en septiembre 2024
    addWarMarker();
});

function createMocoritoChart() {
    const ctx = document.getElementById('chart-mocorito-evolution');
    if (!ctx) {
        console.error('Canvas chart-mocorito-evolution no encontrado');
        return;
    }

    // Destruir gráfica existente si existe
    if (window.mocoritoChart) {
        console.log('🗑️ Destruyendo gráfica existente de Mocorito');
        window.mocoritoChart.destroy();
    }

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Ene24', 'Feb24', 'Mar24', 'Abr24', 'May24', 'Jun24', 'Jul24', 'Ago24', 'Sep24', 'Oct24', 'Nov24', 'Dic24', 'Ene25', 'Feb25', 'Mar25', 'Abr25', 'May25', 'Jun25', 'Jul25'],
            datasets: [
                {
                    label: 'Otros delitos que atentan contra la libertad personal (+409.1%)',
                    data: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 3, 3, 1, 0, 3, 4, 1, 4],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.1,
                    fill: false,
                    borderWidth: 2
                },
                {
                    label: 'Robo de vehículo automotor (+147.3%)',
                    data: [2, 0, 0, 1, 1, 2, 3, 1, 5, 4, 2, 4, 3, 0, 0, 2, 7, 4, 3],
                    borderColor: '#fd7e14',
                    backgroundColor: 'rgba(253, 126, 20, 0.1)',
                    tension: 0.1,
                    fill: false,
                    borderWidth: 2
                },
                {
                    label: 'Homicidio doloso (+134.3%)',
                    data: [2, 1, 0, 2, 2, 0, 1, 1, 3, 2, 0, 1, 2, 1, 0, 3, 10, 7, 0],
                    borderColor: '#e83e8c',
                    backgroundColor: 'rgba(232, 62, 140, 0.1)',
                    tension: 0.1,
                    fill: false,
                    borderWidth: 2
                },
                
                {
                    label: 'Feminicidio (+100.0%)',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                    borderColor: '#20c997',
                    backgroundColor: 'rgba(32, 201, 151, 0.1)',
                    tension: 0.1,
                    fill: false,
                    borderWidth: 2
                },
                {
                    label: 'Violencia familiar (-45.1%)',
                    data: [6, 7, 6, 6, 7, 6, 5, 6, 3, 4, 3, 3, 4, 3, 3, 4, 3, 3, 4],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.1,
                    fill: false,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        title: function(context) {
                            return 'Mes: ' + context[0].label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Período (Enero 2024 - Julio 2025)'
                    },
                    grid: {
                        display: true
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Número de Casos'
                    },
                    beginAtZero: true,
                    grid: {
                        display: true
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });

    // Agregar línea vertical en septiembre 2024 (posición 8)
    const warLine = {
        id: 'warLine',
        beforeDraw(chart) {
            const {ctx, chartArea: {left, top, width, height}, scales: {x}} = chart;
            const xPos = x.getPixelForValue('Sep24');
            
            ctx.save();
            ctx.strokeStyle = '#dc3545';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(xPos, top);
            ctx.lineTo(xPos, top + height);
            ctx.stroke();
            ctx.restore();
            
            // Agregar etiqueta
            ctx.save();
            ctx.fillStyle = '#dc3545';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Inicio Guerra', xPos, top + 20);
            ctx.restore();
        }
    };

    // Registrar el plugin de línea de guerra
    Chart.register(warLine);
    chart.update();
    
    // Guardar referencia global para evitar conflictos
    window.mocoritoChart = chart;
    console.log('✅ Gráfica de Mocorito creada y guardada globalmente');
}

function createMocoritoTable() {
    const container = document.getElementById('tabla-mocorito-valores');
    if (!container) {
        console.error('Contenedor tabla-mocorito-valores no encontrado');
        return;
    }

    const meses = ['Ene24', 'Feb24', 'Mar24', 'Abr24', 'May24', 'Jun24', 'Jul24', 'Ago24', 'Sep24', 'Oct24', 'Nov24', 'Dic24', 'Ene25', 'Feb25', 'Mar25', 'Abr25', 'May25', 'Jun25', 'Jul25'];
    
    const delitos = [
        {
            nombre: 'Otros delitos que atentan contra la libertad personal',
            cambio: '+409.1%',
            color: '#dc3545',
            datos: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 3, 3, 1, 0, 3, 4, 1, 4]
        },
        {
            nombre: 'Robo de vehículo automotor',
            cambio: '+147.3%',
            color: '#fd7e14',
            datos: [2, 0, 0, 1, 1, 2, 3, 1, 5, 4, 2, 4, 3, 0, 0, 2, 7, 4, 3]
        },
        {
            nombre: 'Homicidio doloso',
            cambio: '+134.3%',
            color: '#e83e8c',
            datos: [2, 1, 0, 2, 2, 0, 1, 1, 3, 2, 0, 1, 2, 1, 0, 3, 10, 7, 0]
        },

        {
            nombre: 'Feminicidio',
            cambio: '+100.0%',
            color: '#20c997',
            datos: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
        },
        {
            nombre: 'Violencia familiar',
            cambio: '-45.1%',
            color: '#28a745',
            datos: [6, 7, 6, 6, 7, 6, 5, 6, 3, 4, 3, 3, 4, 3, 3, 4, 3, 3, 4]
        }
    ];

    let tableHTML = `
        <table class="data-table" style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
            <thead>
                <tr style="background-color: #f8f9fa;">
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left; min-width: 200px;">Subtipo de Delito</th>
    `;
    
    // Encabezados de meses
    meses.forEach(mes => {
        tableHTML += `<th style="padding: 8px; border: 1px solid #ddd; text-align: center; min-width: 50px;">${mes}</th>`;
    });
    
    tableHTML += `
                </tr>
            </thead>
            <tbody>
    `;
    
    // Filas de datos
    delitos.forEach(delito => {
        tableHTML += `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: ${delito.color};">${delito.nombre} (${delito.cambio})</td>
        `;
        
        delito.datos.forEach((valor, index) => {
            const isWarStart = index === 8; // Septiembre 2024
            const cellStyle = isWarStart ? 
                `padding: 8px; border: 1px solid #dc3545; text-align: center; background-color: #fff5f5; font-weight: bold;` :
                `padding: 8px; border: 1px solid #ddd; text-align: center;`;
            
            tableHTML += `<td style="${cellStyle}">${valor}</td>`;
        });
        
        tableHTML += `</tr>`;
    });
    
    tableHTML += `
            </tbody>
        </table>
        <p class="chart-note"><strong>Nota:</strong> La columna de Septiembre 2024 (Sep24) está resaltada en rojo para marcar el inicio de la guerra. Datos reales del CSV IDM_NM_jul25.csv.</p>
    `;
    
    container.innerHTML = tableHTML;
}

function addWarMarker() {
    console.log('Marcador de guerra agregado a la gráfica');
}
