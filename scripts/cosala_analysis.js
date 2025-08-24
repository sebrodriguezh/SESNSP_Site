// Análisis científico de Cosalá con datos reales del CSV IDM_NM_jul25.csv
// SESNSP - Datos municipales enero 2024 a julio 2025

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando análisis científico de Cosalá...');
    
    // Datos reales extraídos del análisis del CSV
    const cosalaData = {
        labels: ['Ene24', 'Feb24', 'Mar24', 'Abr24', 'May24', 'Jun24', 'Jul24', 'Ago24', 'Sep24', 'Oct24', 'Nov24', 'Dic24', 'Ene25', 'Feb25', 'Mar25', 'Abr25', 'May25', 'Jun25', 'Jul25'],
        datasets: [
            {
                label: 'Robo de vehículo automotor (+506.1%)',
                data: [1, 0, 0, 0, 0, 0, 0, 2, 2, 4, 4, 2, 2, 4, 3, 2, 1, 1, 0],
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.1,
                fill: false
            },
            {
                label: 'Otros robos (+481.8%)',
                data: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 2, 0, 2, 1, 1],
                borderColor: '#fd7e14',
                backgroundColor: 'rgba(253, 126, 20, 0.1)',
                tension: 0.1,
                fill: false
            },
            {
                label: 'Otros delitos que atentan contra la libertad personal (+263.6%)',
                data: [0, 1, 0, 0, 0, 0, 1, 0, 0, 2, 0, 1, 2, 0, 0, 3, 1, 0, 1],
                borderColor: '#e83e8c',
                backgroundColor: 'rgba(232, 62, 140, 0.1)',
                tension: 0.1,
                fill: false
            }
        ]
    };

    // Crear gráfica
    createCosalaChart();
    
    // Crear tabla de valores mensuales
    createCosalaTable();
    
    // Crear tabla comparativa de promedios
    createCosalaComparisonTable();
});

function createCosalaChart() {
    const ctx = document.getElementById('chart-cosala-evolution');
    if (!ctx) {
        console.error('Canvas chart-cosala-evolution no encontrado');
        return;
    }

    // Destruir gráfica existente si existe
    if (window.cosalaChart) {
        console.log('🗑️ Destruyendo gráfica existente de Cosalá');
        window.cosalaChart.destroy();
    }

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Ene24', 'Feb24', 'Mar24', 'Abr24', 'May24', 'Jun24', 'Jul24', 'Ago24', 'Sep24', 'Oct24', 'Nov24', 'Dic24', 'Ene25', 'Feb25', 'Mar25', 'Abr25', 'May25', 'Jun25', 'Jul25'],
            datasets: [
                {
                    label: 'Robo de vehículo automotor (+506.1%)',
                    data: [1, 0, 0, 0, 0, 0, 0, 2, 2, 4, 4, 2, 2, 4, 3, 2, 1, 1, 0],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.1,
                    fill: false,
                    borderWidth: 2
                },
                {
                    label: 'Otros robos (+481.8%)',
                    data: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 2, 0, 2, 1, 1],
                    borderColor: '#fd7e14',
                    backgroundColor: 'rgba(253, 126, 20, 0.1)',
                    tension: 0.1,
                    fill: false,
                    borderWidth: 2
                },
                {
                    label: 'Otros delitos que atentan contra la libertad personal (+263.6%)',
                    data: [0, 1, 0, 0, 0, 0, 1, 0, 0, 2, 0, 1, 2, 0, 0, 3, 1, 0, 1],
                    borderColor: '#e83e8c',
                    backgroundColor: 'rgba(232, 62, 140, 0.1)',
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
    window.cosalaChart = chart;
    console.log('✅ Gráfica de Cosalá creada y guardada globalmente');
}

function createCosalaTable() {
    const container = document.getElementById('tabla-cosala-valores');
    if (!container) {
        console.error('Contenedor tabla-cosala-valores no encontrado');
        return;
    }

    const meses = ['Ene24', 'Feb24', 'Mar24', 'Abr24', 'May24', 'Jun24', 'Jul24', 'Ago24', 'Sep24', 'Oct24', 'Nov24', 'Dic24', 'Ene25', 'Feb25', 'Mar25', 'Abr25', 'May25', 'Jun25', 'Jul25'];
    
    const delitos = [
        {
            nombre: 'Robo de vehículo automotor',
            cambio: '+506.1%',
            color: '#dc3545',
            datos: [1, 0, 0, 0, 0, 0, 0, 2, 2, 4, 4, 2, 2, 4, 3, 2, 1, 1, 0]
        },
        {
            nombre: 'Otros robos',
            cambio: '+481.8%',
            color: '#fd7e14',
            datos: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 2, 0, 2, 1, 1]
        },
        {
            nombre: 'Otros delitos que atentan contra la libertad personal',
            cambio: '+263.6%',
            color: '#e83e8c',
            datos: [0, 1, 0, 0, 0, 0, 1, 0, 0, 2, 0, 1, 2, 0, 0, 3, 1, 0, 1]
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

function createCosalaComparisonTable() {
    const container = document.getElementById('tabla-cosala-comparacion');
    if (!container) {
        console.error('Contenedor tabla-cosala-comparacion no encontrado');
        return;
    }

    // Datos de comparación pre/post guerra
    const comparacionData = [
        {
            delito: 'Robo de vehículo automotor',
            promedio_antes: '0.38',
            promedio_despues: '2.27',
            cambio: '+506.1%'
        },
        {
            delito: 'Otros robos',
            promedio_antes: '0.12',
            promedio_despues: '0.73',
            cambio: '+481.8%'
        },
        {
            delito: 'Otros delitos que atentan contra la libertad personal',
            promedio_antes: '0.25',
            promedio_despues: '0.91',
            cambio: '+263.6%'
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