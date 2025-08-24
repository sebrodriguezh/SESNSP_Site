// Script principal para el reporte SESNSP
class SESNSPReport {
    constructor() {
        this.violenciaHomicidaData = null;
        this.violenciaHomicidaMensualData = null;
        this.sinaloaAnualData = null;
        this.sinaloaMensualData = null;
        this.poblacionData = null;
    }

    async init() {
        try {
            console.log('Iniciando carga de datos...');
            await this.loadData();
            await this.generateReport();
            console.log('Reporte generado exitosamente');
            
            // Marcar como inicializado para que otros scripts puedan ejecutarse
            window.SESNSPReport = this;
            window.SESNSPReport.isInitialized = true;
            console.log('✅ SESNSPReport marcado como inicializado');
        } catch (error) {
            console.error('Error:', error);
            document.body.innerHTML += `<div style="color: red; padding: 20px;">Error: ${error.message}</div>`;
        }
    }

    async loadData() {
        const response1 = await fetch('data/violencia_homicida_2019_2025.csv');
        const text1 = await response1.text();
        this.violenciaHomicidaData = this.parseCSV(text1);
        
        // ARCHIVOS MOVIDOS A OLD_BACKUPS - DATOS FALSOS
        const response2 = await fetch('data/violencia_homicida_mensual_nacional_2024_2025.csv');
        const text2 = await response2.text();
        this.violenciaHomicidaMensualData = this.parseCSV(text2);
        console.log('📊 Datos mensuales nacionales:', this.violenciaHomicidaMensualData.length, 'períodos');
        
        const response3 = await fetch('data/violencia_homicida_sinaloa_2019_2025.csv');
        const text3 = await response3.text();
        this.sinaloaAnualData = this.parseCSV(text3);
        
        // ARCHIVO MOVIDO A OLD_BACKUPS - DATOS FALSOS
        const response4 = await fetch('data/violencia_homicida_estatal_mensual_2024_2025_corregido.csv');
        const text4 = await response4.text();
        this.sinaloaMensualData = this.parseCSV(text4);
        console.log('📊 Datos mensuales Sinaloa:', this.sinaloaMensualData.length, 'períodos');
        
        const response5 = await fetch('data/poblacion_estados_2018_2025.csv');
        const text5 = await response5.text();
        this.poblacionData = this.parseCSV(text5);
        
        const response6 = await fetch('data/violencia_homicida_estatal_2025.csv');
        const text6 = await response6.text();
        this.estatalData2025 = this.parseCSV(text6);
        
        const response7 = await fetch('data/violencia_homicida_estatal_mensual_2024_2025_corregido.csv');
        const text7 = await response7.text();
        this.estatalMensualData = this.parseCSV(text7);
        console.log('📊 Datos mensuales estatales:', this.estatalMensualData.length, 'registros');
        
        const response8 = await fetch('data/violencia_homicida_municipal_nacional_2024_2025.csv');
        const text8 = await response8.text();
        this.municipalNacionalData = this.parseCSV(text8);
        
        const response10 = await fetch('data/violencia_homicida_estados_diciembre_2023.csv');
        const text10 = await response10.text();
        this.estatalDiciembre2023Data = this.parseCSV(text10);
        
        const response9 = await fetch('data/violencia_homicida_sinaloa_municipal_2024_2025.csv');
        const text9 = await response9.text();
        this.sinaloaMunicipalData = this.parseCSV(text9);
        
        console.log('✅ Todos los datos cargados exitosamente');
    }

    parseCSV(text) {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        console.log('📄 CSV parseado:', lines.length, 'líneas,', headers.length, 'columnas');
        
        const result = lines.slice(1).map(line => {
            const values = line.split(',');
            const row = {};
            headers.forEach((header, headerIndex) => {
                row[header] = values[headerIndex] ? values[headerIndex].trim() : '';
            });
            return row;
        });
        
        console.log('📊 Datos procesados:', result.length, 'filas');
        if (result.length > 0) {
            console.log('   Primera fila:', result[0]);
            console.log('   Última fila:', result[result.length - 1]);
        }
        
        return result;
    }

    async generateReport() {
        this.updateSummaryCards();
        this.generateCharts();
        this.generateTables();
        // El mapa municipal se inicializa por separado en municipal_map.js
    }

    updateSummaryCards() {
        const totalRow = this.violenciaHomicidaData[this.violenciaHomicidaData.length - 1];
        // Calcular total excluyendo 2018
        const años2019_2025 = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
        const totalViolencia = años2019_2025.reduce((sum, año) => sum + (parseInt(totalRow[año]) || 0), 0);
        
        const homicidiosRow = this.violenciaHomicidaData.find(row => row.Delito === 'Homicidio doloso');
        const totalHomicidios = años2019_2025.reduce((sum, año) => sum + (parseInt(homicidiosRow?.[año]) || 0), 0);
        
        const feminicidiosRow = this.violenciaHomicidaData.find(row => row.Delito === 'Feminicidio');
        const totalFeminicidios = años2019_2025.reduce((sum, año) => sum + (parseInt(feminicidiosRow?.[año]) || 0), 0);
        
        const val2024 = parseInt(totalRow['2024']) || 0;
        const val2025 = parseInt(totalRow['2025']) || 0;
        const variacion = val2024 > 0 ? ((val2025 - val2024) / val2024 * 100).toFixed(1) : 0;
        
        const totalElement = document.getElementById('total-delitos');
        if (totalElement) totalElement.textContent = totalViolencia.toLocaleString();
        
        const homicidiosElement = document.getElementById('homicidios-dolosos');
        if (homicidiosElement) homicidiosElement.textContent = totalHomicidios.toLocaleString();
        
        const feminicidiosElement = document.getElementById('feminicidios');
        if (feminicidiosElement) feminicidiosElement.textContent = totalFeminicidios.toLocaleString();
        
        const variacionElement = document.getElementById('variacion-mensual');
        if (variacionElement) {
            variacionElement.textContent = `${variacion}%`;
            variacionElement.style.color = variacion >= 0 ? '#e74c3c' : '#27ae60';
        }
    }

    generateCharts() {
        this.generateNacionalAnualChart();
        this.generateNacionalAnualRatesChart();
        this.generateNacionalMensualChart();
        this.generateCambiosNacionalChart();
        this.generateCambiosMensualNacionalChart();
        this.generateEstatalStackedChart();
        this.generateEstatalEvolutionChart();
        this.generateMonthlyChangesChart();
        this.generateSinaloaAnualChart();
        this.generateSinaloaMensualChart();
        this.generateCambiosSinaloaChart();
    }

