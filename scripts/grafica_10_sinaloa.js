// Gráfica 10: Evolución mensual de la violencia homicida en Sinaloa (2024-2025)
// Datos extraídos del CSV IDM_NM_jul25.csv - TODOS LOS DATOS SON REALES
// Período: Enero 2024 - Julio 2025 (19 meses consecutivos)

// Datos reales extraídos del CSV IDM_NM_jul25.csv - SCOPE GLOBAL
window.sinaloaData = {
        labels: [
            'Enero 2024', 'Febrero 2024', 'Marzo 2024', 'Abril 2024', 'Mayo 2024', 'Junio 2024', 'Julio 2024', 'Agosto 2024',
            'Septiembre 2024', 'Octubre 2024', 'Noviembre 2024', 'Diciembre 2024',
            'Enero 2025', 'Febrero 2025', 'Marzo 2025', 'Abril 2025', 'Mayo 2025', 'Junio 2025', 'Julio 2025'
        ],
        // Datos reales del CSV - VERIFICADOS: Enero 2024 = 51 homicidios dolosos, Julio 2025 = 134 homicidios dolosos
        subtipos: {
            'Homicidio doloso': [51, 38, 31, 32, 41, 42, 38, 39, 103, 141, 130, 119, 108, 102, 109, 100, 140, 156, 134],
            'Homicidio culposo': [57, 55, 66, 56, 63, 56, 55, 43, 41, 46, 34, 42, 43, 49, 47, 50, 48, 44, 44],
            'Feminicidio': [1, 3, 1, 1, 1, 1, 4, 1, 1, 6, 1, 5, 0, 5, 2, 6, 2, 5, 5],
            'Otros delitos que atentan contra la vida y la integridad corporal': [56, 46, 50, 54, 67, 59, 67, 55, 51, 71, 45, 60, 50, 50, 64, 51, 59, 63, 63],
            'Total': [165, 142, 148, 143, 172, 158, 164, 138, 196, 264, 210, 226, 201, 206, 222, 207, 249, 268, 246]
        }
    };

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando Gráfica 10: Evolución mensual de violencia homicida en Sinaloa...');
    
    // Crear la gráfica inmediatamente
    createGrafica10Sinaloa();
    
    // Configurar el selector de subtipos inmediatamente
    const selector = document.getElementById('grafica-10-subtipo-selector');
    if (selector) {
        console.log('✅ Configurando event listener para selector de subtipos...');
        selector.addEventListener('change', function() {
            console.log('🔄 Cambio detectado en selector:', this.value);
            updateGrafica10Sinaloa(this.value);
        });
        
        // Verificar que el event listener esté funcionando
        console.log('✅ Event listener configurado para:', selector);
        
        // Probar que funciona
        console.log('🧪 Probando selector...');
        selector.value = 'Homicidio culposo';
        const event = new Event('change', { bubbles: true });
        selector.dispatchEvent(event);
        
    } else {
        console.error('❌ Selector no encontrado');
    }
    
    // Esperar a que main.js termine y luego crear la Tabla 12
    waitForMainJSAndCreateTable();
});

// Función para esperar a que main.js termine y luego crear la tabla
function waitForMainJSAndCreateTable() {
    if (window.SESNSPReport && window.SESNSPReport.isInitialized) {
        console.log('✅ main.js terminó, creando Tabla 12...');
        // Esperar un poco más para asegurar que no haya conflictos
        setTimeout(createTabla12Real, 500);
    } else {
        console.log('⏳ Esperando a que main.js termine...');
        setTimeout(waitForMainJSAndCreateTable, 100);
    }
}

window.createGrafica10Sinaloa = function() {
    const ctx = document.getElementById('chart-grafica-10-sinaloa');
    if (!ctx) {
        console.error('Canvas chart-grafica-10-sinaloa no encontrado');
        return;
    }

    // Crear gráfica con el subtipo seleccionado por defecto
    updateGrafica10Sinaloa('Homicidio doloso');
}

