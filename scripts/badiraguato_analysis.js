// Análisis científico de Badiraguato con datos reales del CSV IDM_NM_jul25.csv
// SESNSP - Datos municipales enero 2024 a julio 2025

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando análisis científico de Badiraguato...');
    
    // Datos reales extraídos del análisis del CSV
    const badiraguatoData = {
        labels: ['Ene24', 'Feb24', 'Mar24', 'Abr24', 'May24', 'Jun24', 'Jul24', 'Ago24', 'Sep24', 'Oct24', 'Nov24', 'Dic24', 'Ene25', 'Feb25', 'Mar25', 'Abr25', 'May25', 'Jun25', 'Jul25'],
        datasets: [
            {
                label: 'Otros delitos que atentan contra la vida y la integridad corporal (+336.4%)',
                data: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 0, 3, 0],
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.1,
                fill: false
            },
            {
                label: 'Abuso sexual (+100.0%)',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 2, 1, 0],
                borderColor: '#fd7e14',
                backgroundColor: 'rgba(253, 126, 20, 0.1)',
                tension: 0.1,
                fill: false
            }
        ]
    };

    // Crear gráfica
    createBadiraguatoChart();
    
    // Crear tabla de valores mensuales
    createBadiraguatoTable();
    
    // Crear tabla comparativa de promedios
    createBadiraguatoComparisonTable();
});

function createBadiraguatoChart() {
    const ctx = document.getElementById('chart-badiraguato-evolution');
    if (!ctx) {
        console.error('Canvas chart-badiraguato-evolution no encontrado');
        return;
    }

    // Destruir gráfica existente si existe
    if (window.badiraguatoChart) {
        console.log('🗑️ Destruyendo gráfica existente de Badiraguato');
        window.badiraguatoChart.destroy();
    }

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Ene24', 'Feb24', 'Mar24', 'Abr24', 'May24', 'Jun24', 'Jul24', 'Ago24', 'Sep24', 'Oct24', 'Nov24', 'Dic24', 'Ene25', 'Feb25', 'Mar25', 'Abr25', 'May25', 'Jun25', 'Jul25'],
            datasets: [
                {
                    label: 'Otros delitos que atentan contra la vida y la integridad corporal (+336.4%)',
                    data: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 0, 3, 0],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.1,
                    fill: false,
                    borderWidth: 2
                },
                {
                    label: 'Abuso sexual (+100.0%)',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 2, 1, 0],
                    borderColor: '#fd7e14',
                    backgroundColor: 'rgba(253, 126, 20, 0.1)',
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

    Chart.register(warLine);
    chart.update();
    
    // Guardar referencia global para evitar conflictos
    window.badiraguatoChart = chart;
    console.log('✅ Gráfica de Badiraguato creada y guardada globalmente');
}

function createBadiraguatoTable() {
    const container = document.getElementById('tabla-badiraguato-valores');
    if (!container) {
        console.error('Contenedor tabla-badiraguato-valores no encontrado');
        return;
    }

    const meses = ['Ene24', 'Feb24', 'Mar24', 'Abr24', 'May24', 'Jun24', 'Jul24', 'Ago24', 'Sep24', 'Oct24', 'Nov24', 'Dic24', 'Ene25', 'Feb25', 'Mar25', 'Abr25', 'May25', 'Jun25', 'Jul25'];
    
    const delitos = [
        {
            nombre: 'Otros delitos que atentan contra la vida y la integridad corporal',
            cambio: '+336.4%',
            color: '#dc3545',
            datos: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 0, 3, 0]
        },
        {
            nombre: 'Abuso sexual',
            cambio: '+100.0%',
            color: '#fd7e14',
            datos: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 2, 1, 0]
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
    `;
    
    container.innerHTML = tableHTML;
}

function createBadiraguatoComparisonTable() {
    const container = document.getElementById('tabla-badiraguato-comparacion');
    if (!container) {
        console.error('Contenedor tabla-badiraguato-comparacion no encontrado');
        return;
    }

    // Datos de comparación pre/post guerra
    const comparacionData = [
        {
            delito: 'Otros delitos que atentan contra la vida y la integridad corporal',
            promedio_antes: '0.12',
            promedio_despues: '0.55',
            cambio: '+336.4%'
        },
        {
            delito: 'Abuso sexual',
            promedio_antes: '0.00',
            promedio_despues: '0.45',
            cambio: '+100.0%'
        }
    ];

    let tableHTML = `
        <table class="data-table" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">TIPO DE DELITO</th>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">PROMEDIO ENE–AGO 2024</th>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">PROMEDIO SEP 2024–JUL 2025</th>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">CAMBIO %</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    comparacionData.forEach(row => {
        const isPositive = row.cambio.startsWith('+');
        const changeColor = isPositive ? '#dc3545' : '#28a745';
        
        tableHTML += `
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${row.delito}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${row.promedio_antes}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${row.promedio_despues}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; color: ${changeColor}; font-weight: bold;">${row.cambio}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}


