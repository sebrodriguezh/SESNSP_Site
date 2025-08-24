// Análisis de Elota - Datos extraídos del CSV IDM_NM_jul25.csv
// Período: Enero 2024 - Julio 2025 (19 meses)

// Datos de Elota con cambios significativos (>20%)
const elotaData = {
    labels: [
        'Enero 2024', 'Febrero 2024', 'Marzo 2024', 'Abril 2024', 'Mayo 2024', 'Junio 2024', 'Julio 2024', 'Agosto 2024',
        'Septiembre 2024', 'Octubre 2024', 'Noviembre 2024', 'Diciembre 2024',
        'Enero 2025', 'Febrero 2025', 'Marzo 2025', 'Abril 2025', 'Mayo 2025', 'Junio 2025', 'Julio 2025'
    ],
    datasets: [
        {
            label: 'Homicidio doloso (+1027.27%)',
            data: [0, 0, 0, 0, 2, 0, 1, 1, 10, 2, 4, 9, 2, 2, 7, 5, 14, 2, 5],
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            tension: 0.1
        },
        {
            label: 'Robo de vehículo automotor (+748.48%)',
            data: [1, 0, 4, 4, 1, 5, 1, 2, 11, 34, 19, 9, 18, 15, 13, 24, 27, 16, 24],
            borderColor: '#fd7e14',
            backgroundColor: 'rgba(253, 126, 20, 0.1)',
            tension: 0.1
        },
        {
            label: 'Otros delitos contra libertad personal (+279.80%)',
            data: [2, 0, 1, 2, 1, 1, 2, 0, 6, 5, 2, 2, 4, 4, 4, 8, 5, 5, 2],
            borderColor: '#e83e8c',
            backgroundColor: 'rgba(232, 62, 140, 0.1)',
            tension: 0.1
        },
        {
            label: 'Violación simple (+263.64%)',
            data: [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 0, 1, 1, 0, 0, 0, 0],
            borderColor: '#6f42c1',
            backgroundColor: 'rgba(111, 66, 193, 0.1)',
            tension: 0.1
        },
        {
            label: 'Otros robos (+76.62%)',
            data: [0, 1, 1, 0, 3, 4, 2, 3, 3, 4, 5, 1, 1, 1, 3, 2, 7, 6, 1],
            borderColor: '#20c997',
            backgroundColor: 'rgba(32, 201, 151, 0.1)',
            tension: 0.1
        },
        {
            label: 'Otros delitos contra vida (+50.65%)',
            data: [2, 1, 1, 2, 5, 2, 1, 0, 1, 3, 1, 2, 1, 2, 2, 2, 5, 3, 7],
            borderColor: '#17a2b8',
            backgroundColor: 'rgba(23, 162, 184, 0.1)',
            tension: 0.1
        },
        {
            label: 'Daño a la propiedad (+45.45%)',
            data: [0, 4, 1, 3, 4, 4, 2, 0, 6, 3, 3, 6, 5, 4, 0, 0, 5, 2, 2],
            borderColor: '#6c757d',
            backgroundColor: 'rgba(108, 117, 125, 0.1)',
            tension: 0.1
        },
        {
            label: 'Amenazas (-39.39%)',
            data: [0, 1, 1, 3, 0, 1, 0, 0, 0, 2, 1, 0, 1, 0, 1, 0, 0, 0, 0],
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            tension: 0.1
        },
        {
            label: 'Lesiones dolosas (-27.27%)',
            data: [0, 1, 2, 3, 4, 1, 2, 1, 1, 2, 1, 2, 0, 1, 2, 2, 0, 3, 0],
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            tension: 0.1
        },
        {
            label: 'Homicidio culposo (-27.27%)',
            data: [3, 1, 1, 0, 3, 2, 3, 0, 1, 2, 1, 1, 2, 1, 0, 2, 2, 1, 0],
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            tension: 0.1
        }
    ]
};

