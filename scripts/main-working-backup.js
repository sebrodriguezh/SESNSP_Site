// Script principal para el reporte SESNSP
class SESNSPReport {
    constructor() {
        this.violenciaHomicidaData = null;
        this.violenciaHomicidaMensualData = null;
        this.sinaloaAnualData = null;
        this.sinaloaMensualData = null;
    }

    async init() {
        try {
            console.log('Iniciando carga de datos...');
            await this.loadData();
            await this.generateReport();
            console.log('Reporte generado exitosamente');
        } catch (error) {
            console.error('Error:', error);
            document.body.innerHTML += `<div style="color: red; padding: 20px;">Error: ${error.message}</div>`;
        }
    }

    async loadData() {
        const response1 = await fetch('data/violencia_homicida_2019_2025.csv');
        const text1 = await response1.text();
        this.violenciaHomicidaData = this.parseCSV(text1);
        
        const response2 = await fetch('data/violencia_homicida_mensual_2024_2025.csv');
        const text2 = await response2.text();
        this.violenciaHomicidaMensualData = this.parseCSV(text2);
        
        const response3 = await fetch('data/violencia_homicida_sinaloa_2019_2025.csv');
        const text3 = await response3.text();
        this.sinaloaAnualData = this.parseCSV(text3);
        
        const response4 = await fetch('data/violencia_homicida_sinaloa_mensual_2024_2025.csv');
        const text4 = await response4.text();
        this.sinaloaMensualData = this.parseCSV(text4);
        
        console.log('Todos los datos cargados');
    }

