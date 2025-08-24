// Análisis científico de Navolato con datos reales del CSV IDM_NM_jul25.csv
// SESNSP - Datos municipales enero 2024 a julio 2025

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando análisis científico de Navolato...');
    
    // Datos reales extraídos del análisis del CSV
    const navolatoData = {
        labels: ['Ene24', 'Feb24', 'Mar24', 'Abr24', 'May24', 'Jun24', 'Jul24', 'Ago24', 'Sep24', 'Oct24', 'Nov24', 'Dic24', 'Ene25', 'Feb25', 'Mar25', 'Abr25', 'May25', 'Jun25', 'Jul25'],
        datasets: [
            {
                label: 'Robo de vehículo automotor (+393.3%)',
                data: [6, 4, 2, 5, 1, 1, 4, 0, 14, 15, 10, 10, 15, 13, 9, 6, 21, 19, 24],
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.1,
                fill: false
            },
            {
                label: 'Otros delitos del Fuero Común (+367.5%)',
                data: [2, 1, 0, 0, 0, 2, 2, 0, 3, 2, 4, 3, 2, 3, 3, 4, 5, 6, 10],
                borderColor: '#fd7e14',
                backgroundColor: 'rgba(253, 126, 20, 0.1)',
                tension: 0.1,
                fill: false
            },
            {
                label: 'Homicidio doloso (+207.1%)',
                data: [1, 3, 2, 1, 4, 2, 1, 4, 3, 3, 3, 7, 3, 2, 8, 9, 4, 15, 19],
                borderColor: '#e83e8c',
                backgroundColor: 'rgba(232, 62, 140, 0.1)',
                tension: 0.1,
                fill: false
            },
            {
                label: 'Robo a negocio (+200.0%)',
                data: [1, 0, 2, 2, 0, 2, 1, 0, 1, 0, 2, 3, 0, 0, 0, 3, 5, 8, 11],
                borderColor: '#6f42c1',
                backgroundColor: 'rgba(111, 66, 193, 0.1)',
                tension: 0.1,
                fill: false
            }
        ]
    };

    // Crear gráfica
    createNavolatoChart();
    
    // Crear tabla de valores mensuales
    createNavolatoTable();
    
    // Crear tabla comparativa de promedios
    createNavolatoComparisonTable();
});

function createNavolatoChart() {
    const ctx = document.getElementById('chart-navolato-evolution');
    if (!ctx) {
        console.error('Canvas chart-navolato-evolution no encontrado');
        return;
    }

    // Destruir gráfica existente si existe
    if (window.navolatoChart) {
        console.log('🗑️ Destruyendo gráfica existente de Navolato');
        window.navolatoChart.destroy();
    }

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Ene24', 'Feb24', 'Mar24', 'Abr24', 'May24', 'Jun24', 'Jul24', 'Ago24', 'Sep24', 'Oct24', 'Nov24', 'Dic24', 'Ene25', 'Feb25', 'Mar25', 'Abr25', 'May25', 'Jun25', 'Jul25'],
            datasets: [
                {
                    label: 'Robo de vehículo automotor (+393.3%)',
                    data: [6, 4, 2, 5, 1, 1, 4, 0, 14, 15, 10, 10, 15, 13, 9, 6, 21, 19, 24],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.1,
                    fill: false,
                    borderWidth: 2
                },
                {
                    label: 'Otros delitos del Fuero Común (+367.5%)',
                    data: [2, 1, 0, 0, 0, 2, 2, 0, 3, 2, 4, 3, 2, 3, 3, 4, 5, 6, 10],
                    borderColor: '#fd7e14',
                    backgroundColor: 'rgba(253, 126, 20, 0.1)',
                    tension: 0.1,
                    fill: false,
                    borderWidth: 2
                },
                {
                    label: 'Homicidio doloso (+207.1%)',
                    data: [1, 3, 2, 1, 4, 2, 1, 4, 3, 3, 3, 7, 3, 2, 8, 9, 4, 15, 19],
                    borderColor: '#e83e8c',
                    backgroundColor: 'rgba(232, 62, 140, 0.1)',
                    tension: 0.1,
                    fill: false,
                    borderWidth: 2
                },
                {
                    label: 'Robo a negocio (+200.0%)',
                    data: [1, 0, 2, 2, 0, 2, 1, 0, 1, 0, 2, 3, 0, 0, 0, 3, 5, 8, 11],
                    borderColor: '#6f42c1',
                    backgroundColor: 'rgba(111, 66, 193, 0.1)',
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
    window.navolatoChart = chart;
    console.log('✅ Gráfica de Navolato creada y guardada globalmente');
}

function createNavolatoTable() {
    const container = document.getElementById('tabla-navolato-valores');
    if (!container) {
        console.error('Contenedor tabla-navolato-valores no encontrado');
        return;
    }

    const meses = ['Ene24', 'Feb24', 'Mar24', 'Abr24', 'May24', 'Jun24', 'Jul24', 'Ago24', 'Sep24', 'Oct24', 'Nov24', 'Dic24', 'Ene25', 'Feb25', 'Mar25', 'Abr25', 'May25', 'Jun25', 'Jul25'];
    
    const delitos = [
        {
            nombre: 'Robo de vehículo automotor',
            cambio: '+393.3%',
            color: '#dc3545',
            datos: [6, 4, 2, 5, 1, 1, 4, 0, 14, 15, 10, 10, 15, 13, 9, 6, 21, 19, 24]
        },
        {
            nombre: 'Otros delitos del Fuero Común',
            cambio: '+367.5%',
            color: '#fd7e14',
            datos: [2, 1, 0, 0, 0, 2, 2, 0, 3, 2, 4, 3, 2, 3, 3, 4, 5, 6, 10]
        },
        {
            nombre: 'Homicidio doloso',
            cambio: '+207.1%',
            color: '#e83e8c',
            datos: [1, 3, 2, 1, 4, 2, 1, 4, 3, 3, 3, 7, 3, 2, 8, 9, 4, 15, 19]
        },
        {
            nombre: 'Robo a negocio',
            cambio: '+200.0%',
            color: '#6f42c1',
            datos: [1, 0, 2, 2, 0, 2, 1, 0, 1, 0, 2, 3, 0, 0, 0, 3, 5, 8, 11]
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

function createNavolatoComparisonTable() {
    const container = document.getElementById('tabla-navolato-comparacion');
    if (!container) {
        console.error('Contenedor tabla-navolato-comparacion no encontrado');
        return;
    }

    // Datos de comparación pre/post guerra
    const comparacionData = [
        {
            delito: 'Robo de vehículo automotor',
            promedio_antes: '2.88',
            promedio_despues: '14.18',
            cambio: '+393.3%'
        },
        {
            delito: 'Otros delitos del Fuero Común',
            promedio_antes: '0.88',
            promedio_despues: '4.09',
            cambio: '+367.5%'
        },
        {
            delito: 'Homicidio doloso',
            promedio_antes: '2.25',
            promedio_despues: '6.91',
            cambio: '+207.1%'
        },
        {
            delito: 'Robo a negocio',
            promedio_antes: '1.00',
            promedio_despues: '3.00',
            cambio: '+200.0%'
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


