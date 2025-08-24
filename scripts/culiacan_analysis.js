// Análisis científico de Culiacán - Datos extraídos del CSV IDM_NM_jul25.csv
// Período: Enero 2024 - Julio 2025 (19 meses consecutivos)
// SESNSP - Datos municipales reales

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 INICIALIZANDO ANÁLISIS CIENTÍFICO DE CULIACÁN...');
    
    // Datos reales extraídos del análisis del CSV IDM_NM_jul25.csv
    const culiacanData = {
        labels: [
            'Enero 2024', 'Febrero 2024', 'Marzo 2024', 'Abril 2024', 'Mayo 2024', 'Junio 2024', 'Julio 2024', 'Agosto 2024',
            'Septiembre 2024', 'Octubre 2024', 'Noviembre 2024', 'Diciembre 2024',
            'Enero 2025', 'Febrero 2025', 'Marzo 2025', 'Abril 2025', 'Mayo 2025', 'Junio 2025', 'Julio 2025'
        ],
        datasets: [
            {
                label: 'Otros delitos contra la sociedad (+845.5%)',
                data: [0, 0, 0, 2, 4, 3, 3, 1, 1, 8, 17, 14, 14, 14, 16, 7, 38, 17, 23],
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.1,
                borderWidth: 2
            },
            {
                label: 'Robo de vehículo automotor (+248.7%)',
                data: [118, 123, 105, 106, 78, 78, 96, 91, 245, 422, 381, 279, 364, 341, 344, 374, 378, 370, 314],
                borderColor: '#fd7e14',
                backgroundColor: 'rgba(253, 126, 20, 0.1)',
                tension: 0.1,
                borderWidth: 2
            },
            {
                label: 'Homicidio doloso (+236.8%)',
                data: [36, 25, 19, 20, 23, 23, 23, 21, 65, 107, 99, 69, 71, 73, 68, 62, 77, 100, 89],
                borderColor: '#e83e8c',
                backgroundColor: 'rgba(232, 62, 140, 0.1)',
                tension: 0.1,
                borderWidth: 2
            },
            {
                label: 'Feminicidio (+227.3%)',
                data: [0, 2, 0, 0, 1, 0, 1, 0, 1, 4, 0, 2, 0, 2, 1, 3, 1, 2, 2],
                borderColor: '#6f42c1',
                backgroundColor: 'rgba(111, 66, 193, 0.1)',
                tension: 0.1,
                borderWidth: 2
            },
            {
                label: 'Otros delitos del Fuero Común (+147.0%)',
                data: [17, 23, 17, 14, 14, 22, 6, 13, 37, 34, 21, 28, 34, 38, 43, 40, 49, 55, 49],
                borderColor: '#20c997',
                backgroundColor: 'rgba(32, 201, 151, 0.1)',
                tension: 0.1,
                borderWidth: 2
            }
        ]
    };

    // Verificar datos después de que estén definidos
    console.log('📊 Datos hardcodeados disponibles:', culiacanData);
    console.log('🔍 Verificando datos de Homicidio doloso...');
    
    // Verificar datos específicos
    const homicidioDataset = culiacanData.datasets.find(ds => ds.label.includes('Homicidio doloso'));
    if (homicidioDataset) {
        console.log('✅ Dataset de Homicidio doloso encontrado');
        console.log('📈 Datos completos:', homicidioDataset.data);
        console.log('📅 Septiembre 2024 (índice 8):', homicidioDataset.data[8]);
        console.log('📅 Octubre 2024 (índice 9):', homicidioDataset.data[9]);
        console.log('📅 Noviembre 2024 (índice 10):', homicidioDataset.data[10]);
        console.log('📅 Diciembre 2024 (índice 11):', homicidioDataset.data[11]);
    } else {
        console.log('❌ Dataset de Homicidio doloso NO encontrado');
    }

    // Crear gráfica
    createCuliacanChart();
    
    // Crear tabla de valores mensuales
    createCuliacanTable();
    
    // Crear tabla comparativa de promedios
    createCuliacanComparisonTable();
});