    parseCSV(text) {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return row;
        });
    }

    async generateReport() {
        this.updateSummaryCards();
        this.generateCharts();
        this.generateTables();
    }

    updateSummaryCards() {
        const totalRow = this.violenciaHomicidaData[this.violenciaHomicidaData.length - 1];
        const totalViolencia = parseInt(totalRow.Total) || 0;
        
        const homicidiosRow = this.violenciaHomicidaData.find(row => row.Delito === 'Homicidio doloso');
        const totalHomicidios = parseInt(homicidiosRow?.Total) || 0;
        
        const feminicidiosRow = this.violenciaHomicidaData.find(row => row.Delito === 'Feminicidio');
        const totalFeminicidios = parseInt(feminicidiosRow?.Total) || 0;
        
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
        this.generateNacionalMensualChart();
        this.generateCambiosNacionalChart();
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
            new Chart(ctx, {
                type: 'bar',
                data: { labels: años, datasets: datasets },
                options: this.getChartOptions('Año')
            });
        }
    }

    generateNacionalMensualChart() {
        const periodos = this.violenciaHomicidaMensualData.map(row => row.Periodo);
        const totales = this.violenciaHomicidaMensualData.map(row => parseInt(row.Total));
        const delitos = ['Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos que atentan contra la vida y la integridad corporal'];
        
        const datasets = [];
        
        delitos.forEach((delito, index) => {
            const colors = ['#2ecc71', '#e74c3c', '#3498db', '#f39c12'];
            datasets.push({
                label: delito === 'Otros delitos que atentan contra la vida y la integridad corporal' ? 'Otros delitos contra la vida' : delito,
                data: this.violenciaHomicidaMensualData.map(row => parseInt(row[delito]) || 0),
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

        const ctx = document.getElementById('chart-violencia-mensual');
        if (ctx) {
            const options = this.getChartOptions('Período');
            options.scales.x.ticks = { maxRotation: 45, minRotation: 45 };
            
            new Chart(ctx, {
                type: 'bar',
                data: { labels: periodos, datasets: datasets },
                options: options
            });
        }
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
            new Chart(ctx, {
                type: 'bar',
                data: { labels: años, datasets: datasets },
                options: this.getChartOptions('Año')
            });
        }
    }

    generateSinaloaMensualChart() {
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
            const options = this.getChartOptions('Período');
            options.scales.x.ticks = { maxRotation: 45, minRotation: 45 };
            
            new Chart(ctx, {
                type: 'bar',
                data: { labels: periodos, datasets: datasets },
                options: options
            });
        }
    }

    calculateCambiosPorcentuales(data) {
        const años = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
        const añosCambios = [2020, 2021, 2022, 2023, 2024, 2025];
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

    generateCambiosNacionalChart() {
        const cambios = this.calculateCambiosPorcentuales(this.violenciaHomicidaData);
        const años = [2020, 2021, 2022, 2023, 2024, 2025];
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

        const ctx = document.getElementById('chart-cambios-nacional');
        if (ctx) {
            new Chart(ctx, {
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
        const años = [2020, 2021, 2022, 2023, 2024, 2025];
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

        const ctx = document.getElementById('chart-cambios-sinaloa');
        if (ctx) {
            new Chart(ctx, {
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

    generateTables() {
        // Generar análisis de contribución
        this.generateAnalisisContribucion();
        
        this.createSimpleTable('tabla-violencia-homicida', this.violenciaHomicidaData);
        this.createCambiosTable('tabla-cambios-nacional', this.violenciaHomicidaData);
        this.createSimpleTable('tabla-violencia-mensual', this.violenciaHomicidaMensualData);
        this.createSimpleTable('tabla-sinaloa', this.sinaloaAnualData);
        this.createCambiosTable('tabla-cambios-sinaloa', this.sinaloaAnualData);
        
        if (window.spilloverAnalysis) {
            window.spilloverAnalysis.init();
        }
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
        const headers = ['Delito', '2020', '2021', '2022', '2023', '2024', '2025'];
        
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
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Inicializando reporte SESNSP...');
    const report = new SESNSPReport();
    await report.init();
});    
// Análisis de contribución al cambio 2024-2025
    generateAnalisisContribucion() {
        const delitos = ['Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos que atentan contra la vida y la integridad corporal'];
        const contribuciones = [];
        
        let total2024 = 0;
        let total2025 = 0;
        
        // Calcular contribuciones por delito
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
        
        // Generar gráfica de contribución
        this.generateContribucionChart(contribuciones);
        
        // Generar tabla de contribución
        this.generateContribucionTable(contribuciones, {
            total2024: total2024,
            total2025: total2025,
            cambioAbsoluto: cambioTotalAbsoluto,
            cambioRelativo: cambioTotalRelativo
        });
    }
    
    generateContribucionChart(contribuciones) {
        const ctx = document.getElementById('chart-contribucion-cambio');
        if (!ctx) return;
        
        const labels = contribuciones.map(item => item.delito);
        const cambios = contribuciones.map(item => item.cambioAbsoluto);
        const colores = cambios.map(cambio => cambio >= 0 ? '#e74c3c' : '#27ae60');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cambio absoluto (casos)',
                    data: cambios,
                    backgroundColor: colores,
                    borderColor: colores,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // Barras horizontales
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.x;
                                const formatted = new Intl.NumberFormat('es-MX', { 
                                    signDisplay: 'always' 
                                }).format(value);
                                return `Cambio: ${formatted} casos`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cambio en número de casos'
                        },
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('es-MX', { 
                                    signDisplay: 'always' 
                                }).format(value);
                            }
                        },
                        grid: {
                            color: function(context) {
                                return context.tick.value === 0 ? '#000' : 'rgba(0,0,0,0.1)';
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Tipo de delito'
                        }
                    }
                }
            }
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
        const headers = ['Tipo de delito', '2024', '2025', 'Cambio', 'Cambio %', 'Peso'];
        
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
        const totalCambioFormatted = new Intl.NumberFormat('es-MX', { 
            signDisplay: 'always' 
        }).format(totales.cambioAbsoluto);
        tdTotalCambio.textContent = totalCambioFormatted;
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

do
cument.addEventListener('DOMContentLoaded', async () => {
    console.log('Inicializando reporte SESNSP...');
    const report = new SESNSPReport();
    await report.init();
});