// Función para crear la gráfica de evolución temporal
function createElotaEvolutionChart() {
    const ctx = document.getElementById('chart-elota-evolution');
    if (!ctx) return;

    // Destruir gráfica existente si existe
    if (window.elotaChart) {
        console.log('🗑️ Destruyendo gráfica existente de Elota');
        window.elotaChart.destroy();
    }

    const chart = new Chart(ctx, {
        type: 'line',
        data: elotaData,
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
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Mes'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Número de delitos'
                    },
                    beginAtZero: true
                }
            },
            annotation: {
                annotations: {
                    warLine: {
                        type: 'line',
                        xMin: 8,
                        xMax: 8,
                        borderColor: 'red',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        label: {
                            content: 'Inicio Guerra',
                            position: 'start'
                        }
                    }
                }
            }
        }
    });

    // Guardar referencia global para evitar conflictos
    window.elotaChart = chart;
    console.log('✅ Gráfica de Elota creada y guardada globalmente');
}

// Función para crear la tabla de valores mensuales
function createElotaValuesTable() {
    const container = document.getElementById('tabla-elota-valores');
    if (!container) return;

    let html = '<table class="data-table" style="width: 100%; border-collapse: collapse; margin: 20px 0;">';
    html += '<thead><tr style="background-color: #f8f9fa;">';
    html += '<th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Tipo de Delito</th>';

    // Encabezados de meses
    elotaData.labels.forEach(label => {
        html += `<th style="padding: 12px; border: 1px solid #ddd; text-align: center;">${label}</th>`;
    });

    html += '</tr></thead><tbody>';

    // Filas de datos
    elotaData.datasets.forEach(dataset => {
        html += '<tr>';
        html += `<td style="padding: 10px; border: 1px solid #ddd;"><strong>${dataset.label}</strong></td>`;

        dataset.data.forEach(value => {
            html += `<td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${value}</td>`;
        });

        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// Función para crear la tabla comparativa
function createElotaComparisonTable() {
    const container = document.getElementById('tabla-elota-comparacion');
    if (!container) return;

    const comparisonData = [
        {
            delito: 'Homicidio doloso',
            antes: 0.50,
            despues: 5.64,
            cambio: '+1027.27%',
            color: '#dc3545'
        },
        {
            delito: 'Robo de vehículo automotor',
            antes: 2.25,
            despues: 19.09,
            cambio: '+748.48%',
            color: '#dc3545'
        },
        {
            delito: 'Otros delitos contra libertad personal',
            antes: 1.12,
            despues: 4.27,
            cambio: '+279.80%',
            color: '#dc3545'
        },
        {
            delito: 'Violación simple',
            antes: 0.12,
            despues: 0.45,
            cambio: '+263.64%',
            color: '#dc3545'
        },
        {
            delito: 'Otros robos',
            antes: 1.75,
            despues: 3.09,
            cambio: '+76.62%',
            color: '#dc3545'
        },
        {
            delito: 'Otros delitos contra vida',
            antes: 1.75,
            despues: 2.64,
            cambio: '+50.65%',
            color: '#dc3545'
        },
        {
            delito: 'Daño a la propiedad',
            antes: 2.25,
            despues: 3.27,
            cambio: '+45.45%',
            color: '#dc3545'
        },
        {
            delito: 'Amenazas',
            antes: 0.75,
            despues: 0.45,
            cambio: '-39.39%',
            color: '#28a745'
        },
        {
            delito: 'Lesiones dolosas',
            antes: 1.75,
            despues: 1.27,
            cambio: '-27.27%',
            color: '#28a745'
        },
        {
            delito: 'Homicidio culposo',
            antes: 1.62,
            despues: 1.18,
            cambio: '-27.27%',
            color: '#28a745'
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    createElotaEvolutionChart();
    createElotaValuesTable();
    createElotaComparisonTable();
});