function createCuliacanChart() {
    const ctx = document.getElementById('chart-culiacan-evolution');
    if (!ctx) {
        console.error('Canvas chart-culiacan-evolution no encontrado');
        return;
    }

    // Destruir gráfica existente si existe
    if (window.culiacanChart) {
        console.log('🗑️ Destruyendo gráfica existente de Culiacán');
        window.culiacanChart.destroy();
    }

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [
                'Enero 2024', 'Febrero 2024', 'Marzo 2024', 'Abril 2024', 'Mayo 2024', 'Junio 2024', 'Julio 2024', 'Agosto 2024',
                'Septiembre 2024', 'Octubre 2024', 'Noviembre 2024', 'Diciembre 2024',
                'Enero 2025', 'Febrero 2025', 'Marzo 2025', 'Abril 2025', 'Mayo 2025', 'Junio 2025', 'Julio 2025'
            ],
            datasets: [
                {
                    label: 'Otros delitos contra la sociedad (+845.5%)',
                    data: [0, 0, 0, 2, 4, 3, 3, 1, 1, 8, 17, 14, 14, 14, 16, 7, 38, 17, 23],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.1,
                    borderWidth: 2
                },
                {
                    label: 'Robo de vehículo automotor (+248.7%)',
                    data: [118, 123, 105, 106, 78, 78, 96, 91, 245, 422, 381, 279, 364, 341, 344, 374, 378, 370, 314],
                    borderColor: '#fd7e14',
                    backgroundColor: 'rgba(253, 126, 20, 0.1)',
                    tension: 0.1,
                    borderWidth: 2
                },
                {
                    label: 'Homicidio doloso (+236.8%)',
                    data: [36, 25, 19, 20, 23, 23, 23, 21, 65, 107, 99, 69, 71, 73, 68, 62, 77, 100, 89],
                    borderColor: '#e83e8c',
                    backgroundColor: 'rgba(232, 62, 140, 0.1)',
                    tension: 0.1,
                    borderWidth: 2
                },
                {
                    label: 'Feminicidio (+227.3%)',
                    data: [0, 2, 0, 0, 1, 0, 1, 0, 1, 4, 0, 2, 0, 2, 1, 3, 1, 2, 2],
                    borderColor: '#6f42c1',
                    backgroundColor: 'rgba(111, 66, 193, 0.1)',
                    tension: 0.1,
                    borderWidth: 2
                },
                {
                    label: 'Otros delitos del Fuero Común (+147.0%)',
                    data: [17, 23, 17, 14, 14, 22, 6, 13, 37, 34, 21, 28, 34, 38, 43, 40, 49, 55, 49],
                    borderColor: '#20c997',
                    backgroundColor: 'rgba(32, 201, 151, 0.1)',
                    tension: 0.1,
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
                    display: true,
                    position: 'bottom'
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
            const xPos = x.getPixelForValue('Septiembre 2024');
            
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
    window.culiacanChart = chart;
    console.log('✅ Gráfica de Culiacán creada y guardada globalmente');
}

function createCuliacanTable() {
    const container = document.getElementById('tabla-culiacan-valores');
    if (!container) {
        console.error('Contenedor tabla-culiacan-valores no encontrado');
        return;
    }

    const meses = [
        'Enero 2024', 'Febrero 2024', 'Marzo 2024', 'Abril 2024', 'Mayo 2024', 'Junio 2024', 'Julio 2024', 'Agosto 2024',
        'Septiembre 2024', 'Octubre 2024', 'Noviembre 2024', 'Diciembre 2024',
        'Enero 2025', 'Febrero 2025', 'Marzo 2025', 'Abril 2025', 'Mayo 2025', 'Junio 2025', 'Julio 2025'
    ];
    
    const delitos = [
        {
            nombre: 'Otros delitos contra la sociedad',
            cambio: '+845.5%',
            color: '#dc3545',
            datos: [0, 0, 0, 2, 4, 3, 3, 1, 1, 8, 17, 14, 14, 14, 16, 7, 38, 17, 23]
        },
        {
            nombre: 'Robo de vehículo automotor',
            cambio: '+248.7%',
            color: '#fd7e14',
            datos: [118, 123, 105, 106, 78, 78, 96, 91, 245, 422, 381, 279, 364, 341, 344, 374, 378, 370, 314]
        },
        {
            nombre: 'Homicidio doloso',
            cambio: '+236.8%',
            color: '#e83e8c',
            datos: [36, 25, 19, 20, 23, 23, 23, 21, 65, 107, 99, 69, 71, 73, 68, 62, 77, 100, 89]
        },
        {
            nombre: 'Feminicidio',
            cambio: '+227.3%',
            color: '#6f42c1',
            datos: [0, 2, 0, 0, 1, 0, 1, 0, 1, 4, 0, 2, 0, 2, 1, 3, 1, 2, 2]
        },
        {
            nombre: 'Otros delitos del Fuero Común',
            cambio: '+147.0%',
            color: '#20c997',
            datos: [17, 23, 17, 14, 14, 22, 6, 13, 37, 34, 21, 28, 34, 38, 43, 40, 49, 55, 49]
        }
    ];

    let tableHTML = `
        <table class="data-table" style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
            <thead>
                <tr style="background-color: #f8f9fa;">
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left; min-width: 200px;">Subtipo de Delito</th>
    `;
    
    // Encabezados de meses (19 meses completos)
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

function createCuliacanComparisonTable() {
    const container = document.getElementById('tabla-culiacan-comparacion');
    if (!container) {
        console.error('Contenedor tabla-culiacan-comparacion no encontrado');
        return;
    }

    const comparisonData = [
        {
            delito: 'Otros delitos contra la sociedad',
            antes: 1.62,
            despues: 15.36,
            cambio: '+845.5%',
            color: '#dc3545'
        },
        {
            delito: 'Robo de vehículo automotor',
            antes: 99.38,
            despues: 346.55,
            cambio: '+248.7%',
            color: '#dc3545'
        },
        {
            delito: 'Homicidio doloso',
            antes: 23.75,
            despues: 80.00,
            cambio: '+236.8%',
            color: '#dc3545'
        },
        {
            delito: 'Feminicidio',
            antes: 0.50,
            despues: 1.64,
            cambio: '+227.3%',
            color: '#dc3545'
        },
        {
            delito: 'Otros delitos del Fuero Común',
            antes: 15.75,
            despues: 38.91,
            cambio: '+147.0%',
            color: '#dc3545'
        }
    ];

    let html = '<table class="data-table" style="width: 100%; border-collapse: collapse; margin: 20px 0;">';
    html += '<thead><tr style="background-color: #f8f9fa;">';
    html += '<th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Tipo de Delito</th>';
    html += '<th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Promedio Ene-Ago 2024</th>';
    html += '<th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Promedio Sep 2024-Jul 2025</th>';
    html += '<th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Cambio %</th>';
    html += '</tr></thead><tbody>';
    
    comparisonData.forEach(row => {
        html += '<tr>';
        html += `<td style="padding: 10px; border: 1px solid #ddd;"><strong>${row.delito}</strong></td>`;
        html += `<td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${row.antes}</td>`;
        html += `<td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${row.despues}</td>`;
        html += `<td style="padding: 10px; border: 1px solid #ddd; text-align: center; color: ${row.color};"><strong>${row.cambio}</strong></td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}
