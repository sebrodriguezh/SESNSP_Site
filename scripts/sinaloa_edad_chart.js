// Script para crear gráfica de barras apiladas de composición por edad en Sinaloa
// Se insertará después de la Tabla 12 en la sección IDVFC

// Datos de composición por edad (se cargarán desde el JSON)
let sinaloaEdadComposicionData = {};

// Función para cargar los datos
async function loadSinaloaEdadData() {
    try {
        const response = await fetch('data/sinaloa_edad_composicion.json');
        sinaloaEdadComposicionData = await response.json();
        console.log('✅ Datos de composición por edad cargados');
    } catch (error) {
        console.error('❌ Error cargando datos de composición por edad:', error);
    }
}

// Función para crear la gráfica de composición por edad
function createSinaloaEdadComposicionChart() {
    const canvas = document.getElementById('chart-sinaloa-edad-composicion');
    if (!canvas) {
        console.error('Canvas chart-sinaloa-edad-composicion no encontrado');
        return;
    }

    // Destruir gráfica existente si existe
    if (window.sinaloaEdadChart) {
        window.sinaloaEdadChart.destroy();
    }

    // Obtener el subtipo seleccionado
    const selector = document.getElementById('edad-subtipo-selector');
    const subtipoSeleccionado = selector ? selector.value : 'Homicidio doloso';

    // Obtener datos del subtipo seleccionado
    const datosSubtipo = sinaloaEdadComposicionData[subtipoSeleccionado];
    if (!datosSubtipo) {
        console.error('Datos no encontrados para:', subtipoSeleccionado);
        return;
    }

    // Preparar datos para Chart.js
    const meses = Object.keys(datosSubtipo);
    const rangosEdad = ['Menores de edad (0-17)', 'Adultos (18 y más)', 'No especificado', 'No identificado'];
    
    // Colores para cada rango de edad
    const colores = {
        'Menores de edad (0-17)': '#e74c3c',      // Rojo
        'Adultos (18 y más)': '#2ecc71',          // Verde
        'No especificado': '#f39c12',             // Naranja
        'No identificado': '#95a5a6'              // Gris
    };

    // Crear datasets para cada rango de edad
    const datasets = rangosEdad.map(rango => {
        const datos = meses.map(mes => datosSubtipo[mes][rango] || 0);
        
        return {
            label: rango,
            data: datos,
            backgroundColor: colores[rango],
            borderColor: colores[rango],
            borderWidth: 1
        };
    });

    // Configurar la gráfica
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Gráfica 13. Composición por edad de víctimas de ${subtipoSeleccionado} en Sinaloa (2024-2025)`,
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            const dataset = context.dataset;
                            const value = context.parsed.y;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const porcentaje = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            
                            return `${dataset.label}: ${value.toLocaleString()} casos (${porcentaje}%)`;
                        },
                        footer: function(tooltipItems) {
                            const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
                            return `Total: ${total.toLocaleString()} casos`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Mes'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Número de casos'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });

    // Guardar referencia global
    window.sinaloaEdadChart = chart;
}

// Función para actualizar la gráfica cuando cambie el subtipo
function updateSinaloaEdadChart() {
    const selector = document.getElementById('edad-subtipo-selector');
    if (selector) {
        selector.addEventListener('change', function() {
            createSinaloaEdadComposicionChart();
        });
    }
}

// Función para crear la tabla de composición por edad
function createSinaloaEdadComposicionTable() {
    const container = document.getElementById('tabla-sinaloa-edad-composicion');
    if (!container) {
        console.error('Contenedor tabla-sinaloa-edad-composicion no encontrado');
        return;
    }

    // Obtener el subtipo seleccionado
    const selector = document.getElementById('edad-subtipo-selector');
    const subtipoSeleccionado = selector ? selector.value : 'Homicidio doloso';

    // Obtener datos del subtipo seleccionado
    const datosSubtipo = sinaloaEdadComposicionData[subtipoSeleccionado];
    if (!datosSubtipo) {
        console.error('Datos no encontrados para:', subtipoSeleccionado);
        return;
    }

    const meses = Object.keys(datosSubtipo);
    const rangosEdad = ['Menores de edad (0-17)', 'Adultos (18 y más)', 'No especificado', 'No identificado'];

    // Crear tabla
    const table = document.createElement('table');
    table.className = 'data-table';
    
    // Headers
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Mes', ...rangosEdad, 'Total'];
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.textAlign = 'center';
        th.style.padding = '12px';
        th.style.border = '1px solid #ddd';
        th.style.backgroundColor = '#007bff';
        th.style.color = 'white';
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    
    meses.forEach(mes => {
        const tr = document.createElement('tr');
        
        // Mes
        const tdMes = document.createElement('td');
        tdMes.textContent = mes;
        tdMes.style.textAlign = 'center';
        tdMes.style.padding = '12px';
        tdMes.style.border = '1px solid #ddd';
        tr.appendChild(tdMes);
        
        let totalMes = 0;
        
        // Datos por rango de edad
        rangosEdad.forEach(rango => {
            const casos = datosSubtipo[mes][rango] || 0;
            totalMes += casos;
            
            const td = document.createElement('td');
            td.textContent = casos.toLocaleString();
            td.style.textAlign = 'center';
            td.style.padding = '12px';
            td.style.border = '1px solid #ddd';
            tr.appendChild(td);
        });
        
        // Total
        const tdTotal = document.createElement('td');
        tdTotal.textContent = totalMes.toLocaleString();
        tdTotal.style.textAlign = 'center';
        tdTotal.style.padding = '12px';
        tdTotal.style.border = '1px solid #ddd';
        tdTotal.style.fontWeight = 'bold';
        tdTotal.style.backgroundColor = '#007bff';
        tdTotal.style.color = 'white';
        tr.appendChild(tdTotal);
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    
    // Limpiar contenedor y agregar tabla
    container.innerHTML = '';
    container.appendChild(table);
    
    // Nota de fuente
    const sourceNote = document.createElement('p');
    sourceNote.className = 'source-note';
    sourceNote.style.fontSize = '12px';
    sourceNote.style.fontStyle = 'italic';
    sourceNote.style.marginTop = '20px';
    sourceNote.textContent = 'Fuente: IDVFC_NM_jul25.csv - Datos de enero 2024 a julio 2025';
    container.appendChild(sourceNote);
}

// Función para configurar el selector de subtipos
function setupSinaloaEdadSelector() {
    const selector = document.getElementById('edad-subtipo-selector');
    if (selector) {
        selector.addEventListener('change', function() {
            createSinaloaEdadComposicionChart();
            createSinaloaEdadComposicionTable();
        });
    }
}

// Función de inicialización
async function initSinaloaEdadComposicion() {
    await loadSinaloaEdadData();
    createSinaloaEdadComposicionChart();
    createSinaloaEdadComposicionTable();
    setupSinaloaEdadSelector();
}