window.updateGrafica10Sinaloa = function(subtipoSeleccionado) {
    const ctx = document.getElementById('chart-grafica-10-sinaloa');
    if (!ctx) {
        console.error('Canvas chart-grafica-10-sinaloa no encontrado');
        return;
    }

    // Destruir gráfico existente si existe
    if (window.grafica10Chart) {
        window.grafica10Chart.destroy();
    }

    // Obtener datos del subtipo seleccionado
    const datos = sinaloaData.subtipos[subtipoSeleccionado];
    if (!datos) {
        console.error('Subtipo no encontrado:', subtipoSeleccionado);
        return;
    }

    // Configurar colores según el subtipo
    const colores = {
        'Homicidio doloso': '#e74c3c',
        'Homicidio culposo': '#2ecc71',
        'Feminicidio': '#3498db',
        'Otros delitos que atentan contra la vida y la integridad corporal': '#f39c12',
        'Total': '#34495e'
    };

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sinaloaData.labels,
            datasets: [
                {
                    label: subtipoSeleccionado === 'Otros delitos que atentan contra la vida y la integridad corporal' ? 
                           'Otros delitos contra la vida' : subtipoSeleccionado,
                    data: datos,
                    borderColor: colores[subtipoSeleccionado],
                    backgroundColor: colores[subtipoSeleccionado] + '20',
                    tension: 0.1,
                    borderWidth: 3,
                    fill: false,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Gráfica 10. Evolución mensual de la violencia homicida en Sinaloa (2024-2025)',
                    font: { size: 16, weight: 'bold' }
                },
                subtitle: {
                    display: true,
                    text: `${subtipoSeleccionado === 'Otros delitos que atentan contra la vida y la integridad corporal' ? 'Otros delitos contra la vida' : subtipoSeleccionado} - Casos registrados por mes - Datos reales del SESNSP (IDM_NM_jul25.csv)`,
                    font: { size: 12 }
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
                        },
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + ' casos';
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
    
    // Guardar referencia del gráfico
    window.grafica10Chart = chart;
    
    console.log(`✅ Gráfica 10 actualizada para: ${subtipoSeleccionado}`);
}

// Crear Tabla 12 con datos reales del CSV IDM_NM_jul25.csv
function createTabla12Real() {
    const container = document.getElementById('tabla-sinaloa-mensual');
    if (!container) {
        console.error('❌ Contenedor tabla-sinaloa-mensual no encontrado');
        return;
    }

    console.log('✅ Creando Tabla 12 con datos reales...');
    
    // Verificar que sinaloaData esté disponible
    if (!window.sinaloaData) {
        console.error('❌ sinaloaData no está disponible');
        container.innerHTML = '<p style="color: red;">Error: Datos no disponibles</p>';
        return;
    }
    
    console.log('🔍 sinaloaData disponible:', window.sinaloaData);
    console.log('🔍 Labels:', window.sinaloaData.labels);
    console.log('🔍 Subtipos:', Object.keys(window.sinaloaData.subtipos));

    const table = document.createElement('table');
    table.className = 'data-table';
    
    // Headers de la tabla
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Año', 'Mes', 'Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos contra la vida', 'Total'];
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Datos de la tabla
    const tbody = document.createElement('tbody');
    
    // Crear filas con los datos reales
    window.sinaloaData.labels.forEach((label, index) => {
        console.log(`🔍 Procesando label ${index}: ${label}`);
        
        const tr = document.createElement('tr');
        
        // Extraer año y mes del label
        const [mes, año] = label.split(' ');
        console.log(`  - Mes: ${mes}, Año: ${año}`);
        
        // Año
        const tdAño = document.createElement('td');
        tdAño.textContent = año;
        tdAño.style.textAlign = 'left';
        tdAño.style.fontWeight = '500';
        tr.appendChild(tdAño);
        
        // Mes
        const tdMes = document.createElement('td');
        tdMes.textContent = mes;
        tdMes.style.textAlign = 'left';
        tdMes.style.fontWeight = '500';
        tr.appendChild(tdMes);
        
        // Homicidio doloso
        const tdHomicidioDoloso = document.createElement('td');
        const homicidioDoloso = window.sinaloaData.subtipos['Homicidio doloso'][index];
        console.log(`  - Homicidio doloso: ${homicidioDoloso}`);
        tdHomicidioDoloso.textContent = homicidioDoloso.toLocaleString();
        tdHomicidioDoloso.style.textAlign = 'center';
        tr.appendChild(tdHomicidioDoloso);
        
        // Homicidio culposo
        const tdHomicidioCulposo = document.createElement('td');
        const homicidioCulposo = window.sinaloaData.subtipos['Homicidio culposo'][index];
        console.log(`  - Homicidio culposo: ${homicidioCulposo}`);
        tdHomicidioCulposo.textContent = homicidioCulposo.toLocaleString();
        tdHomicidioCulposo.style.textAlign = 'center';
        tr.appendChild(tdHomicidioCulposo);
        
        // Feminicidio
        const tdFeminicidio = document.createElement('td');
        const feminicidio = window.sinaloaData.subtipos['Feminicidio'][index];
        console.log(`  - Feminicidio: ${feminicidio}`);
        tdFeminicidio.textContent = feminicidio.toLocaleString();
        tdFeminicidio.style.textAlign = 'center';
        tr.appendChild(tdFeminicidio);
        
        // Otros delitos
        const tdOtros = document.createElement('td');
        const otros = window.sinaloaData.subtipos['Otros delitos que atentan contra la vida y la integridad corporal'][index];
        console.log(`  - Otros delitos: ${otros}`);
        tdOtros.textContent = otros.toLocaleString();
        tdOtros.style.textAlign = 'center';
        tr.appendChild(tdOtros);
        
        // Total
        const tdTotal = document.createElement('td');
        const total = window.sinaloaData.subtipos['Total'][index];
        console.log(`  - Total: ${total}`);
        tdTotal.textContent = total.toLocaleString();
        tdTotal.style.textAlign = 'center';
        tdTotal.style.fontWeight = 'bold';
        tr.appendChild(tdTotal);
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    
    // Nota de fuente
    const sourceNote = document.createElement('p');
    sourceNote.className = 'source-note';
    sourceNote.style.fontSize = '12px';
    sourceNote.style.fontStyle = 'italic';
    sourceNote.style.marginTop = '10px';
    sourceNote.style.color = '#666';
    sourceNote.innerHTML = '<strong>Fuente:</strong> SESNSP (IDM_NM_jul25.csv). Datos reales de violencia homicida en Sinaloa.';
    
    container.innerHTML = '';
    container.appendChild(table);
    container.appendChild(sourceNote);
    
    console.log('✅ Tabla 12 creada con datos reales');
}