    getChartOptions(xAxisTitle, yAxisTitle = 'Número de casos') {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: { 
                legend: { 
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: '#3498db',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const value = new Intl.NumberFormat('es-MX').format(context.parsed.y);
                            return `${context.dataset.label}: ${value}`;
                        }
                    }
                }
            },
            scales: { 
                y: { 
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: yAxisTitle
                    },
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('es-MX').format(value);
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: xAxisTitle
                    }
                }
            }
        };
    }

    generateNacionalAnualChart() {
        const años = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
        const delitos = ['Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos que atentan contra la vida y la integridad corporal'];
        
        const totalRow = this.violenciaHomicidaData[this.violenciaHomicidaData.length - 1];
        const totales = años.map(año => parseInt(totalRow[año.toString()]) || 0);
        
        const datasets = [];
        
        delitos.forEach((delito, index) => {
            const delitoRow = this.violenciaHomicidaData.find(row => row.Delito === delito);
            if (delitoRow) {
                const colors = ['#2ecc71', '#e74c3c', '#3498db', '#f39c12'];
                datasets.push({
                    label: delito === 'Otros delitos que atentan contra la vida y la integridad corporal' ? 'Otros delitos contra la vida' : delito,
                    data: años.map(año => parseInt(delitoRow[año.toString()]) || 0),
                    type: 'line',
                    borderColor: colors[index],
                    backgroundColor: colors[index],
                    borderWidth: 3,
                    fill: false,
                    tension: 0,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    order: index + 1
                });
            }
        });
        
        datasets.push({
            label: 'Violencia homicida',
            data: totales,
            type: 'bar',
            backgroundColor: '#34495e',
            borderColor: '#34495e',
            borderWidth: 1,
            order: 5
        });

        const ctx = document.getElementById('chart-violencia-homicida');
        if (ctx) {
            // Destruir gráfico existente si existe
            if (window.nacionalAnualChart) {
                window.nacionalAnualChart.destroy();
            }
            
            window.nacionalAnualChart = new Chart(ctx, {
                type: 'bar',
                data: { labels: años, datasets: datasets },
                options: this.getChartOptions('Año')
            });
        }
    }

    generateNacionalAnualRatesChart() {
        const años = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
        const delitos = ['Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos que atentan contra la vida y la integridad corporal'];
        
        // Convertir datos a tasas por 100,000 habitantes (clave 0 = nacional)
        const ratesData = this.convertToRates(this.violenciaHomicidaData, 0);
        const totalRow = ratesData[ratesData.length - 1];
        const totales = años.map(año => totalRow[año.toString()] || 0);
        
        const datasets = [];
        
        delitos.forEach((delito, index) => {
            const delitoRow = ratesData.find(row => row.Delito === delito);
            if (delitoRow) {
                const colors = ['#2ecc71', '#e74c3c', '#3498db', '#f39c12'];
                datasets.push({
                    label: delito === 'Otros delitos que atentan contra la vida y la integridad corporal' ? 'Otros delitos contra la vida' : delito,
                    data: años.map(año => delitoRow[año.toString()] || 0),
                    type: 'line',
                    borderColor: colors[index],
                    backgroundColor: colors[index],
                    borderWidth: 3,
                    fill: false,
                    tension: 0,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    order: index + 1
                });
            }
        });
        
        datasets.push({
            label: 'Violencia homicida',
            data: totales,
            type: 'bar',
            backgroundColor: '#34495e',
            borderColor: '#34495e',
            borderWidth: 1,
            order: 5
        });

        const ctx = document.getElementById('chart-violencia-homicida-rates');
        if (ctx) {
            // Destruir gráfico existente si existe
            if (window.nacionalAnualRatesChart) {
                window.nacionalAnualRatesChart.destroy();
            }
            
            const options = this.getChartOptions('Año', 'Tasa por 100,000 habitantes');
            // Personalizar tooltips para mostrar tasas
            options.plugins.tooltip.callbacks.label = function(context) {
                const value = context.parsed.y.toFixed(2);
                return `${context.dataset.label}: ${value} por 100,000 hab`;
            };
            
            window.nacionalAnualRatesChart = new Chart(ctx, {
                type: 'bar',
                data: { labels: años, datasets: datasets },
                options: options
            });
        }
    }



    generateNacionalMensualChart() {
        if (!this.violenciaHomicidaMensualData || this.violenciaHomicidaMensualData.length === 0) {
            console.log('❌ No hay datos mensuales disponibles');
            return;
        }

        console.log('📊 Creando gráfica mensual nacional con', this.violenciaHomicidaMensualData.length, 'períodos');
        
        // Extraer datos básicos
        const periodos = this.violenciaHomicidaMensualData.map(row => row.Periodo);
        const totales = this.violenciaHomicidaMensualData.map(row => parseInt(row.Total) || 0);
        
        console.log('📅 Períodos:', periodos);
        console.log('📈 Totales:', totales);
        
        // Crear datasets para cada tipo de delito
        const delitos = ['Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos que atentan contra la vida y la integridad corporal'];
        const colors = ['#e74c3c', '#f39c12', '#3498db', '#9b59b6'];
        
        const datasets = delitos.map((delito, index) => ({
            label: delito === 'Otros delitos que atentan contra la vida y la integridad corporal' ? 'Otros delitos contra la vida' : delito,
            data: this.violenciaHomicidaMensualData.map(row => parseInt(row[delito]) || 0),
            type: 'line',
            borderColor: colors[index],
            backgroundColor: colors[index],
            borderWidth: 3,
            fill: false,
            tension: 0,
            pointRadius: 4,
            pointHoverRadius: 6,
            order: index + 1
        }));
        
        // Agregar dataset de barras para el total
        datasets.push({
            label: 'Total violencia homicida',
            data: totales,
            type: 'bar',
            backgroundColor: '#34495e',
            borderColor: '#34495e',
            borderWidth: 1,
            order: 5
        });

        // Crear la gráfica
        const ctx = document.getElementById('chart-violencia-mensual');
        if (ctx) {
            // Destruir gráfico existente si existe
            if (window.nacionalMensualChart) {
                window.nacionalMensualChart.destroy();
            }
            
            const options = this.getChartOptions('Período', 'Número de casos');
            options.scales.x.ticks = { maxRotation: 45, minRotation: 45 };
            
            window.nacionalMensualChart = new Chart(ctx, {
                type: 'bar',
                data: { labels: periodos, datasets: datasets },
                options: options
            });
            
            console.log('✅ Gráfica mensual nacional creada exitosamente');
        } else {
            console.log('❌ No se encontró el elemento chart-violencia-mensual');
        }
    }

    generateEstatalStackedChart() {
        if (!this.estatalData2025 || this.estatalData2025.length === 0) return;

        // Preparar datos para la gráfica apilada
        const estados = this.estatalData2025.map(row => row.Estado);
        const delitos = ['Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos que atentan contra la vida y la integridad corporal'];
        const colors = ['#e74c3c', '#f39c12', '#3498db', '#9b59b6']; // Rojo, naranja, azul, morado
        
        const datasets = delitos.map((delito, index) => {
            let displayName = delito;
            if (delito === 'Otros delitos que atentan contra la vida y la integridad corporal') {
                displayName = 'Otros delitos contra la vida';
            }
            
            return {
                label: displayName,
                data: this.estatalData2025.map(row => parseInt(row[delito]) || 0),
                backgroundColor: colors[index],
                borderColor: colors[index],
                borderWidth: 1
            };
        });

        const ctx = document.getElementById('chart-estatal-stacked');
        if (ctx) {
            // Destruir gráfico existente si existe
            if (window.estatalStackedChart) {
                window.estatalStackedChart.destroy();
            }
            
            window.estatalStackedChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: estados,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 15
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed.y;
                                    const total = context.chart.data.datasets.reduce((sum, dataset) => {
                                        return sum + dataset.data[context.dataIndex];
                                    }, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${context.dataset.label}: ${value.toLocaleString()} (${percentage}%)`;
                                },
                                footer: function(tooltipItems) {
                                    if (tooltipItems.length > 0) {
                                        const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
                                        return `Total: ${total.toLocaleString()} casos`;
                                    }
                                    return '';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            stacked: true,
                            title: {
                                display: true,
                                text: 'Estados'
                            },
                            ticks: {
                                maxRotation: 45,
                                minRotation: 45
                            }
                        },
                        y: {
                            stacked: true,
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
        }
    }

    generateEstatalEvolutionChart() {
        console.log('🔍 DEBUG generateEstatalEvolutionChart:');
        console.log('  - this.estatalMensualData:', this.estatalMensualData);
        console.log('  - Longitud de datos:', this.estatalMensualData ? this.estatalMensualData.length : 'null');
        
        if (!this.estatalMensualData || this.estatalMensualData.length === 0) return;

        // Generar las tablas de ranking inicialmente con violencia total
        this.generateRankingTables('Total');
        this.generateRatesRankingTables('Total');
        

        
        // Agregar event listener al selector de casos absolutos
        const selector = document.getElementById('violence-type-selector');
        if (selector) {
            selector.addEventListener('change', (e) => {
                const selectedType = e.target.value;
                this.generateRankingTables(selectedType);
                this.updateEstatalTable(selectedType);
                this.updateEstatalSubtitle(selectedType);
            });
        }

        // Agregar event listener al selector de tasas
        const ratesSelector = document.getElementById('rates-ranking-type-selector');
        if (ratesSelector) {
            ratesSelector.addEventListener('change', (e) => {
                const selectedType = e.target.value;
                this.generateRatesRankingTables(selectedType);
            });
        }


    }

    generateRankingTables(violenceType) {
        const container = document.getElementById('ranking-tables-grid');
        if (!container) return;

        // Obtener todos los períodos únicos ordenados
        const periodos = [...new Set(this.estatalMensualData.map(row => row.Periodo))];
        
        // Limpiar contenedor
        container.innerHTML = '';

        periodos.forEach(periodo => {
            // Filtrar datos del período y validar que Estado exista
            const periodData = this.estatalMensualData.filter(row => 
                row.Periodo === periodo && 
                row.Estado && 
                typeof row.Estado === 'string' &&
                row.Estado.trim() !== ''
            );
            
            if (periodData.length === 0) return;

            // Ordenar por el tipo de violencia seleccionado y tomar top 10
            periodData.sort((a, b) => parseInt(b[violenceType]) - parseInt(a[violenceType]));
            const top10 = periodData.slice(0, 10);

            // Crear contenedor de tabla
            const tableContainer = document.createElement('div');
            tableContainer.className = 'ranking-table-container';

            // Título de la tabla
            const title = document.createElement('div');
            title.className = 'ranking-table-title';
            title.textContent = periodo;
            tableContainer.appendChild(title);

            // Crear tabla
            const table = document.createElement('table');
            table.className = 'ranking-mini-table';

            // Header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            const headers = ['#', 'Estado', 'Casos'];
            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Body
            const tbody = document.createElement('tbody');
            top10.forEach((row, index) => {
                // Validación adicional antes de procesar cada fila
                if (!row.Estado || typeof row.Estado !== 'string') {
                    console.warn('generateRankingTables: Estado inválido en fila:', row);
                    return; // Saltar esta fila
                }
                
                const tr = document.createElement('tr');
                
                // Destacar Sinaloa en amarillo
                if (row.Estado === 'Sinaloa') {
                    tr.style.backgroundColor = '#fff3cd';
                    tr.style.fontWeight = 'bold';
                }
                
                // Ranking
                const rankTd = document.createElement('td');
                rankTd.className = 'rank-cell';
                rankTd.textContent = (index + 1).toString();
                tr.appendChild(rankTd);
                
                // Estado (abreviado)
                const stateTd = document.createElement('td');
                stateTd.className = 'state-cell';
                stateTd.textContent = this.abbreviateStateName(row.Estado);
                stateTd.title = row.Estado; // Tooltip con nombre completo
                tr.appendChild(stateTd);
                
                // Valor
                const valueTd = document.createElement('td');
                valueTd.className = 'value-cell';
                const value = parseInt(row[violenceType]) || 0;
                valueTd.textContent = value.toLocaleString();
                tr.appendChild(valueTd);
                
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            tableContainer.appendChild(table);
            
            container.appendChild(tableContainer);
        });
    }

    abbreviateStateName(fullName) {
        // Validar que fullName exista y sea una cadena
        if (!fullName || typeof fullName !== 'string') {
            console.warn('abbreviateStateName: fullName es undefined, null o no es una cadena:', fullName);
            return 'N/A';
        }
        
        const abbreviations = {
            'Aguascalientes': 'AGS',
            'Baja California': 'BC',
            'Baja California Sur': 'BCS',
            'Campeche': 'CAM',
            'Coahuila de Zaragoza': 'COAH',
            'Colima': 'COL',
            'Chiapas': 'CHIS',
            'Chihuahua': 'CHIH',
            'Ciudad de México': 'CDMX',
            'Durango': 'DGO',
            'Guanajuato': 'GTO',
            'Guerrero': 'GRO',
            'Hidalgo': 'HGO',
            'Jalisco': 'JAL',
            'México': 'MEX',
            'Michoacán de Ocampo': 'MICH',
            'Morelos': 'MOR',
            'Nayarit': 'NAY',
            'Nuevo León': 'NL',
            'Oaxaca': 'OAX',
            'Puebla': 'PUE',
            'Querétaro': 'QRO',
            'Quintana Roo': 'QROO',
            'San Luis Potosí': 'SLP',
            'Sinaloa': 'SIN',
            'Sonora': 'SON',
            'Tabasco': 'TAB',
            'Tamaulipas': 'TAMS',
            'Tlaxcala': 'TLAX',
            'Veracruz de Ignacio de la Llave': 'VER',
            'Yucatán': 'YUC',
            'Zacatecas': 'ZAC'
        };
        
        // Si existe una abreviatura, usarla; si no, usar los primeros 4 caracteres
        return abbreviations[fullName] || fullName.substring(0, 4).toUpperCase();
    }

    calculateNationalRates() {
        // Sumar todos los casos de todos los estados
        const nacionalTotals = {
            'Clave_Entidad': 0,
            'Entidad': 'NACIONAL',
            'Homicidio doloso': 0,
            'Homicidio culposo': 0,
            'Feminicidio': 0,
            'Otros delitos que atentan contra la vida y la integridad corporal': 0,
            'Total': 0
        };

        // Sumar casos de todos los estados
        this.estatalData2025.forEach(row => {
            nacionalTotals['Homicidio doloso'] += parseInt(row['Homicidio doloso']) || 0;
            nacionalTotals['Homicidio culposo'] += parseInt(row['Homicidio culposo']) || 0;
            nacionalTotals['Feminicidio'] += parseInt(row['Feminicidio']) || 0;
            nacionalTotals['Otros delitos que atentan contra la vida y la integridad corporal'] += parseInt(row['Otros delitos que atentan contra la vida y la integridad corporal']) || 0;
            nacionalTotals['Total'] += parseInt(row['Total']) || 0;
        });

        // Obtener población nacional (clave 0)
        const poblacionNacional = this.getPoblacion(0, 2025);
        
        // Convertir a tasas
        const nacionalRates = { ...nacionalTotals };
        if (poblacionNacional && poblacionNacional > 0) {
            nacionalRates['Homicidio doloso'] = this.calculateRate(nacionalTotals['Homicidio doloso'], poblacionNacional);
            nacionalRates['Homicidio culposo'] = this.calculateRate(nacionalTotals['Homicidio culposo'], poblacionNacional);
            nacionalRates['Feminicidio'] = this.calculateRate(nacionalTotals['Feminicidio'], poblacionNacional);
            nacionalRates['Otros delitos que atentan contra la vida y la integridad corporal'] = this.calculateRate(nacionalTotals['Otros delitos que atentan contra la vida y la integridad corporal'], poblacionNacional);
            nacionalRates['Total'] = this.calculateRate(nacionalTotals['Total'], poblacionNacional);
        }

        return nacionalRates;
    }

    calculateNationalAbsolute() {
        // Sumar todos los casos de todos los estados
        const nacionalTotals = {
            'Clave_Entidad': 0,
            'Entidad': 'NACIONAL',
            'Homicidio doloso': 0,
            'Homicidio culposo': 0,
            'Feminicidio': 0,
            'Otros delitos que atentan contra la vida y la integridad corporal': 0,
            'Total': 0
        };

        // Sumar casos de todos los estados
        this.estatalData2025.forEach(row => {
            nacionalTotals['Homicidio doloso'] += parseInt(row['Homicidio doloso']) || 0;
            nacionalTotals['Homicidio culposo'] += parseInt(row['Homicidio culposo']) || 0;
            nacionalTotals['Feminicidio'] += parseInt(row['Feminicidio']) || 0;
            nacionalTotals['Otros delitos que atentan contra la vida y la integridad corporal'] += parseInt(row['Otros delitos que atentan contra la vida y la integridad corporal']) || 0;
            nacionalTotals['Total'] += parseInt(row['Total']) || 0;
        });

        return nacionalTotals;
    }

    calculateNationalMonthlyChanges(crimeType) {
        const periodos = [...new Set(this.estatalMensualData.map(row => row.Periodo))];
        const cambiosNacionales = {};
        
        periodos.forEach((periodo, index) => {
            if (index === 0 && periodo === 'Enero 2024') {
                // Para enero 2024, comparar con diciembre 2023 nacional
                const enero2024Nacional = this.calculateNationalForPeriod(periodo, crimeType);
                const dic2023Nacional = this.calculateNationalDiciembre2023(crimeType);
                
                if (dic2023Nacional > 0) {
                    cambiosNacionales[periodo] = ((enero2024Nacional - dic2023Nacional) / dic2023Nacional) * 100;
                } else {
                    cambiosNacionales[periodo] = 0;
                }
            } else {
                // Para otros meses, comparar con el mes anterior
                const mesActualNacional = this.calculateNationalForPeriod(periodo, crimeType);
                const mesAnteriorNacional = this.calculateNationalForPeriod(periodos[index - 1], crimeType);
                
                if (mesAnteriorNacional > 0) {
                    cambiosNacionales[periodo] = ((mesActualNacional - mesAnteriorNacional) / mesAnteriorNacional) * 100;
                } else {
                    cambiosNacionales[periodo] = 0;
                }
            }
        });
        
        return cambiosNacionales;
    }

    calculateNationalForPeriod(periodo, crimeType) {
        const periodData = this.estatalMensualData.filter(row => row.Periodo === periodo);
        return periodData.reduce((sum, row) => sum + (parseInt(row[crimeType]) || 0), 0);
    }

    calculateNationalDiciembre2023(crimeType) {
        return this.estatalDiciembre2023Data.reduce((sum, row) => sum + (parseInt(row[crimeType]) || 0), 0);
    }

    createSinaloaMensualTable(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || !data || data.length === 0) return;

        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Orden específico de columnas para la tabla mensual de Sinaloa
        const orderedHeaders = ['Año', 'Mes', 'Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos que atentan contra la vida y la integridad corporal', 'Total'];
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        orderedHeaders.forEach(header => {
            const th = document.createElement('th');
            let displayName = header;
            if (header === 'Otros delitos que atentan contra la vida y la integridad corporal') {
                displayName = 'Otros delitos contra la vida';
            } else if (header === 'Total') {
                displayName = 'Violencia homicida total';
            }
            th.textContent = displayName;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        data.forEach((row, index) => {
            const tr = document.createElement('tr');
            
            orderedHeaders.forEach((header, colIndex) => {
                const td = document.createElement('td');
                
                if (colIndex <= 1) { // Año y Mes
                    td.textContent = row[header];
                    td.style.textAlign = 'left';
                    td.style.fontWeight = '500';
                } else {
                    // Números con formato de miles
                    const value = parseInt(row[header]) || 0;
                    td.textContent = value.toLocaleString();
                    td.style.textAlign = 'center';
                }
                
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        
        // Agregar nota de fuente
        const sourceNote = document.createElement('p');
        sourceNote.className = 'source-note';
        sourceNote.style.fontSize = '12px';
        sourceNote.style.fontStyle = 'italic';
        sourceNote.style.marginTop = '10px';
        sourceNote.style.color = '#666';
        sourceNote.innerHTML = '<strong>Fuente:</strong> SESNSP. Datos mensuales de violencia homicida en Sinaloa.';
        
        container.innerHTML = '';
        container.appendChild(table);
        container.appendChild(sourceNote);
    }

    createSinaloaAnualTable(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || !data || data.length === 0) return;

        // Los datos de Sinaloa están organizados por delito (filas) y años (columnas)
        // Necesitamos transformarlos a años (filas) y delitos (columnas)
        
        // Obtener años disponibles (excluyendo 'Delito', 'Total' y 2018)
        const años = Object.keys(data[0]).filter(key => 
            key !== 'Delito' && 
            key !== 'Total' && 
            !isNaN(key) && 
            parseInt(key) >= 2019
        );
        
        // Crear mapeo de delitos
        const delitoMap = {};
        data.forEach(row => {
            delitoMap[row.Delito] = row;
        });

        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Año', 'Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos contra la vida', 'Violencia homicida total'];
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Body - crear fila por cada año
        const tbody = document.createElement('tbody');
        años.forEach((año, index) => {
            const tr = document.createElement('tr');
            
            // Año
            const yearTd = document.createElement('td');
            yearTd.textContent = año;
            yearTd.style.textAlign = 'left';
            yearTd.style.fontWeight = '500';
            tr.appendChild(yearTd);
            
            // Homicidio doloso
            const hdTd = document.createElement('td');
            const hdValue = parseInt(delitoMap['Homicidio doloso']?.[año]) || 0;
            hdTd.textContent = hdValue.toLocaleString();
            hdTd.style.textAlign = 'center';
            tr.appendChild(hdTd);
            
            // Homicidio culposo
            const hcTd = document.createElement('td');
            const hcValue = parseInt(delitoMap['Homicidio culposo']?.[año]) || 0;
            hcTd.textContent = hcValue.toLocaleString();
            hcTd.style.textAlign = 'center';
            tr.appendChild(hcTd);
            
            // Feminicidio
            const femTd = document.createElement('td');
            const femValue = parseInt(delitoMap['Feminicidio']?.[año]) || 0;
            femTd.textContent = femValue.toLocaleString();
            femTd.style.textAlign = 'center';
            tr.appendChild(femTd);
            
            // Otros delitos
            const otrosTd = document.createElement('td');
            const otrosValue = parseInt(delitoMap['Otros delitos que atentan contra la vida y la integridad corporal']?.[año]) || 0;
            otrosTd.textContent = otrosValue.toLocaleString();
            otrosTd.style.textAlign = 'center';
            tr.appendChild(otrosTd);
            
            // Total - calcular como suma de los otros delitos
            const totalTd = document.createElement('td');
            const totalValue = hdValue + hcValue + femValue + otrosValue;
            totalTd.textContent = totalValue.toLocaleString();
            totalTd.style.textAlign = 'center';
            tr.appendChild(totalTd);
            
            // Destacar la última fila (año más reciente)
            if (index === años.length - 1) {
                tr.style.backgroundColor = '#34495e';
                tr.style.color = 'white';
                tr.style.fontWeight = 'bold';
            }
            
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        
        // Agregar nota de fuente
        const sourceNote = document.createElement('p');
        sourceNote.className = 'source-note';
        sourceNote.style.fontSize = '12px';
        sourceNote.style.fontStyle = 'italic';
        sourceNote.style.marginTop = '10px';
        sourceNote.style.color = '#666';
        sourceNote.innerHTML = '<strong>Fuente:</strong> SESNSP. Datos anuales de violencia homicida en Sinaloa (enero-julio).';
        
        container.innerHTML = '';
        container.appendChild(table);
        container.appendChild(sourceNote);
    }

    generateRatesRankingTables(violenceType) {
        const container = document.getElementById('rates-ranking-tables-grid');
        if (!container) return;

        // Obtener todos los períodos únicos ordenados
        const periodos = [...new Set(this.estatalMensualData.map(row => row.Periodo))];
        
        // Limpiar contenedor
        container.innerHTML = '';

        periodos.forEach(periodo => {
            // Filtrar datos del período
            const periodData = this.estatalMensualData.filter(row => row.Periodo === periodo);
            
            if (periodData.length === 0) return;

            // Convertir a tasas y ordenar por el tipo de violencia seleccionado
            const ratesData = periodData.map(row => {
                // Mapeo de nombres de estados a claves de entidad
                const estadoToClave = {
                    'Aguascalientes': 1, 'Baja California': 2, 'Baja California Sur': 3, 'Campeche': 4,
                    'Coahuila de Zaragoza': 5, 'Colima': 6, 'Chiapas': 7, 'Chihuahua': 8,
                    'Ciudad de México': 9, 'Durango': 10, 'Guanajuato': 11, 'Guerrero': 12,
                    'Hidalgo': 13, 'Jalisco': 14, 'México': 15, 'Michoacán de Ocampo': 16,
                    'Morelos': 17, 'Nayarit': 18, 'Nuevo León': 19, 'Oaxaca': 20,
                    'Puebla': 21, 'Querétaro': 22, 'Quintana Roo': 23, 'San Luis Potosí': 24,
                    'Sinaloa': 25, 'Sonora': 26, 'Tabasco': 27, 'Tamaulipas': 28,
                    'Tlaxcala': 29, 'Veracruz de Ignacio de la Llave': 30, 'Yucatán': 31, 'Zacatecas': 32
                };
                
                const nombreEstado = row.Estado;
                const claveEntidad = estadoToClave[nombreEstado];
                const año = parseInt(row.Año);
                const poblacion = this.getPoblacion(claveEntidad, año);
                
                console.log('🔍 DEBUG Tabla 9 - procesando fila:', {
                    periodo,
                    nombreEstado,
                    claveEntidad,
                    año,
                    poblacion,
                    homicidiosDolosos: row['Homicidio doloso'],
                    total: row['Total']
                });
                
                const rateRow = { ...row };
                
                if (poblacion && poblacion > 0) {
                    rateRow['Homicidio doloso'] = this.calculateRate(parseInt(row['Homicidio doloso']) || 0, poblacion);
                    rateRow['Homicidio culposo'] = this.calculateRate(parseInt(row['Homicidio culposo']) || 0, poblacion);
                    rateRow['Feminicidio'] = this.calculateRate(parseInt(row['Feminicidio']) || 0, poblacion);
                    rateRow['Otros delitos que atentan contra la vida y la integridad corporal'] = this.calculateRate(parseInt(row['Otros delitos que atentan contra la vida y la integridad corporal']) || 0, poblacion);
                    rateRow['Total'] = this.calculateRate(parseInt(row['Total']) || 0, poblacion);
                } else {
                    rateRow['Homicidio doloso'] = 0;
                    rateRow['Homicidio culposo'] = 0;
                    rateRow['Feminicidio'] = 0;
                    rateRow['Otros delitos que atentan contra la vida y la integridad corporal'] = 0;
                    rateRow['Total'] = 0;
                }
                
                return rateRow;
            });

            // Ordenar por el tipo de violencia seleccionado y tomar top 10
            ratesData.sort((a, b) => parseFloat(b[violenceType]) - parseFloat(a[violenceType]));
            const top10 = ratesData.slice(0, 10);

            // Crear contenedor de tabla
            const tableContainer = document.createElement('div');
            tableContainer.className = 'ranking-table-container';

            // Título de la tabla
            const title = document.createElement('div');
            title.className = 'ranking-table-title';
            title.textContent = periodo;
            tableContainer.appendChild(title);

            // Crear tabla
            const table = document.createElement('table');
            table.className = 'ranking-mini-table';

            // Header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            const headers = ['#', 'Estado', 'Tasa'];
            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Body
            const tbody = document.createElement('tbody');
            top10.forEach((row, index) => {
                const tr = document.createElement('tr');
                
                // Destacar Sinaloa en amarillo
                if (row.Estado === 'Sinaloa') {
                    tr.style.backgroundColor = '#fff3cd';
                    tr.style.fontWeight = 'bold';
                }
                
                // Ranking
                const rankTd = document.createElement('td');
                rankTd.className = 'rank-cell';
                rankTd.textContent = (index + 1).toString();
                tr.appendChild(rankTd);
                
                // Estado (abreviado)
                const stateTd = document.createElement('td');
                stateTd.className = 'state-cell';
                stateTd.textContent = this.abbreviateStateName(row.Estado);
                stateTd.title = row.Estado; // Tooltip con nombre completo
                tr.appendChild(stateTd);
                
                // Valor (tasa)
                const valueTd = document.createElement('td');
                valueTd.className = 'value-cell';
                const rate = parseFloat(row[violenceType]) || 0;
                valueTd.textContent = rate.toFixed(1);
                tr.appendChild(valueTd);
                
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            tableContainer.appendChild(table);
            
            container.appendChild(tableContainer);
        });
    }

    updateEstatalSubtitle(violenceType) {
        const subtitle = document.getElementById('tabla-estatal-subtitle');
        if (!subtitle) return;

        const typeNames = {
            'Total': 'violencia homicida total',
            'Homicidio doloso': 'homicidios dolosos',
            'Homicidio culposo': 'homicidios culposos',
            'Feminicidio': 'feminicidios',
            'Otros delitos que atentan contra la vida y la integridad corporal': 'otros delitos contra la vida'
        };

        const typeName = typeNames[violenceType] || violenceType.toLowerCase();
        subtitle.textContent = `Estados ordenados por mayor número de ${typeName} (enero-junio 2025)`;
    }

    updateEstatalTable(violenceType) {
        if (!this.estatalData2025 || this.estatalData2025.length === 0) return;

        // Reordenar los datos según el tipo de violencia seleccionado
        const sortedData = [...this.estatalData2025].sort((a, b) => {
            const valueA = parseInt(a[violenceType]) || 0;
            const valueB = parseInt(b[violenceType]) || 0;
            return valueB - valueA;
        });

        // Regenerar la tabla con los datos reordenados
        this.createEstatalTable('tabla-estatal-2025', sortedData);
    }

    createEstatalRatesTable(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || !data || data.length === 0) return;

        console.log('🔍 DEBUG createEstatalRatesTable:', {
            containerId,
            dataLength: data.length,
            sampleData: data.slice(0, 2),
            container: !!container
        });

        // Mapeo de nombres de estados a claves de entidad
        const estadoToClave = {
            'Aguascalientes': 1, 'Baja California': 2, 'Baja California Sur': 3, 'Campeche': 4,
            'Coahuila de Zaragoza': 5, 'Colima': 6, 'Chiapas': 7, 'Chihuahua': 8,
            'Ciudad de México': 9, 'Durango': 10, 'Guanajuato': 11, 'Guerrero': 12,
            'Hidalgo': 13, 'Jalisco': 14, 'México': 15, 'Michoacán de Ocampo': 16,
            'Morelos': 17, 'Nayarit': 18, 'Nuevo León': 19, 'Oaxaca': 20,
            'Puebla': 21, 'Querétaro': 22, 'Quintana Roo': 23, 'San Luis Potosí': 24,
            'Sinaloa': 25, 'Sonora': 26, 'Tabasco': 27, 'Tamaulipas': 28,
            'Tlaxcala': 29, 'Veracruz de Ignacio de la Llave': 30, 'Yucatán': 31, 'Zacatecas': 32
        };

        // Convertir datos a tasas por 100,000 habitantes
        const ratesData = data.map(row => {
            const nombreEstado = row.Estado;
            const claveEntidad = estadoToClave[nombreEstado];
            const poblacion = this.getPoblacion(claveEntidad, 2025);
            
            console.log('🔍 DEBUG procesando fila:', {
                nombreEstado,
                claveEntidad,
                poblacion,
                homicidiosDolosos: row['Homicidio doloso'],
                total: row['Total']
            });
            
            const rateRow = { ...row };
            
            if (poblacion && poblacion > 0) {
                rateRow['Homicidio doloso'] = this.calculateRate(parseInt(row['Homicidio doloso']) || 0, poblacion);
                rateRow['Homicidio culposo'] = this.calculateRate(parseInt(row['Homicidio culposo']) || 0, poblacion);
                rateRow['Feminicidio'] = this.calculateRate(parseInt(row['Feminicidio']) || 0, poblacion);
                rateRow['Otros delitos que atentan contra la vida y la integridad corporal'] = this.calculateRate(parseInt(row['Otros delitos que atentan contra la vida y la integridad corporal']) || 0, poblacion);
                rateRow['Total'] = this.calculateRate(parseInt(row['Total']) || 0, poblacion);
            } else {
                // Si no hay población, poner 0
                rateRow['Homicidio doloso'] = 0;
                rateRow['Homicidio culposo'] = 0;
                rateRow['Feminicidio'] = 0;
                rateRow['Otros delitos que atentan contra la vida y la integridad corporal'] = 0;
                rateRow['Total'] = 0;
            }
            
            return rateRow;
        });

        // Guardar los datos de tasas para uso posterior
        this.estatalRatesData2025 = ratesData;

        // Calcular datos nacionales
        const nacionalData = this.calculateNationalRates();
        console.log('🔍 DEBUG nacionalData:', nacionalData);
        
        // Agregar datos nacionales al inicio
        ratesData.unshift(nacionalData);
        
        // Ordenar estados (excluyendo nacional que ya está al inicio)
        const estadosData = ratesData.slice(1);
        estadosData.sort((a, b) => b.Total - a.Total);
        
        // Recombinar: Nacional primero, luego estados ordenados
        const finalData = [ratesData[0], ...estadosData];
        console.log('🔍 DEBUG finalData sample:', finalData.slice(0, 3));

        this.renderEstatalRatesTable(containerId, finalData, 'Total');
    }

    renderEstatalRatesTable(containerId, ratesData, sortBy = 'Total') {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Crear controles de ordenamiento
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'table-controls';
        controlsDiv.style.marginBottom = '15px';
        controlsDiv.style.padding = '10px';
        controlsDiv.style.backgroundColor = '#f8f9fa';
        controlsDiv.style.borderRadius = '5px';
        controlsDiv.style.border = '1px solid #dee2e6';

        const label = document.createElement('label');
        label.textContent = 'Ordenar por: ';
        label.style.fontWeight = 'bold';
        label.style.marginRight = '10px';

        const select = document.createElement('select');
        select.id = 'sort-select-rates-' + containerId;
        select.style.padding = '5px 10px';
        select.style.borderRadius = '3px';
        select.style.border = '1px solid #ccc';
        select.style.fontSize = '14px';

        // Opciones de ordenamiento
        const sortOptions = [
            { value: 'Total', text: 'Violencia homicida total' },
            { value: 'Homicidio doloso', text: 'Homicidios dolosos' },
            { value: 'Homicidio culposo', text: 'Homicidios culposos' },
            { value: 'Feminicidio', text: 'Feminicidios' },
            { value: 'Otros delitos que atentan contra la vida y la integridad corporal', text: 'Otros delitos contra la vida' }
        ];

        sortOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            if (option.value === 'Total') {
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        });

        controlsDiv.appendChild(label);
        controlsDiv.appendChild(select);

        // Función para renderizar la tabla
        const renderTable = (sortBy = 'Total') => {
            console.log('🔍 DEBUG renderTable rates:', { sortBy, dataLength: ratesData.length });
            
            // Ordenar datos por la columna seleccionada
            const sortedData = [...ratesData].sort((a, b) => {
                const valueA = parseFloat(a[sortBy]) || 0;
                const valueB = parseFloat(b[sortBy]) || 0;
                return valueB - valueA; // Orden descendente
            });

            const table = document.createElement('table');
            table.className = 'data-table';
            
            // Orden específico de columnas para la tabla estatal de tasas
            const orderedHeaders = ['Entidad', 'Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos que atentan contra la vida y la integridad corporal', 'Total'];
            
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            // Agregar columna de ranking
            const rankTh = document.createElement('th');
            rankTh.textContent = '#';
            rankTh.style.width = '40px';
            headerRow.appendChild(rankTh);
            
            orderedHeaders.forEach(header => {
                const th = document.createElement('th');
                let displayName = header;
                if (header === 'Otros delitos que atentan contra la vida y la integridad corporal') {
                    displayName = 'Otros delitos contra la vida';
                } else if (header === 'Total') {
                    displayName = 'Violencia homicida total';
                }
                th.textContent = displayName;
                
                // Destacar la columna por la que se está ordenando
                if (header === sortBy) {
                    th.style.backgroundColor = '#007bff';
                    th.style.color = 'white';
                    th.style.fontWeight = 'bold';
                }
                
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            const tbody = document.createElement('tbody');
            sortedData.forEach((row, index) => {
                const tr = document.createElement('tr');
                
                // Estilo especial para fila nacional
                const isNacional = row.Entidad === 'NACIONAL';
                if (isNacional) {
                    tr.style.backgroundColor = '#e8f5e8';
                    tr.style.fontWeight = 'bold';
                    tr.style.borderTop = '2px solid #28a745';
                    tr.style.borderBottom = '2px solid #28a745';
                }
                
                // Columna de ranking
                const rankTd = document.createElement('td');
                rankTd.textContent = isNacional ? 'NAL' : (index + 1).toString();
                rankTd.style.textAlign = 'center';
                rankTd.style.fontWeight = 'bold';
                rankTd.style.backgroundColor = isNacional ? '#d4edda' : '#f8f9fa';
                tr.appendChild(rankTd);
                
                orderedHeaders.forEach((header, colIndex) => {
                    const td = document.createElement('td');
                    
                    if (colIndex === 0) { // Entidad
                        const entidadValue = row[header] || row.Estado;
                        td.textContent = entidadValue || 'N/A';
                        td.style.textAlign = 'left';
                        td.style.fontWeight = '500';
                    } else {
                        // Mostrar tasas con 2 decimales
                        const rate = parseFloat(row[header]) || 0;
                        td.textContent = rate.toFixed(2);
                        td.style.textAlign = 'center';
                        
                        // Destacar la columna por la que se está ordenando
                        if (header === sortBy) {
                            td.style.backgroundColor = '#e3f2fd';
                            td.style.fontWeight = 'bold';
                        }
                    }
                    
                    tr.appendChild(td);
                });
                
                // Destacar los primeros 5 estados (excluyendo nacional)
                if (!isNacional && index < 5) {
                    tr.style.backgroundColor = index < 3 ? '#fff3cd' : '#f8f9fa';
                }
                
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            
            return table;
        };

        // Event listener para cambio de ordenamiento
        select.addEventListener('change', (e) => {
            const sortBy = e.target.value;
            const existingTable = container.querySelector('table');
            if (existingTable) {
                existingTable.remove();
            }
            const newTable = renderTable(sortBy);
            container.insertBefore(newTable, container.querySelector('.source-note'));
            
            // Actualizar nota de fuente
            const sourceNote = container.querySelector('.source-note');
            const sortText = sortOptions.find(opt => opt.value === sortBy).text.toLowerCase();
            sourceNote.innerHTML = `<strong>Fuente:</strong> SESNSP, INEGI y CONAPO. Tasas por cada 100,000 habitantes calculadas con datos de población 2025. Estados ordenados por ${sortText} de mayor a menor (enero-julio 2025).`;
        });

        // Agregar nota de fuente
        const sourceNote = document.createElement('p');
        sourceNote.className = 'source-note';
        sourceNote.style.fontSize = '12px';
        sourceNote.style.fontStyle = 'italic';
        sourceNote.style.marginTop = '10px';
        sourceNote.style.color = '#666';
        sourceNote.innerHTML = '<strong>Fuente:</strong> SESNSP, INEGI y CONAPO. Tasas por cada 100,000 habitantes calculadas con datos de población 2025. Estados ordenados por violencia homicida total de mayor a menor (enero-julio 2025).';
        
        // Renderizar tabla inicial
        const initialTable = renderTable('Total');
        
        container.innerHTML = '';
        container.appendChild(controlsDiv);
        container.appendChild(initialTable);
        container.appendChild(sourceNote);
    }

    updateEstatalRatesSubtitle(violenceType) {
        const subtitle = document.getElementById('tabla-estatal-rates-subtitle');
        if (!subtitle) return;

        const typeNames = {
            'Total': 'violencia homicida total',
            'Homicidio doloso': 'homicidios dolosos',
            'Homicidio culposo': 'homicidios culposos',
            'Feminicidio': 'feminicidios',
            'Otros delitos que atentan contra la vida y la integridad corporal': 'otros delitos contra la vida'
        };

        const typeName = typeNames[violenceType] || violenceType.toLowerCase();
        subtitle.textContent = `Estados ordenados por mayor tasa de ${typeName} por 100,000 habitantes (enero-julio 2025)`;
    }

    updateEstatalRatesTable(violenceType) {
        if (!this.estatalRatesData2025 || this.estatalRatesData2025.length === 0) return;

        // Ordenar los datos de tasas ya calculados por el tipo de violencia seleccionado
        const sortedRatesData = [...this.estatalRatesData2025].sort((a, b) => {
            const rateA = parseFloat(a[violenceType]) || 0;
            const rateB = parseFloat(b[violenceType]) || 0;
            return rateB - rateA;
        });

        // Solo actualizar la tabla existente, no recrear controles
        const container = document.getElementById('tabla-estatal-rates-2025');
        if (!container) return;

        // Buscar y actualizar solo la tabla, no los controles
        const existingTable = container.querySelector('table');
        if (existingTable) {
            existingTable.remove();
        }

        // Crear nueva tabla con datos ordenados
        const table = this.createRatesTableOnly(sortedRatesData, violenceType);
        container.insertBefore(table, container.querySelector('.source-note'));
        
        // Actualizar nota de fuente
        const sourceNote = container.querySelector('.source-note');
        if (sourceNote) {
            const sortText = this.getSortText(violenceType);
            sourceNote.innerHTML = `<strong>Fuente:</strong> SESNSP, INEGI y CONAPO. Tasas por cada 100,000 habitantes calculadas con datos de población 2025. Estados ordenados por ${sortText} de mayor a menor (enero-julio 2025).`;
        }
    }

    // Función auxiliar para obtener texto de ordenamiento
    getSortText(violenceType) {
        const typeNames = {
            'Total': 'violencia homicida total',
            'Homicidio doloso': 'homicidios dolosos',
            'Homicidio culposo': 'homicidios culposos',
            'Feminicidio': 'feminicidios',
            'Otros delitos que atentan contra la vida y la integridad corporal': 'otros delitos contra la vida'
        };
        return typeNames[violenceType] || violenceType.toLowerCase();
    }

    // Función para crear solo la tabla sin controles
    createRatesTableOnly(ratesData, sortBy = 'Total') {
        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Orden específico de columnas para la tabla estatal de tasas
        const orderedHeaders = ['Entidad', 'Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos que atentan contra la vida y la integridad corporal', 'Total'];
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Agregar columna de ranking
        const rankTh = document.createElement('th');
        rankTh.textContent = '#';
        rankTh.style.width = '40px';
        headerRow.appendChild(rankTh);
        
        orderedHeaders.forEach(header => {
            const th = document.createElement('th');
            let displayName = header;
            if (header === 'Otros delitos que atentan contra la vida y la integridad corporal') {
                displayName = 'Otros delitos contra la vida';
            } else if (header === 'Total') {
                displayName = 'Violencia homicida total';
            }
            th.textContent = displayName;
            
            // Destacar la columna por la que se está ordenando
            if (header === sortBy) {
                th.style.backgroundColor = '#007bff';
                th.style.color = 'white';
                th.style.fontWeight = 'bold';
            }
            
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        ratesData.forEach((row, index) => {
            const tr = document.createElement('tr');
            
            // Estilo especial para fila nacional
            const isNacional = row.Entidad === 'NACIONAL';
            if (isNacional) {
                tr.style.backgroundColor = '#e8f5e8';
                tr.style.fontWeight = 'bold';
                tr.style.borderTop = '2px solid #28a745';
                tr.style.borderBottom = '2px solid #28a745';
            }
            
            // Columna de ranking
            const rankTd = document.createElement('td');
            rankTd.textContent = isNacional ? 'NAL' : (index + 1).toString();
            rankTd.style.textAlign = 'center';
            rankTd.style.fontWeight = 'bold';
            rankTd.style.backgroundColor = isNacional ? '#d4edda' : '#f8f9fa';
            tr.appendChild(rankTd);
            
            orderedHeaders.forEach((header, colIndex) => {
                const td = document.createElement('td');
                
                if (colIndex === 0) { // Entidad
                    const entidadValue = row[header] || row.Estado;
                    td.textContent = entidadValue || 'N/A';
                    td.style.textAlign = 'left';
                    td.style.fontWeight = '500';
                } else {
                    // Mostrar tasas con 2 decimales
                    const rate = parseFloat(row[header]) || 0;
                    td.textContent = rate.toFixed(2);
                    td.style.textAlign = 'center';
                    
                    // Destacar la columna por la que se está ordenando
                    if (header === sortBy) {
                        td.style.backgroundColor = '#e3f2fd';
                        td.style.fontWeight = 'bold';
                    }
                }
                
                tr.appendChild(td);
            });
            
            // Destacar los primeros 5 estados (excluyendo nacional)
            if (!isNacional && index < 5) {
                tr.style.backgroundColor = index < 3 ? '#fff3cd' : '#f8f9fa';
            }
            
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        
        return table;
    }

    generateMonthlyChangesChart() {
        // Generar gráfica inicial con valores por defecto
        this.updateMonthlyChangesVisualization('Total');
        
        // Agregar event listener al selector
        const crimeSelector = document.getElementById('change-crime-selector');
        
        if (crimeSelector) {
            const updateChart = () => {
                const crime = crimeSelector.value;
                this.updateMonthlyChangesVisualization(crime);
                this.updateMonthlyChangesTable(crime);
                this.updateChangesTableSubtitle(crime);
            };
            
            crimeSelector.addEventListener('change', updateChart);
        }
    }

    updateMonthlyChangesVisualization(crimeType) {
        if (!this.estatalMensualData || !this.estatalDiciembre2023Data) return;

        // Calcular cambios porcentuales por estado
        const changesData = this.calculateMonthlyStateChanges(crimeType);
        
        // Agregar datos nacionales
        const nacionalChanges = this.calculateNationalMonthlyChanges(crimeType);
        changesData.push({ estado: 'NACIONAL', cambios: nacionalChanges });
        
        // Solo mostrar Sinaloa y Nacional
        const topStates = ['Sinaloa', 'NACIONAL'];
        
        // Crear datasets para la gráfica
        const periodos = [...new Set(this.estatalMensualData.map(row => row.Periodo))];
        
        // Generar colores únicos para todos los estados
        const generateColors = (count) => {
            const colors = [];
            for (let i = 0; i < count; i++) {
                const hue = (i * 360 / count) % 360;
                colors.push(`hsl(${hue}, 70%, 50%)`);
            }
            return colors;
        };
        
        const colors = generateColors(topStates.length);
        
        const datasets = topStates.map((estado, index) => {
            const stateData = changesData.find(s => s.estado === estado);
            
            // Configuración especial para Sinaloa
            const isSinaloa = estado === 'Sinaloa';
            
            return {
                label: estado,
                data: periodos.map(periodo => stateData ? stateData.cambios[periodo] || 0 : 0),
                borderColor: isSinaloa ? '#e74c3c' : colors[index],
                backgroundColor: isSinaloa ? '#e74c3c' : colors[index],
                borderWidth: isSinaloa ? 4 : 1.5,
                fill: false,
                tension: 0.1,
                pointRadius: isSinaloa ? 5 : 2,
                pointHoverRadius: isSinaloa ? 7 : 4,
                hidden: !isSinaloa // Mostrar solo Sinaloa inicialmente, otros ocultos
            };
        });

        const ctx = document.getElementById('chart-monthly-changes');
        if (ctx) {
            // Destruir gráfico existente si existe
            if (window.monthlyChangesChart) {
                window.monthlyChangesChart.destroy();
            }
            
            window.monthlyChangesChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: periodos,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                usePointStyle: true,
                                padding: 5,
                                font: {
                                    size: 10
                                },
                                generateLabels: function(chart) {
                                    const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                    // Destacar Sinaloa en la leyenda
                                    labels.forEach(label => {
                                        if (label.text === 'Sinaloa') {
                                            label.fontStyle = 'bold';
                                            label.fontColor = '#e74c3c';
                                        }
                                    });
                                    return labels;
                                }
                            },
                            onClick: function(e, legendItem, legend) {
                                // Funcionalidad para mostrar/ocultar líneas
                                const index = legendItem.datasetIndex;
                                const chart = legend.chart;
                                const meta = chart.getDatasetMeta(index);
                                
                                meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
                                chart.update();
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed.y;
                                    return `${context.dataset.label}: ${value.toFixed(1)}%`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Período'
                            },
                            ticks: {
                                maxRotation: 45,
                                minRotation: 45
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Cambio porcentual (%)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return value.toFixed(1) + '%';
                                }
                            },
                            grid: {
                                color: function(context) {
                                    return context.tick.value === 0 ? '#000' : 'rgba(0,0,0,0.1)';
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
        }
    }

    calculateMonthlyStateChanges(crimeType) {
        const estados = [...new Set(this.estatalMensualData.map(row => row.Estado))];
        const periodos = [...new Set(this.estatalMensualData.map(row => row.Periodo))];
        
        return estados.map(estado => {
            const cambios = {};
            
            periodos.forEach((periodo, index) => {
                if (index === 0 && periodo === 'Enero 2024') {
                    // Para enero 2024, comparar con diciembre 2023
                    const enero2024 = this.estatalMensualData.find(row => 
                        row.Estado === estado && row.Periodo === periodo
                    );
                    const dic2023 = this.estatalDiciembre2023Data.find(row => 
                        row.Estado === estado
                    );
                    
                    if (enero2024 && dic2023) {
                        const valorActual = parseInt(enero2024[crimeType]) || 0;
                        const valorAnterior = parseInt(dic2023[crimeType]) || 0;
                        
                        if (valorAnterior > 0) {
                            cambios[periodo] = ((valorActual - valorAnterior) / valorAnterior) * 100;
                        } else {
                            cambios[periodo] = 0;
                        }
                    }
                } else {
                    // Para otros meses, comparar con el mes anterior
                    const mesActual = this.estatalMensualData.find(row => 
                        row.Estado === estado && row.Periodo === periodo
                    );
                    const mesAnterior = this.estatalMensualData.find(row => 
                        row.Estado === estado && row.Periodo === periodos[index - 1]
                    );
                    
                    if (mesActual && mesAnterior) {
                        const valorActual = parseInt(mesActual[crimeType]) || 0;
                        const valorAnterior = parseInt(mesAnterior[crimeType]) || 0;
                        
                        if (valorAnterior > 0) {
                            cambios[periodo] = ((valorActual - valorAnterior) / valorAnterior) * 100;
                        } else {
                            cambios[periodo] = 0;
                        }
                    }
                }
            });
            
            return { estado, cambios };
        });
    }



    selectTopVariableStates(changesData, count) {
        // Estados importantes que siempre deben estar incluidos
        const estadosImportantes = ['Sinaloa', 'Baja California', 'Guanajuato', 'México', 'Jalisco', 'Chihuahua'];
        
        // Calcular un score combinado: variabilidad + magnitud promedio
        const statesWithScore = changesData.map(stateData => {
            const values = Object.values(stateData.cambios).filter(v => !isNaN(v));
            
            if (values.length === 0) {
                return {
                    estado: stateData.estado,
                    score: 0,
                    variabilidad: 0,
                    esImportante: estadosImportantes.includes(stateData.estado)
                };
            }
            
            const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
            const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            
            // Obtener magnitud promedio de casos del estado
            const magnitudPromedio = this.getStateMagnitude(stateData.estado);
            
            // Score combinado: variabilidad + factor de magnitud + bonus por importancia
            let score = stdDev + (magnitudPromedio / 1000); // Normalizar magnitud
            
            // Bonus para estados importantes
            if (estadosImportantes.includes(stateData.estado)) {
                score += 50; // Bonus significativo
            }
            
            return {
                estado: stateData.estado,
                score: score,
                variabilidad: stdDev,
                magnitud: magnitudPromedio,
                esImportante: estadosImportantes.includes(stateData.estado)
            };
        });
        
        // Ordenar por score combinado
        statesWithScore.sort((a, b) => b.score - a.score);
        
        // Seleccionar top estados
        let topStates = statesWithScore.slice(0, count).map(s => s.estado);
        
        // Asegurar que al menos los estados más importantes estén incluidos
        const estadosCriticos = ['Sinaloa', 'Baja California', 'Guanajuato', 'México'];
        estadosCriticos.forEach(estado => {
            if (!topStates.includes(estado)) {
                // Reemplazar el último estado no crítico
                for (let i = topStates.length - 1; i >= 0; i--) {
                    if (!estadosCriticos.includes(topStates[i])) {
                        topStates[i] = estado;
                        break;
                    }
                }
            }
        });
        
        return topStates;
    }

    getStateMagnitude(estado) {
        // Calcular magnitud promedio de casos para un estado
        const stateData = this.estatalMensualData.filter(row => row.Estado === estado);
        if (stateData.length === 0) return 0;
        
        const totalCases = stateData.reduce((sum, row) => sum + (parseInt(row.Total) || 0), 0);
        return totalCases / stateData.length;
    }

    createMonthlyChangesTable() {
        // Crear tabla inicial con valores por defecto
        this.updateMonthlyChangesTable('Total');
    }

    updateMonthlyChangesTable(crimeType) {
        const container = document.getElementById('tabla-cambios-mensuales-estados');
        if (!container) return;

        // Calcular cambios porcentuales
        const changesData = this.calculateMonthlyStateChanges(crimeType);
        const periodos = [...new Set(this.estatalMensualData.map(row => row.Periodo))];
        
        // Agregar datos nacionales
        const nacionalChanges = this.calculateNationalMonthlyChanges(crimeType);
        changesData.push({ estado: 'NACIONAL', cambios: nacionalChanges });
        
        // Incluir todos los estados
        const topStates = changesData.map(s => s.estado);
        const filteredData = changesData.filter(s => topStates.includes(s.estado));
        
        // Ordenar estados alfabéticamente (consistente con otras tablas)
        filteredData.sort((a, b) => a.estado.localeCompare(b.estado));
        
        // Crear tabla
        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const thEstado = document.createElement('th');
        thEstado.textContent = 'Estado';
        thEstado.style.position = 'sticky';
        thEstado.style.left = '0';
        thEstado.style.backgroundColor = '#f8f9fa';
        headerRow.appendChild(thEstado);
        
        periodos.forEach(periodo => {
            const th = document.createElement('th');
            th.textContent = periodo;
            th.style.minWidth = '80px';
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Body
        const tbody = document.createElement('tbody');
        filteredData.forEach(stateData => {
            const tr = document.createElement('tr');
            
            // Destacar Sinaloa y Nacional
            if (stateData.estado === 'Sinaloa') {
                tr.style.backgroundColor = '#fff3cd';
                tr.style.fontWeight = 'bold';
            } else if (stateData.estado === 'NACIONAL') {
                tr.style.backgroundColor = '#e8f5e8';
                tr.style.fontWeight = 'bold';
                tr.style.borderTop = '2px solid #28a745';
                tr.style.borderBottom = '2px solid #28a745';
            }
            
            // Estado
            const tdEstado = document.createElement('td');
            tdEstado.textContent = stateData.estado;
            tdEstado.style.position = 'sticky';
            tdEstado.style.left = '0';
            if (stateData.estado === 'Sinaloa') {
                tdEstado.style.backgroundColor = '#fff3cd';
            } else if (stateData.estado === 'NACIONAL') {
                tdEstado.style.backgroundColor = '#d4edda';
            } else {
                tdEstado.style.backgroundColor = '#f8f9fa';
            }
            tdEstado.style.fontWeight = '500';
            tr.appendChild(tdEstado);
            
            // Cambios por período
            periodos.forEach(periodo => {
                const td = document.createElement('td');
                const cambio = stateData.cambios[periodo] || 0;
                td.textContent = cambio.toFixed(1) + '%';
                td.style.textAlign = 'center';
                
                // Colorear según el signo
                if (cambio > 0) {
                    td.style.color = '#e74c3c';
                } else if (cambio < 0) {
                    td.style.color = '#27ae60';
                }
                
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        
        // Agregar nota de fuente
        const sourceNote = document.createElement('p');
        sourceNote.className = 'source-note';
        sourceNote.style.fontSize = '12px';
        sourceNote.style.fontStyle = 'italic';
        sourceNote.style.marginTop = '10px';
        sourceNote.style.color = '#666';
        sourceNote.innerHTML = '<strong>Fuente:</strong> SESNSP, INEGI y CONAPO. Cambios porcentuales calculados mes a mes. Enero 2024 comparado con diciembre 2023.';
        
        container.innerHTML = '';
        container.appendChild(table);
        container.appendChild(sourceNote);
    }

    updateChangesTableSubtitle(crimeType) {
        const subtitle = document.getElementById('changes-table-subtitle');
        if (!subtitle) return;

        const typeNames = {
            'Total': 'violencia homicida total',
            'Homicidio doloso': 'homicidios dolosos',
            'Homicidio culposo': 'homicidios culposos',
            'Feminicidio': 'feminicidios',
            'Otros delitos que atentan contra la vida y la integridad corporal': 'otros delitos contra la vida'
        };

        const typeName = typeNames[crimeType] || crimeType.toLowerCase();
        
        subtitle.textContent = `Variación mensual de ${typeName}`;
    }

    initializeSinaloaMap() {
        // Verificar que Leaflet esté disponible
        if (typeof L === 'undefined') {
            console.error('Leaflet no está cargado');
            return;
        }

        // Inicializar el mapa centrado en Sinaloa
        this.sinaloaMap = L.map('sinaloa-map').setView([25.0, -107.5], 8);

        // Agregar capa base
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.sinaloaMap);

        // Inicializar controles
        this.initializeMapControls();
        
        // Cargar datos iniciales
        this.updateSinaloaMap();
    }

    initializeMapControls() {
        const crimeSelector = document.getElementById('crime-type-selector');
        const timeSlider = document.getElementById('time-slider');
        const timeDisplay = document.getElementById('time-display');

        // Períodos disponibles - CORREGIDO para incluir todos los meses disponibles
        this.mapPeriods = [
            'Enero 2024', 'Febrero 2024', 'Marzo 2024', 'Abril 2024', 'Mayo 2024', 'Junio 2024', 'Julio 2024',
            'Agosto 2024', 'Septiembre 2024', 'Octubre 2024', 'Noviembre 2024', 'Diciembre 2024',
            'Enero 2025', 'Febrero 2025', 'Marzo 2025', 'Abril 2025', 'Mayo 2025', 'Junio 2025', 'Julio 2025'
        ];

        // Event listeners
        if (crimeSelector) {
            crimeSelector.addEventListener('change', () => this.updateSinaloaMap());
        }

        if (timeSlider && timeDisplay) {
            timeSlider.addEventListener('input', (e) => {
                const periodIndex = parseInt(e.target.value);
                timeDisplay.textContent = this.mapPeriods[periodIndex];
                this.updateSinaloaMap();
            });
        }
    }

    updateSinaloaMap() {
        if (!this.sinaloaMap || !this.sinaloaMunicipalData) {
            console.log('Map or data not available:', {
                map: !!this.sinaloaMap,
                data: !!this.sinaloaMunicipalData,
                dataLength: this.sinaloaMunicipalData?.length
            });
            return;
        }

        const crimeType = document.getElementById('crime-type-selector')?.value || 'Homicidio doloso';
        const periodIndex = parseInt(document.getElementById('time-slider')?.value || '0');
        const selectedPeriod = this.mapPeriods[periodIndex];

        console.log('Updating map with:', { crimeType, periodIndex, selectedPeriod });

        // Filtrar datos del período seleccionado
        const periodData = this.sinaloaMunicipalData.filter(row => row.Periodo === selectedPeriod);
        console.log('Period data:', periodData.length, 'records for', selectedPeriod);

        // Limpiar capas anteriores
        this.sinaloaMap.eachLayer(layer => {
            if (layer instanceof L.CircleMarker || layer instanceof L.Circle) {
                this.sinaloaMap.removeLayer(layer);
            }
        });

        // Coordenadas aproximadas de municipios de Sinaloa
        const municipalCoords = this.getMunicipalCoordinates();

        // Calcular rangos para el heatmap (violencia total)
        const totalValues = periodData.map(row => parseFloat(row.Total) || 0);
        const maxTotal = Math.max(...totalValues);
        const minTotal = Math.min(...totalValues);

        // Calcular rangos para los puntos (delito seleccionado)
        const crimeValues = periodData.map(row => parseFloat(row[crimeType]) || 0);
        const maxCrime = Math.max(...crimeValues);

        // Agregar marcadores para cada municipio
        periodData.forEach(row => {
            const municipio = row.Municipio;
            const coords = municipalCoords[municipio];
            
            if (coords) {
                const totalCases = parseFloat(row.Total) || 0;
                const crimeCases = parseFloat(row[crimeType]) || 0;

                // Color del heatmap basado en violencia total
                const intensity = maxTotal > 0 ? totalCases / maxTotal : 0;
                const heatmapColor = this.getHeatmapColor(intensity);

                // Tamaño del punto basado en el delito seleccionado
                const pointSize = maxCrime > 0 ? Math.max(5, (crimeCases / maxCrime) * 20) : 5;

                // Crear marcador con heatmap (círculo grande)
                const heatmapCircle = L.circle(coords, {
                    color: heatmapColor,
                    fillColor: heatmapColor,
                    fillOpacity: 0.3,
                    radius: Math.max(1000, totalCases * 100),
                    weight: 2
                }).addTo(this.sinaloaMap);

                // Crear punto para el delito específico
                const crimeMarker = L.circleMarker(coords, {
                    radius: pointSize,
                    fillColor: '#e74c3c',
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(this.sinaloaMap);

                // Popup con información
                const popupContent = `
                    <strong>${municipio}</strong><br>
                    <strong>Período:</strong> ${selectedPeriod}<br>
                    <strong>Violencia homicida total:</strong> ${totalCases}<br>
                    <strong>${crimeType}:</strong> ${crimeCases}<br>
                    <strong>Homicidio doloso:</strong> ${row['Homicidio doloso']}<br>
                    <strong>Homicidio culposo:</strong> ${row['Homicidio culposo']}<br>
                    <strong>Feminicidio:</strong> ${row['Feminicidio']}<br>
                    <strong>Otros delitos:</strong> ${row['Otros delitos que atentan contra la vida y la integridad corporal']}
                `;

                crimeMarker.bindPopup(popupContent);
                heatmapCircle.bindPopup(popupContent);
            }
        });

        // Actualizar tabla
        this.updateMunicipalTable(periodData, selectedPeriod);
    }

    getHeatmapColor(intensity) {
        // Gradiente de colores para el heatmap
        if (intensity > 0.8) return '#8B0000'; // Rojo muy oscuro
        if (intensity > 0.6) return '#DC143C'; // Rojo oscuro
        if (intensity > 0.4) return '#FF4500'; // Naranja rojo
        if (intensity > 0.2) return '#FFA500'; // Naranja
        if (intensity > 0.1) return '#FFD700'; // Amarillo
        return '#90EE90'; // Verde claro
    }

    getMunicipalCoordinates() {
        // Coordenadas aproximadas de los municipios de Sinaloa
        return {
            'Ahome': [25.8833, -109.0],
            'Angostura': [25.3667, -108.15],
            'Badiraguato': [25.35, -107.55],
            'Choix': [26.7167, -108.3167],
            'Concordia': [23.4167, -105.95],
            'Cosalá': [24.4167, -106.6833],
            'Culiacán': [24.8, -107.4],
            'El Fuerte': [26.4167, -108.6167],
            'Eldorado': [24.6, -107.35],
            'Elota': [23.8, -106.55],
            'Escuinapa': [22.8333, -105.7667],
            'Guasave': [25.5667, -108.4667],
            'Mazatlán': [23.2167, -106.4167],
            'Mocorito': [25.4833, -107.9167],
            'Navolato': [24.7667, -107.7],
            'Rosario': [22.9833, -105.8667],
            'Salvador Alvarado': [25.1667, -108.0833],
            'San Ignacio': [24.5667, -106.4167],
            'Sinaloa': [25.3833, -108.1],
            'Tamazula': [24.9667, -106.9833]
        };
    }

    updateMunicipalTable(data, period) {
        const container = document.getElementById('tabla-municipal-sinaloa');
        const subtitle = document.getElementById('municipal-table-subtitle');
        
        if (!container || !data) return;

        // Actualizar subtítulo
        if (subtitle) {
            subtitle.textContent = `Datos de ${period}`;
        }

        // Ordenar por violencia total
        const sortedData = [...data].sort((a, b) => (parseFloat(b.Total) || 0) - (parseFloat(a.Total) || 0));

        // Crear tabla
        const table = document.createElement('table');
        table.className = 'data-table';

        // Headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['#', 'Municipio', 'Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos', 'Total'];
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        sortedData.forEach((row, index) => {
            const tr = document.createElement('tr');

            // Ranking
            const rankTd = document.createElement('td');
            rankTd.textContent = (index + 1).toString();
            rankTd.style.textAlign = 'center';
            rankTd.style.fontWeight = 'bold';
            tr.appendChild(rankTd);

            // Municipio
            const munTd = document.createElement('td');
            munTd.textContent = row.Municipio;
            munTd.style.fontWeight = '500';
            tr.appendChild(munTd);

            // Datos numéricos
            const campos = ['Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos que atentan contra la vida y la integridad corporal', 'Total'];
            campos.forEach(campo => {
                const td = document.createElement('td');
                const value = parseFloat(row[campo]) || 0;
                td.textContent = value.toString();
                td.style.textAlign = 'center';
                tr.appendChild(td);
            });

            // Destacar top 3
            if (index < 3) {
                tr.style.backgroundColor = '#fff3cd';
            }

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
        sourceNote.innerHTML = `<strong>Fuente:</strong> SESNSP. Datos municipales de Sinaloa para ${period}.`;

        container.innerHTML = '';
        container.appendChild(table);
        container.appendChild(sourceNote);
    }

    generateSinaloaAnualChart() {
        const años = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
        const delitos = ['Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos que atentan contra la vida y la integridad corporal'];
        
        const totalRow = this.sinaloaAnualData[this.sinaloaAnualData.length - 1];
        const totales = años.map(año => parseInt(totalRow[año.toString()]) || 0);
        
        const datasets = [];
        
        delitos.forEach((delito, index) => {
            const delitoRow = this.sinaloaAnualData.find(row => row.Delito === delito);
            if (delitoRow) {
                const colors = ['#2ecc71', '#e74c3c', '#3498db', '#f39c12'];
                datasets.push({
                    label: delito === 'Otros delitos que atentan contra la vida y la integridad corporal' ? 'Otros delitos contra la vida' : delito,
                    data: años.map(año => parseInt(delitoRow[año.toString()]) || 0),
                    type: 'line',
                    borderColor: colors[index],
                    backgroundColor: colors[index],
                    borderWidth: 3,
                    fill: false,
                    tension: 0,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    order: index + 1
                });
            }
        });
        
        datasets.push({
            label: 'Violencia homicida',
            data: totales,
            type: 'bar',
            backgroundColor: '#34495e',
            borderColor: '#34495e',
            borderWidth: 1,
            order: 5
        });

        const ctx = document.getElementById('chart-sinaloa-anual');
        if (ctx) {
            // Destruir gráfico existente si existe
            if (window.sinaloaAnualChart) {
                window.sinaloaAnualChart.destroy();
            }
            
            window.sinaloaAnualChart = new Chart(ctx, {
                type: 'bar',
                data: { labels: años, datasets: datasets },
                options: this.getChartOptions('Año')
            });
        }
    }

    generateSinaloaMensualChart() {
        console.log('🔍 DEBUG generateSinaloaMensualChart:');
        console.log('  - this.sinaloaMensualData:', this.sinaloaMensualData);
        console.log('  - Longitud de datos:', this.sinaloaMensualData ? this.sinaloaMensualData.length : 'null');
        
        const periodos = this.sinaloaMensualData.map(row => row.Periodo);
        const totales = this.sinaloaMensualData.map(row => parseInt(row.Total));
        const delitos = ['Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos que atentan contra la vida y la integridad corporal'];
        
        const datasets = [];
        
        delitos.forEach((delito, index) => {
            const colors = ['#2ecc71', '#e74c3c', '#3498db', '#f39c12'];
            datasets.push({
                label: delito === 'Otros delitos que atentan contra la vida y la integridad corporal' ? 'Otros delitos contra la vida' : delito,
                data: this.sinaloaMensualData.map(row => parseInt(row[delito]) || 0),
                type: 'line',
                borderColor: colors[index],
                backgroundColor: colors[index],
                borderWidth: 3,
                fill: false,
                tension: 0,
                pointRadius: 0,
                pointHoverRadius: 6,
                order: index + 1
            });
        });
        
        datasets.push({
            label: 'Violencia homicida',
            data: totales,
            type: 'bar',
            backgroundColor: '#34495e',
            borderColor: '#34495e',
            borderWidth: 1,
            order: 5
        });

        const ctx = document.getElementById('chart-sinaloa-mensual');
        if (ctx) {
            // Destruir gráfico existente si existe
            if (window.sinaloaMensualChart) {
                window.sinaloaMensualChart.destroy();
            }
            
            const options = this.getChartOptions('Período');
            options.scales.x.ticks = { maxRotation: 45, minRotation: 45 };
            
            window.sinaloaMensualChart = new Chart(ctx, {
                type: 'bar',
                data: { labels: periodos, datasets: datasets },
                options: options
            });
        }
    }

    calculateCambiosPorcentuales(data) {
        const años = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
        const añosCambios = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
        const delitos = ['Feminicidio', 'Homicidio culposo', 'Homicidio doloso', 'Otros delitos que atentan contra la vida y la integridad corporal'];
        
        const cambios = [];
        
        delitos.forEach(delito => {
            const delitoRow = data.find(row => row.Delito === delito);
            if (delitoRow) {
                const filaCambios = { 
                    Delito: delito === 'Otros delitos que atentan contra la vida y la integridad corporal' ? 'Otros delitos contra la vida' : delito 
                };
                
                añosCambios.forEach(año => {
                    const valorActual = parseInt(delitoRow[año.toString()]) || 0;
                    const valorAnterior = parseInt(delitoRow[(año - 1).toString()]) || 0;
                    
                    let cambio = 0;
                    if (valorAnterior > 0) {
                        cambio = ((valorActual - valorAnterior) / valorAnterior * 100);
                    }
                    
                    filaCambios[año.toString()] = cambio;
                });
                
                cambios.push(filaCambios);
            }
        });
        
        const totalRow = data[data.length - 1];
        const filaTotales = { Delito: 'TOTAL VIOLENCIA HOMICIDA' };
        
        añosCambios.forEach(año => {
            const valorActual = parseInt(totalRow[año.toString()]) || 0;
            const valorAnterior = parseInt(totalRow[(año - 1).toString()]) || 0;
            
            let cambio = 0;
            if (valorAnterior > 0) {
                cambio = ((valorActual - valorAnterior) / valorAnterior * 100);
            }
            
            filaTotales[año.toString()] = cambio;
        });
        
        cambios.push(filaTotales);
        return cambios;
    }

    calculateCambiosPorcentualesMensuales(data) {
        const delitos = ['Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos que atentan contra la vida y la integridad corporal'];
        const cambios = [];
        
        // Datos de diciembre 2023 para calcular cambio de enero 2024
        const diciembre2023 = {
            'Homicidio doloso': 1994,
            'Homicidio culposo': 1581,
            'Feminicidio': 61,
            'Otros delitos que atentan contra la vida y la integridad corporal': 1105,
            'Total': 4741
        };
        
        // Crear array de períodos para comparación mes a mes
        const periodos = data.map(row => row.Periodo);
        
        delitos.forEach(delito => {
            const filaCambios = { 
                Delito: delito === 'Otros delitos que atentan contra la vida y la integridad corporal' ? 'Otros delitos contra la vida' : delito 
            };
            
            data.forEach((row, index) => {
                if (index === 0 && row.Periodo === 'Enero 2024') {
                    // Para enero 2024, comparar con diciembre 2023
                    const valorActual = parseInt(row[delito]) || 0;
                    const valorAnterior = diciembre2023[delito] || 0;
                    
                    let cambio = 0;
                    if (valorAnterior > 0) {
                        cambio = ((valorActual - valorAnterior) / valorAnterior * 100);
                    }
                    
                    filaCambios[row.Periodo] = cambio;
                } else if (index === 0) {
                    // Otros primeros meses no tienen comparación
                    filaCambios[row.Periodo] = 0;
                } else {
                    const valorActual = parseInt(row[delito]) || 0;
                    const valorAnterior = parseInt(data[index - 1][delito]) || 0;
                    
                    let cambio = 0;
                    if (valorAnterior > 0) {
                        cambio = ((valorActual - valorAnterior) / valorAnterior * 100);
                    }
                    
                    filaCambios[row.Periodo] = cambio;
                }
            });
            
            cambios.push(filaCambios);
        });
        
        // Agregar fila de totales
        const filaTotales = { Delito: 'TOTAL VIOLENCIA HOMICIDA' };
        
        data.forEach((row, index) => {
            if (index === 0 && row.Periodo === 'Enero 2024') {
                // Para enero 2024, comparar con diciembre 2023
                const valorActual = parseInt(row.Total) || 0;
                const valorAnterior = diciembre2023.Total || 0;
                
                let cambio = 0;
                if (valorAnterior > 0) {
                    cambio = ((valorActual - valorAnterior) / valorAnterior * 100);
                }
                
                filaTotales[row.Periodo] = cambio;
            } else if (index === 0) {
                filaTotales[row.Periodo] = 0;
            } else {
                const valorActual = parseInt(row.Total) || 0;
                const valorAnterior = parseInt(data[index - 1].Total) || 0;
                
                let cambio = 0;
                if (valorAnterior > 0) {
                    cambio = ((valorActual - valorAnterior) / valorAnterior * 100);
                }
                
                filaTotales[row.Periodo] = cambio;
            }
        });
        
        cambios.push(filaTotales);
        return cambios;
    }

    // Función para obtener población por entidad y año
    getPoblacion(claveEntidad, año) {
        const poblacionRow = this.poblacionData.find(row => 
            parseInt(row.Clave_Entidad) === claveEntidad
        );
        if (poblacionRow && poblacionRow[año.toString()] !== undefined && poblacionRow[año.toString()] !== '') {
            const valorRaw = poblacionRow[año.toString()];
            // Limpiar el valor de espacios y caracteres no numéricos
            const valorLimpio = valorRaw.toString().replace(/[^\d]/g, '');
            const poblacion = parseInt(valorLimpio);
            
            // Debug eliminado para evitar spam en consola
            
            return poblacion && !isNaN(poblacion) ? poblacion : null;
        }
        
        // Debug eliminado para evitar spam en consola
        return null;
    }

    // Función para calcular tasa por 100,000 habitantes
    calculateRate(casos, poblacion) {
        if (!poblacion || poblacion === 0) return 0;
        return (casos / poblacion) * 100000;
    }

    // Función para convertir datos absolutos a tasas
    convertToRates(data, claveEntidad = 0) {
        const años = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
        const ratesData = [];
        
        data.forEach(row => {
            const rateRow = { Delito: row.Delito };
            
            años.forEach(año => {
                const casos = parseInt(row[año.toString()]) || 0;
                const poblacion = this.getPoblacion(claveEntidad, año);
                
                if (poblacion) {
                    rateRow[año.toString()] = this.calculateRate(casos, poblacion);
                } else {
                    rateRow[año.toString()] = 0;
                    // Debug para 2025
                    if (año === 2025 && claveEntidad === 0) {
                        console.log(`No hay población para ${año}, delito: ${row.Delito}, casos: ${casos}`);
                    }
                }
            });
            
            // Calcular total como promedio ponderado
            const totalCasos = años.reduce((sum, año) => sum + (parseInt(row[año.toString()]) || 0), 0);
            const totalPoblacion = años.reduce((sum, año) => {
                const pob = this.getPoblacion(claveEntidad, año);
                return sum + (pob || 0);
            }, 0);
            
            rateRow.Total = totalPoblacion > 0 ? this.calculateRate(totalCasos, totalPoblacion / años.length) : 0;
            
            ratesData.push(rateRow);
        });
        
        return ratesData;
    }

    generateCambiosNacionalChart() {
        const cambios = this.calculateCambiosPorcentuales(this.violenciaHomicidaData);
        const años = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
        const delitos = ['Feminicidio', 'Homicidio culposo', 'Homicidio doloso', 'Otros delitos contra la vida'];
        
        const datasets = delitos.map((delito, index) => {
            const delitoData = cambios.find(row => row.Delito === delito);
            const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12'];
            
            return {
                label: delito,
                data: años.map(año => delitoData ? delitoData[año.toString()] : 0),
                borderColor: colors[index],
                backgroundColor: colors[index],
                borderWidth: 3,
                fill: false,
                tension: 0,
                pointRadius: 5
            };
        });

        // Agregar la línea de violencia homicida total
        const totalData = cambios.find(row => row.Delito === 'TOTAL VIOLENCIA HOMICIDA');
        if (totalData) {
            datasets.push({
                label: 'Violencia homicida total',
                data: años.map(año => totalData[año.toString()] || 0),
                borderColor: '#34495e',
                backgroundColor: '#34495e',
                borderWidth: 4,
                fill: false,
                tension: 0,
                pointRadius: 6,
                borderDash: [5, 5] // Línea punteada para distinguirla
            });
        }

        const ctx = document.getElementById('chart-cambios-nacional');
        if (ctx) {
            // Destruir gráfico existente si existe
            if (window.cambiosNacionalChart) {
                window.cambiosNacionalChart.destroy();
            }
            
            window.cambiosNacionalChart = new Chart(ctx, {
                type: 'line',
                data: { labels: años, datasets: datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { 
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 20
                            }
                        } 
                    },
                    scales: {
                        y: { 
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Variación porcentual (%)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return value.toFixed(1) + '%';
                                }
                            },
                            grid: {
                                color: function(context) {
                                    return context.tick.value === 0 ? '#000' : 'rgba(0,0,0,0.1)';
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Año'
                            }
                        }
                    }
                }
            });
        }
    }

    generateCambiosSinaloaChart() {
        const cambios = this.calculateCambiosPorcentuales(this.sinaloaAnualData);
        const años = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
        const delitos = ['Feminicidio', 'Homicidio culposo', 'Homicidio doloso', 'Otros delitos contra la vida'];
        
        const datasets = delitos.map((delito, index) => {
            const delitoData = cambios.find(row => row.Delito === delito);
            const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12'];
            
            return {
                label: delito,
                data: años.map(año => delitoData ? delitoData[año.toString()] : 0),
                borderColor: colors[index],
                backgroundColor: colors[index],
                borderWidth: 3,
                fill: false,
                tension: 0,
                pointRadius: 5
            };
        });

        // Agregar la línea de violencia homicida total
        const totalData = cambios.find(row => row.Delito === 'TOTAL VIOLENCIA HOMICIDA');
        if (totalData) {
            datasets.push({
                label: 'Violencia homicida total',
                data: años.map(año => totalData[año.toString()] || 0),
                borderColor: '#34495e',
                backgroundColor: '#34495e',
                borderWidth: 4,
                fill: false,
                tension: 0,
                pointRadius: 6,
                borderDash: [5, 5] // Línea punteada para distinguirla
            });
        }

        const ctx = document.getElementById('chart-cambios-sinaloa');
        if (ctx) {
            // Destruir gráfico existente si existe
            if (window.cambiosSinaloaChart) {
                window.cambiosSinaloaChart.destroy();
            }
            
            window.cambiosSinaloaChart = new Chart(ctx, {
                type: 'line',
                data: { labels: años, datasets: datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { 
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 20
                            }
                        } 
                    },
                    scales: {
                        y: { 
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Variación porcentual (%)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return value.toFixed(1) + '%';
                                }
                            },
                            grid: {
                                color: function(context) {
                                    return context.tick.value === 0 ? '#000' : 'rgba(0,0,0,0.1)';
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Año'
                            }
                        }
                    }
                }
            });
        }
    }

    generateCambiosMensualNacionalChart() {
        const cambios = this.calculateCambiosPorcentualesMensuales(this.violenciaHomicidaMensualData);
        const periodos = this.violenciaHomicidaMensualData.map(row => row.Periodo);
        const delitos = ['Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos contra la vida'];
        
        const datasets = delitos.map((delito, index) => {
            const delitoData = cambios.find(row => row.Delito === delito);
            const colors = ['#2ecc71', '#e74c3c', '#3498db', '#f39c12'];
            
            return {
                label: delito,
                data: periodos.map(periodo => delitoData ? delitoData[periodo] : 0),
                borderColor: colors[index],
                backgroundColor: colors[index],
                borderWidth: 3,
                fill: false,
                tension: 0,
                pointRadius: 4
            };
        });

        // Agregar la línea de violencia homicida total
        const totalData = cambios.find(row => row.Delito === 'TOTAL VIOLENCIA HOMICIDA');
        if (totalData) {
            datasets.push({
                label: 'Violencia homicida total',
                data: periodos.map(periodo => totalData[periodo] || 0),
                borderColor: '#34495e',
                backgroundColor: '#34495e',
                borderWidth: 4,
                fill: false,
                tension: 0,
                pointRadius: 6,
                borderDash: [5, 5]
            });
        }

        const ctx = document.getElementById('chart-cambios-mensual-nacional');
        if (ctx) {
            if (window.cambiosMensualNacionalChart) {
                window.cambiosMensualNacionalChart.destroy();
            }
            
            window.cambiosMensualNacionalChart = new Chart(ctx, {
                type: 'line',
                data: { labels: periodos, datasets: datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { 
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 20
                            }
                        } 
                    },
                    scales: {
                        y: { 
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Variación porcentual (%)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return value.toFixed(1) + '%';
                                }
                            },
                            grid: {
                                color: function(context) {
                                    return context.tick.value === 0 ? '#000' : 'rgba(0,0,0,0.1)';
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Período'
                            },
                            ticks: { 
                                maxRotation: 45, 
                                minRotation: 45 
                            }
                        }
                    }
                }
            });
        }
    }

    generateTables() {
        // Generar análisis de contribución
        this.generateAnalisisContribucion();
        
        this.createViolenciaHomicidaTable('tabla-violencia-homicida', this.violenciaHomicidaData);
        this.createViolenciaHomicidaRatesTable('tabla-violencia-homicida-rates', this.violenciaHomicidaData);
        this.createViolenciaMensualTable('tabla-violencia-mensual', this.violenciaHomicidaMensualData);
        this.createCambiosTable('tabla-cambios-nacional', this.violenciaHomicidaData);
        this.createCambiosMensualTable('tabla-cambios-mensual-nacional', this.violenciaHomicidaMensualData);
        this.createEstatalTable('tabla-estatal-2025', this.estatalData2025);
        this.createEstatalRatesTable('tabla-estatal-rates-2025', this.estatalData2025);
        this.createMonthlyChangesTable();
        
        // Agregar event listener para el selector de tasas
        const ratesSelector = document.getElementById('rates-type-selector');
        if (ratesSelector) {
            ratesSelector.addEventListener('change', (e) => {
                const selectedType = e.target.value;
                this.updateEstatalRatesTable(selectedType);
                this.updateEstatalRatesSubtitle(selectedType);
            });
        }
        this.createSinaloaAnualTable('tabla-sinaloa', this.sinaloaAnualData);
        this.createSinaloaMensualTable('tabla-sinaloa-mensual', this.sinaloaMensualData);
        this.createCambiosTable('tabla-cambios-sinaloa', this.sinaloaAnualData);
        
        if (window.spilloverAnalysis) {
            window.spilloverAnalysis.init();
        }
    }

    createViolenciaHomicidaTable(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || !data || data.length === 0) return;

        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Orden específico de columnas para la tabla de violencia homicida
        const orderedHeaders = ['Delito', '2019', '2020', '2021', '2022', '2023', '2024', '2025', 'Total'];
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        orderedHeaders.forEach(header => {
            const th = document.createElement('th');
            let displayName = header;
            if (header === 'Otros delitos que atentan contra la vida y la integridad corporal') {
                displayName = 'Otros delitos contra la vida';
            }
            th.textContent = displayName;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        
        // Orden deseado de los subtipos de delitos
        const ordenDelitos = [
            'Homicidio doloso',
            'Homicidio culposo', 
            'Otros delitos que atentan contra la vida y la integridad corporal',
            'Feminicidio'
        ];
        
        // Crear filas en el orden deseado
        ordenDelitos.forEach(delito => {
            const row = data.find(r => r.Delito === delito);
            if (row) {
                const tr = document.createElement('tr');
                orderedHeaders.forEach((header, colIndex) => {
                    const td = document.createElement('td');
                    const value = row[header];
                    
                    if (colIndex === 0 || header === 'Delito') {
                        let displayValue = value;
                        if (value === 'Otros delitos que atentan contra la vida y la integridad corporal') {
                            displayValue = 'Otros delitos contra la vida';
                        }
                        td.textContent = displayValue;
                        td.style.textAlign = 'left';
                        td.style.fontWeight = '500';
                    } else {
                        td.textContent = isNaN(value) ? value : parseInt(value).toLocaleString();
                        td.style.textAlign = 'center';
                    }
                    
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            }
        });
        
        // Agregar la fila total al final
        const totalRow = data.find(r => r.Delito === 'Total');
        if (totalRow) {
            const tr = document.createElement('tr');
            orderedHeaders.forEach((header, colIndex) => {
                const td = document.createElement('td');
                const value = totalRow[header];
                
                if (colIndex === 0 || header === 'Delito') {
                    td.textContent = value;
                    td.style.textAlign = 'left';
                    td.style.fontWeight = '500';
                } else {
                    td.textContent = isNaN(value) ? value : parseInt(value).toLocaleString();
                    td.style.textAlign = 'center';
                }
                
                tr.appendChild(td);
            });
            
            // Destacar la fila total
            tr.style.backgroundColor = '#34495e';
            tr.style.color = 'white';
            tr.style.fontWeight = 'bold';
            
            tbody.appendChild(tr);
        }
        
        table.appendChild(tbody);
        
        container.innerHTML = '';
        container.appendChild(table);
    }

    createViolenciaHomicidaRatesTable(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || !data || data.length === 0) return;

        // Convertir datos a tasas por 100,000 habitantes
        const ratesData = this.convertToRates(data, 0);

        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Orden específico de columnas para la tabla de violencia homicida
        const orderedHeaders = ['Delito', '2019', '2020', '2021', '2022', '2023', '2024', '2025', 'Total'];
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        orderedHeaders.forEach(header => {
            const th = document.createElement('th');
            let displayName = header;
            if (header === 'Otros delitos que atentan contra la vida y la integridad corporal') {
                displayName = 'Otros delitos contra la vida';
            }
            th.textContent = displayName;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        
        // Orden deseado de los subtipos de delitos
        const ordenDelitos = [
            'Homicidio doloso',
            'Homicidio culposo', 
            'Otros delitos que atentan contra la vida y la integridad corporal',
            'Feminicidio'
        ];
        
        // Crear filas en el orden deseado
        ordenDelitos.forEach(delito => {
            const row = ratesData.find(r => r.Delito === delito);
            if (row) {
                const tr = document.createElement('tr');
                orderedHeaders.forEach((header, colIndex) => {
                    const td = document.createElement('td');
                    const value = row[header];
                    
                    if (colIndex === 0 || header === 'Delito') {
                        let displayValue = value;
                        if (value === 'Otros delitos que atentan contra la vida y la integridad corporal') {
                            displayValue = 'Otros delitos contra la vida';
                        }
                        td.textContent = displayValue;
                        td.style.textAlign = 'left';
                        td.style.fontWeight = '500';
                    } else {
                        // Mostrar tasas con 2 decimales
                        td.textContent = typeof value === 'number' ? value.toFixed(2) : '0.00';
                        td.style.textAlign = 'center';
                    }
                    
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            }
        });
        
        // Agregar la fila total al final
        const totalRow = ratesData.find(r => r.Delito === 'Total');
        if (totalRow) {
            const tr = document.createElement('tr');
            orderedHeaders.forEach((header, colIndex) => {
                const td = document.createElement('td');
                const value = totalRow[header];
                
                if (colIndex === 0 || header === 'Delito') {
                    td.textContent = value;
                    td.style.textAlign = 'left';
                    td.style.fontWeight = '500';
                } else {
                    // Mostrar tasas con 2 decimales
                    td.textContent = typeof value === 'number' ? value.toFixed(2) : '0.00';
                    td.style.textAlign = 'center';
                }
                
                tr.appendChild(td);
            });
            
            // Destacar la fila total
            tr.style.backgroundColor = '#34495e';
            tr.style.color = 'white';
            tr.style.fontWeight = 'bold';
            
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        
        // Agregar nota de fuente
        const sourceNote = document.createElement('p');
        sourceNote.className = 'source-note';
        sourceNote.style.fontSize = '12px';
        sourceNote.style.fontStyle = 'italic';
        sourceNote.style.marginTop = '10px';
        sourceNote.style.color = '#666';
        sourceNote.innerHTML = '<strong>Fuente:</strong> INEGI, SESNSP y CONAPO. Para el cálculo de las tasas de homicidios por cada 100 mil habitantes de 2019 y 2025 los denominadores corresponden a los datos que publicó el Consejo Nacional de Población (CONAPO) y que refieren a la Conciliación Demográfica de México. Los denominadores de los años 2020 a 2024 provienen de la estimación de población que elabora el INEGI con base en el Marco de Muestreo de Viviendas.';
        
        container.innerHTML = '';
        container.appendChild(table);
        container.appendChild(sourceNote);
    }

    createViolenciaMensualTable(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || !data || data.length === 0) return;

        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Orden específico de columnas para la tabla mensual (sin Periodo)
        const orderedHeaders = ['Año', 'Mes', 'Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos que atentan contra la vida y la integridad corporal', 'Total'];
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        orderedHeaders.forEach(header => {
            const th = document.createElement('th');
            let displayName = header;
            if (header === 'Otros delitos que atentan contra la vida y la integridad corporal') {
                displayName = 'Otros delitos contra la vida';
            } else if (header === 'Total') {
                displayName = 'Violencia homicida total';
            }
            th.textContent = displayName;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        data.forEach((row, index) => {
            const tr = document.createElement('tr');
            orderedHeaders.forEach((header, colIndex) => {
                const td = document.createElement('td');
                const value = row[header];
                
                if (colIndex <= 1) { // Año y Mes
                    td.textContent = value;
                    td.style.textAlign = 'left';
                    td.style.fontWeight = '500';
                } else {
                    td.textContent = isNaN(value) ? value : parseInt(value).toLocaleString();
                    td.style.textAlign = 'center';
                }
                
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        
        container.innerHTML = '';
        container.appendChild(table);
    }



    createCambiosMensualTable(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || !data || data.length === 0) return;

        const cambios = this.calculateCambiosPorcentualesMensuales(data);
        const periodos = data.map(row => row.Periodo);
        
        const table = document.createElement('table');
        table.className = 'data-table';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['Delito', ...periodos];
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        cambios.forEach((row, index) => {
            const tr = document.createElement('tr');
            
            headers.forEach((header, colIndex) => {
                const td = document.createElement('td');
                
                if (colIndex === 0) {
                    td.textContent = row.Delito;
                    td.style.textAlign = 'left';
                    td.style.fontWeight = '500';
                } else {
                    const value = row[header];
                    td.textContent = value ? value.toFixed(1) + '%' : '0.0%';
                    td.style.textAlign = 'center';
                    
                    if (value > 0) {
                        td.style.color = '#e74c3c';
                    } else if (value < 0) {
                        td.style.color = '#27ae60';
                    }
                }
                
                tr.appendChild(td);
            });
            
            if (index === cambios.length - 1) {
                tr.style.backgroundColor = '#34495e';
                tr.style.color = 'white';
                tr.style.fontWeight = 'bold';
                const cells = tr.querySelectorAll('td');
                cells.forEach((cell, cellIndex) => {
                    if (cellIndex > 0) {
                        const value = parseFloat(cell.textContent);
                        if (value > 0) {
                            cell.style.color = '#ff6b6b';
                        } else if (value < 0) {
                            cell.style.color = '#51cf66';
                        }
                    }
                });
            }
            
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        
        container.innerHTML = '';
        container.appendChild(table);
    }

    createEstatalTable(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || !data || data.length === 0) return;

        console.log('🔍 DEBUG createEstatalTable:', {
            containerId,
            dataLength: data.length,
            sampleData: data.slice(0, 2),
            container: !!container
        });

        // Crear controles de ordenamiento
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'table-controls';
        controlsDiv.style.marginBottom = '15px';
        controlsDiv.style.padding = '10px';
        controlsDiv.style.backgroundColor = '#f8f9fa';
        controlsDiv.style.borderRadius = '5px';
        controlsDiv.style.border = '1px solid #dee2e6';

        const label = document.createElement('label');
        label.textContent = 'Ordenar por: ';
        label.style.fontWeight = 'bold';
        label.style.marginRight = '10px';

        const select = document.createElement('select');
        select.id = 'sort-select-' + containerId;
        select.style.padding = '5px 10px';
        select.style.borderRadius = '3px';
        select.style.border = '1px solid #ccc';
        select.style.fontSize = '14px';

        // Opciones de ordenamiento
        const sortOptions = [
            { value: 'Total', text: 'Violencia homicida total' },
            { value: 'Homicidio doloso', text: 'Homicidios dolosos' },
            { value: 'Homicidio culposo', text: 'Homicidios culposos' },
            { value: 'Feminicidio', text: 'Feminicidios' },
            { value: 'Otros delitos que atentan contra la vida y la integridad corporal', text: 'Otros delitos contra la vida' }
        ];

        sortOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            if (option.value === 'Total') {
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        });

        controlsDiv.appendChild(label);
        controlsDiv.appendChild(select);

        // Función para renderizar la tabla
        const renderTable = (sortBy = 'Total') => {
            console.log('🔍 DEBUG renderTable:', { sortBy, dataLength: data.length });
            
            // Calcular datos nacionales
            const nacionalData = this.calculateNationalAbsolute();
            console.log('🔍 DEBUG nacionalData:', nacionalData);
            
            // Ordenar datos estatales
            const sortedData = [...data].sort((a, b) => {
                const valueA = parseInt(a[sortBy]) || 0;
                const valueB = parseInt(b[sortBy]) || 0;
                return valueB - valueA; // Orden descendente
            });
            
            // Combinar: Nacional primero, luego estados
            const finalData = [nacionalData, ...sortedData];
            console.log('🔍 DEBUG finalData sample:', finalData.slice(0, 3));

            const table = document.createElement('table');
            table.className = 'data-table';
            
            // Orden específico de columnas para la tabla estatal
            const orderedHeaders = ['Estado', 'Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos que atentan contra la vida y la integridad corporal', 'Total'];
            
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            // Agregar columna de ranking
            const rankTh = document.createElement('th');
            rankTh.textContent = '#';
            rankTh.style.width = '40px';
            headerRow.appendChild(rankTh);
            
            orderedHeaders.forEach(header => {
                const th = document.createElement('th');
                let displayName = header;
                if (header === 'Otros delitos que atentan contra la vida y la integridad corporal') {
                    displayName = 'Otros delitos contra la vida';
                } else if (header === 'Total') {
                    displayName = 'Violencia homicida total';
                }
                
                th.textContent = displayName;
                
                // Destacar la columna por la que se está ordenando
                if (header === sortBy) {
                    th.style.backgroundColor = '#007bff';
                    th.style.color = 'white';
                    th.style.fontWeight = 'bold';
                }
                
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            const tbody = document.createElement('tbody');
            finalData.forEach((row, index) => {
                console.log('🔍 DEBUG procesando fila:', { index, row, estado: row.Estado });
                const tr = document.createElement('tr');
                
                // Estilo especial para fila nacional
                const isNacional = row.Estado === 'NACIONAL' || row.Entidad === 'NACIONAL';
                if (isNacional) {
                    tr.style.backgroundColor = '#e8f5e8';
                    tr.style.fontWeight = 'bold';
                    tr.style.borderTop = '2px solid #28a745';
                    tr.style.borderBottom = '2px solid #28a745';
                }
                
                // Columna de ranking
                const rankTd = document.createElement('td');
                rankTd.textContent = isNacional ? 'NAL' : index.toString();
                rankTd.style.textAlign = 'center';
                rankTd.style.fontWeight = 'bold';
                rankTd.style.backgroundColor = isNacional ? '#d4edda' : '#f8f9fa';
                tr.appendChild(rankTd);
                
                orderedHeaders.forEach((header, colIndex) => {
                    const td = document.createElement('td');
                    
                    if (colIndex === 0) { // Estado
                        const estadoValue = row[header] || row.Entidad;
                        console.log('🔍 DEBUG columna Estado:', { header, estadoValue, rowKeys: Object.keys(row) });
                        td.textContent = estadoValue || 'NACIONAL';
                        td.style.textAlign = 'left';
                        td.style.fontWeight = '500';
                    } else {
                        // Números con formato de miles
                        const value = parseInt(row[header]) || 0;
                        td.textContent = value.toLocaleString();
                        td.style.textAlign = 'center';
                        
                        // Destacar la columna por la que se está ordenando
                        if (header === sortBy) {
                            td.style.backgroundColor = '#e3f2fd';
                            td.style.fontWeight = 'bold';
                        }
                    }
                    
                    tr.appendChild(td);
                });
                
                // Destacar los primeros 5 estados
                if (index < 5) {
                    tr.style.backgroundColor = index < 3 ? '#fff3cd' : '#f8f9fa';
                }
                
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            
            return table;
        };

        // Event listener para cambio de ordenamiento
        select.addEventListener('change', (e) => {
            const sortBy = e.target.value;
            const existingTable = container.querySelector('table');
            if (existingTable) {
                existingTable.remove();
            }
            const newTable = renderTable(sortBy);
            container.insertBefore(newTable, container.querySelector('.source-note'));
            
            // Actualizar nota de fuente
            const sourceNote = container.querySelector('.source-note');
            const sortText = sortOptions.find(opt => opt.value === sortBy).text.toLowerCase();
            sourceNote.innerHTML = `<strong>Fuente:</strong> SESNSP. Datos de enero a julio de 2025. Estados ordenados por ${sortText} de mayor a menor.`;
        });

        // Agregar nota de fuente
        const sourceNote = document.createElement('p');
        sourceNote.className = 'source-note';
        sourceNote.style.fontSize = '12px';
        sourceNote.style.fontStyle = 'italic';
        sourceNote.style.marginTop = '10px';
        sourceNote.style.color = '#666';
        sourceNote.innerHTML = '<strong>Fuente:</strong> SESNSP. Datos de enero a julio de 2025. Estados ordenados por violencia homicida total de mayor a menor.';
        
        // Renderizar tabla inicial
        const initialTable = renderTable('Total');
        
        container.innerHTML = '';
        container.appendChild(controlsDiv);
        container.appendChild(initialTable);
        container.appendChild(sourceNote);
    }

    createSimpleTable(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || !data || data.length === 0) return;

        const table = document.createElement('table');
        table.className = 'data-table';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = Object.keys(data[0]);
        
        headers.forEach(header => {
            const th = document.createElement('th');
            let displayName = header;
            if (header === 'Otros delitos que atentan contra la vida y la integridad corporal') {
                displayName = 'Otros delitos contra la vida';
            }
            th.textContent = displayName;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        data.forEach((row, index) => {
            const tr = document.createElement('tr');
            headers.forEach((header, colIndex) => {
                const td = document.createElement('td');
                const value = row[header];
                
                if (colIndex === 0 || header === 'Delito' || header === 'Periodo' || header === 'Mes') {
                    td.textContent = value;
                    if (colIndex === 0) {
                        td.style.textAlign = 'left';
                        td.style.fontWeight = '500';
                    }
                } else {
                    td.textContent = isNaN(value) ? value : parseInt(value).toLocaleString();
                    td.style.textAlign = 'center';
                }
                
                tr.appendChild(td);
            });
            
            if ((containerId.includes('homicida') || containerId.includes('sinaloa')) && 
                !containerId.includes('mensual') && 
                index === data.length - 1) {
                tr.style.backgroundColor = '#34495e';
                tr.style.color = 'white';
                tr.style.fontWeight = 'bold';
            }
            
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        
        container.innerHTML = '';
        container.appendChild(table);
    }

    createCambiosTable(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || !data || data.length === 0) return;

        const cambios = this.calculateCambiosPorcentuales(data);
        
        const table = document.createElement('table');
        table.className = 'data-table';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['Delito', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        cambios.forEach((row, index) => {
            const tr = document.createElement('tr');
            
            headers.forEach((header, colIndex) => {
                const td = document.createElement('td');
                
                if (colIndex === 0) {
                    td.textContent = row.Delito;
                    td.style.textAlign = 'left';
                    td.style.fontWeight = '500';
                } else {
                    const value = row[header];
                    td.textContent = value ? value.toFixed(1) + '%' : '0.0%';
                    td.style.textAlign = 'center';
                    
                    if (value > 0) {
                        td.style.color = '#e74c3c';
                    } else if (value < 0) {
                        td.style.color = '#27ae60';
                    }
                }
                
                tr.appendChild(td);
            });
            
            if (index === cambios.length - 1) {
                tr.style.backgroundColor = '#34495e';
                tr.style.color = 'white';
                tr.style.fontWeight = 'bold';
                const cells = tr.querySelectorAll('td');
                cells.forEach((cell, cellIndex) => {
                    if (cellIndex > 0) {
                        const value = parseFloat(cell.textContent);
                        if (value > 0) {
                            cell.style.color = '#ff6b6b';
                        } else if (value < 0) {
                            cell.style.color = '#51cf66';
                        }
                    }
                });
            }
            
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        
        container.innerHTML = '';
        container.appendChild(table);
    }

    // Análisis de contribución al cambio 2024-2025
    generateAnalisisContribucion() {
        const delitos = ['Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos que atentan contra la vida y la integridad corporal'];
        const contribuciones = [];
        
        let total2024 = 0;
        let total2025 = 0;
        
        // Calcular contribuciones por delito usando valores absolutos
        delitos.forEach(delito => {
            const delitoRow = this.violenciaHomicidaData.find(row => row.Delito === delito);
            if (delitoRow) {
                const valor2024 = parseInt(delitoRow['2024']) || 0;
                const valor2025 = parseInt(delitoRow['2025']) || 0;
                const cambioAbsoluto = valor2025 - valor2024;
                const cambioRelativo = valor2024 > 0 ? ((valor2025 - valor2024) / valor2024 * 100) : 0;
                
                total2024 += valor2024;
                total2025 += valor2025;
                
                contribuciones.push({
                    delito: delito === 'Otros delitos que atentan contra la vida y la integridad corporal' ? 'Otros delitos contra la vida' : delito,
                    valor2024: valor2024,
                    valor2025: valor2025,
                    cambioAbsoluto: cambioAbsoluto,
                    cambioRelativo: cambioRelativo
                });
            }
        });
        
        // Calcular totales
        const cambioTotalAbsoluto = total2025 - total2024;
        const cambioTotalRelativo = total2024 > 0 ? ((total2025 - total2024) / total2024 * 100) : 0;
        
        // Calcular peso de cada contribución
        contribuciones.forEach(item => {
            item.pesoContribucion = cambioTotalAbsoluto !== 0 ? (item.cambioAbsoluto / cambioTotalAbsoluto * 100) : 0;
        });
        
        // Generar tabla de contribución
        this.generateContribucionTable(contribuciones, {
            total2024: total2024,
            total2025: total2025,
            cambioAbsoluto: cambioTotalAbsoluto,
            cambioRelativo: cambioTotalRelativo
        });
    }
    
    generateContribucionTable(contribuciones, totales) {
        const container = document.getElementById('tabla-contribucion-cambio');
        if (!container) return;
        
        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['Tipo de delito', '2024', '2025', 'Cambio absoluto', 'Cambio relativo (%)', 'Peso contribución (%)'];
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.style.fontSize = '0.85rem';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Body
        const tbody = document.createElement('tbody');
        
        // Filas de delitos
        contribuciones.forEach(item => {
            const tr = document.createElement('tr');
            
            // Tipo de delito
            const tdDelito = document.createElement('td');
            tdDelito.textContent = item.delito;
            tdDelito.style.textAlign = 'left';
            tdDelito.style.fontWeight = '500';
            tr.appendChild(tdDelito);
            
            // 2024
            const td2024 = document.createElement('td');
            td2024.textContent = item.valor2024.toLocaleString();
            td2024.style.textAlign = 'center';
            tr.appendChild(td2024);
            
            // 2025
            const td2025 = document.createElement('td');
            td2025.textContent = item.valor2025.toLocaleString();
            td2025.style.textAlign = 'center';
            tr.appendChild(td2025);
            
            // Cambio absoluto
            const tdCambio = document.createElement('td');
            const cambioFormatted = new Intl.NumberFormat('es-MX', { 
                signDisplay: 'always' 
            }).format(item.cambioAbsoluto);
            tdCambio.textContent = cambioFormatted;
            tdCambio.style.textAlign = 'center';
            tdCambio.className = item.cambioAbsoluto >= 0 ? 'contribucion-positiva' : 'contribucion-negativa';
            tr.appendChild(tdCambio);
            
            // Cambio relativo
            const tdCambioRel = document.createElement('td');
            tdCambioRel.textContent = item.cambioRelativo.toFixed(1) + '%';
            tdCambioRel.style.textAlign = 'center';
            tdCambioRel.className = item.cambioRelativo >= 0 ? 'contribucion-positiva' : 'contribucion-negativa';
            tr.appendChild(tdCambioRel);
            
            // Peso de contribución
            const tdPeso = document.createElement('td');
            tdPeso.textContent = Math.abs(item.pesoContribucion).toFixed(1) + '%';
            tdPeso.style.textAlign = 'center';
            tdPeso.style.fontWeight = 'bold';
            tr.appendChild(tdPeso);
            
            tbody.appendChild(tr);
        });
        
        // Fila de totales
        const trTotal = document.createElement('tr');
        trTotal.className = 'fila-total-contribucion';
        
        const tdTotalLabel = document.createElement('td');
        tdTotalLabel.textContent = 'TOTAL';
        tdTotalLabel.style.textAlign = 'left';
        tdTotalLabel.style.fontWeight = 'bold';
        trTotal.appendChild(tdTotalLabel);
        
        const tdTotal2024 = document.createElement('td');
        tdTotal2024.textContent = totales.total2024.toLocaleString();
        tdTotal2024.style.textAlign = 'center';
        trTotal.appendChild(tdTotal2024);
        
        const tdTotal2025 = document.createElement('td');
        tdTotal2025.textContent = totales.total2025.toLocaleString();
        tdTotal2025.style.textAlign = 'center';
        trTotal.appendChild(tdTotal2025);
        
        const tdTotalCambio = document.createElement('td');
        const cambioFormatted = new Intl.NumberFormat('es-MX', { 
            signDisplay: 'always' 
        }).format(totales.cambioAbsoluto);
        tdTotalCambio.textContent = cambioFormatted;
        tdTotalCambio.style.textAlign = 'center';
        trTotal.appendChild(tdTotalCambio);
        
        const tdTotalCambioRel = document.createElement('td');
        tdTotalCambioRel.textContent = totales.cambioRelativo.toFixed(1) + '%';
        tdTotalCambioRel.style.textAlign = 'center';
        trTotal.appendChild(tdTotalCambioRel);
        
        const tdTotalPeso = document.createElement('td');
        tdTotalPeso.textContent = '100.0%';
        tdTotalPeso.style.textAlign = 'center';
        trTotal.appendChild(tdTotalPeso);
        
        tbody.appendChild(trTotal);
        table.appendChild(tbody);
        
        container.innerHTML = '';
        container.appendChild(table);
    }



    abbreviateMunicipalName(municipio, entidad) {
        // Abreviar nombres muy largos de municipios
        const abbreviations = {
            'Acapulco de Juárez': 'Acapulco',
            'Benito Juárez': 'B. Juárez',
            'San Pedro Tlaquepaque': 'Tlaquepaque',
            'Tlajomulco de Zúñiga': 'Tlajomulco',
            'Iztapalapa': 'Iztapalapa',
            'Guadalupe': 'Guadalupe'
        };
        
        // Si el municipio tiene abreviación específica, usarla
        if (abbreviations[municipio]) {
            return abbreviations[municipio];
        }
        
        // Si es muy largo, truncar y agregar estado
        if (municipio.length > 12) {
            const stateAbbr = this.getStateAbbreviation(entidad);
            return `${municipio.substring(0, 8)}... (${stateAbbr})`;
        }
        
        // Para municipios de Sinaloa, solo mostrar el nombre
        if (entidad === 'Sinaloa') {
            return municipio;
        }
        
        // Para otros, agregar abreviación del estado si hay espacio
        const stateAbbr = this.getStateAbbreviation(entidad);
        if (municipio.length + stateAbbr.length < 15) {
            return `${municipio} (${stateAbbr})`;
        }
        
        return municipio;
    }

    getStateAbbreviation(entidad) {
        const abbreviations = {
            'Aguascalientes': 'AGS',
            'Baja California': 'BC',
            'Baja California Sur': 'BCS',
            'Campeche': 'CAM',
            'Coahuila de Zaragoza': 'COAH',
            'Colima': 'COL',
            'Chiapas': 'CHIS',
            'Chihuahua': 'CHIH',
            'Ciudad de México': 'CDMX',
            'Durango': 'DGO',
            'Guanajuato': 'GTO',
            'Guerrero': 'GRO',
            'Hidalgo': 'HGO',
            'Jalisco': 'JAL',
            'México': 'MEX',
            'Michoacán de Ocampo': 'MICH',
            'Morelos': 'MOR',
            'Nayarit': 'NAY',
            'Nuevo León': 'NL',
            'Oaxaca': 'OAX',
            'Puebla': 'PUE',
            'Querétaro': 'QRO',
            'Quintana Roo': 'QROO',
            'San Luis Potosí': 'SLP',
            'Sinaloa': 'SIN',
            'Sonora': 'SON',
            'Tabasco': 'TAB',
            'Tamaulipas': 'TAMP',
            'Tlaxcala': 'TLAX',
            'Veracruz de Ignacio de la Llave': 'VER',
            'Yucatán': 'YUC',
            'Zacatecas': 'ZAC'
        };
        
        return abbreviations[entidad] || entidad.substring(0, 4).toUpperCase();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Inicializando reporte SESNSP...');
    const report = new SESNSPReport();
    await report.init();
    
            // Inicializar análisis de guerra en Sinaloa
        if (window.SinaloaWarAnalysis) {
            const warAnalysis = new window.SinaloaWarAnalysis();
            warAnalysis.init();
        }
        
        // Inicializar análisis específico de Mocorito
        if (window.MocoritoAnalysis) {
            const mocoritoAnalysis = new window.MocoritoAnalysis();
            mocoritoAnalysis.init();
        }
});