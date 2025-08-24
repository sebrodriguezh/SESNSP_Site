class SinaloaWarAnalysis {
    constructor() {
        this.anomaliesData = null;
        this.municipios = ['Mocorito', 'Navolato', 'Culiacán', 'Badiraguato', 'Cosalá', 'Elota'];
    }

    async init() {
        console.log('Inicializando análisis del período de guerra en Sinaloa...');
        
        try {
            await this.loadAnomaliesData();
            this.generateMunicipalAnalysis();
            console.log('Análisis del período de guerra en Sinaloa inicializado');
        } catch (error) {
            console.error('Error inicializando análisis:', error);
        }
    }

    async loadAnomaliesData() {
        try {
            const response = await fetch('sinaloa_anomalies_table.csv');
            const csvText = await response.text();
            this.anomaliesData = this.parseCSV(csvText);
            
            // Filtrar solo municipios válidos (excluir headers y municipios sin datos)
            this.anomaliesData = this.anomaliesData.filter(row => 
                this.municipios.includes(row.Municipio) && 
                row.Municipio !== 'Municipio'
            );
            
            console.log('Datos de anomalías cargados:', {
                total: this.anomaliesData.length,
                sample: this.anomaliesData[0],
                municipios: [...new Set(this.anomaliesData.map(row => row.Municipio))]
            });
        } catch (error) {
            console.error('Error cargando datos de anomalías:', error);
            this.anomaliesData = [];
        }
    }

    parseCSV(text) {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const data = [];
        
        console.log('Headers del archivo de anomalías:', headers);
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            const values = this.parseCSVLine(lines[i]);
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index] ? values[index].replace(/"/g, '').trim() : '';
            });
            
            data.push(row);
        }
        
        return data;
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    generateMunicipalAnalysis() {
        // Obtener solo municipios que tienen datos
        const municipiosConDatos = [...new Set(this.anomaliesData.map(row => row.Municipio))];
        console.log('Municipios con datos:', municipiosConDatos);
        
        municipiosConDatos.forEach(municipio => {
            this.generateMunicipalSection(municipio);
        });
    }

    generateMunicipalSection(municipio) {
        const container = document.getElementById(`sinaloa-war-${municipio.toLowerCase()}-section`);
        if (!container) return;

        console.log(`Generando análisis para ${municipio}...`);

        // Filtrar datos del municipio
        const municipioAnomalies = this.anomaliesData.filter(row => row.Municipio === municipio);
        console.log(`Anomalías encontradas para ${municipio}:`, municipioAnomalies.length);

        // Generar contenido de la sección
        let sectionHTML = `
            <div class="municipal-analysis-section">
                <h3>Análisis Municipal: ${municipio}</h3>
        `;

        // Tabla 1: Anomalías significativas (>50%) - TOP 10 por incremento
        const significantAnomalies = municipioAnomalies
            .filter(row => parseFloat(row.Cambio_porcentual) > 50)
            .sort((a, b) => parseFloat(b.Cambio_porcentual) - parseFloat(a.Cambio_porcentual))
            .slice(0, 10);

        if (significantAnomalies.length > 0) {
            sectionHTML += `
                <div class="table-container">
                    <h4>Tabla ${municipio}.1. Top 10 Anomalías por Incremento Porcentual (>50%)</h4>
                    <p class="chart-subtitle">Delitos con mayor incremento relativo a partir de agosto-septiembre 2024</p>
                    ${this.generateAnomaliesTable(significantAnomalies)}
                </div>
            `;
        } else {
            sectionHTML += `
                <div class="table-container">
                    <h4>Tabla ${municipio}.1. Anomalías significativas detectadas</h4>
                    <p class="chart-subtitle">No se detectaron anomalías significativas (>50%) en este municipio</p>
                    <p class="no-data">No se encontraron anomalías con incremento superior al 50% en el período analizado.</p>
                </div>
            `;
        }

        // Tabla 2: Resumen estadístico - TODOS los delitos con datos
        sectionHTML += `
            <div class="table-container">
                <h4>Tabla ${municipio}.2. Resumen Completo de Delitos</h4>
                <p class="chart-subtitle">Todos los delitos reportados con comparación de períodos pre-guerra vs guerra</p>
                ${this.generateMunicipalSummaryTable(municipio, municipioAnomalies)}
            </div>
        `;

        sectionHTML += '</div>';
        container.innerHTML = sectionHTML;
    }

    generateAnomaliesTable(anomalies) {
        if (anomalies.length === 0) {
            return '<p class="no-data">No se detectaron anomalías significativas en este municipio</p>';
        }

        let tableHTML = `
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Subtipo de delito</th>
                            <th>Promedio antes (ene-ago 2024)</th>
                            <th>Promedio después (sep 2024-jun 2025)</th>
                            <th>Incremento (%)</th>
                            <th>Cambio absoluto</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        anomalies.forEach((row, index) => {
            const incremento = parseFloat(row.Cambio_porcentual);
            const antes = parseFloat(row.Promedio_antes_sept);
            const despues = parseFloat(row.Promedio_despues_sept);
            const cambioAbsoluto = parseFloat(row.Cambio_absoluto);

            tableHTML += `
                <tr>
                    <td class="rank-cell">${index + 1}</td>
                    <td class="crime-cell">${row.Subtipo_delito}</td>
                    <td class="value-cell">${antes.toFixed(1)}</td>
                    <td class="value-cell">${despues.toFixed(1)}</td>
                    <td class="change-cell ${incremento > 100 ? 'high-change' : 'moderate-change'}">
                        +${incremento.toFixed(1)}%
                    </td>
                    <td class="value-cell">+${cambioAbsoluto.toFixed(1)}</td>
                </tr>
            `;
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        return tableHTML;
    }

    generateMunicipalSummaryTable(municipio, municipioAnomalies) {
        if (municipioAnomalies.length === 0) {
            return '<p class="no-data">No hay datos de anomalías disponibles para este municipio</p>';
        }

        // Agrupar por subtipo de delito y ordenar por cambio porcentual
        const delitos = [...new Set(municipioAnomalies.map(row => row.Subtipo_delito))];
        
        let tableHTML = `
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Subtipo de delito</th>
                            <th>Período pre-guerra (ene-ago 2024)</th>
                            <th>Período guerra (sep 2024-jun 2025)</th>
                            <th>Cambio absoluto</th>
                            <th>Cambio relativo (%)</th>
                            <th>Casos antes</th>
                            <th>Casos después</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Ordenar delitos por cambio porcentual (mayor a menor)
        const delitosOrdenados = delitos.sort((a, b) => {
            const anomalyA = municipioAnomalies.find(row => row.Subtipo_delito === a);
            const anomalyB = municipioAnomalies.find(row => row.Subtipo_delito === b);
            return parseFloat(anomalyB.Cambio_porcentual) - parseFloat(anomalyA.Cambio_porcentual);
        });

        delitosOrdenados.forEach(delito => {
            const anomaly = municipioAnomalies.find(row => row.Subtipo_delito === delito);
            
            if (anomaly) {
                const antes = parseFloat(anomaly.Promedio_antes_sept);
                const despues = parseFloat(anomaly.Promedio_despues_sept);
                const cambioAbsoluto = parseFloat(anomaly.Cambio_absoluto);
                const cambioRelativo = parseFloat(anomaly.Cambio_porcentual);
                const casosAntes = parseInt(anomaly.Casos_antes_sept);
                const casosDespues = parseInt(anomaly.Casos_despues_sept);

                tableHTML += `
                    <tr>
                        <td class="crime-cell">${delito}</td>
                        <td class="value-cell">${antes.toFixed(1)}</td>
                        <td class="value-cell">${despues.toFixed(1)}</td>
                        <td class="change-cell ${cambioAbsoluto > 0 ? 'positive-change' : 'negative-change'}">
                            ${cambioAbsoluto > 0 ? '+' : ''}${cambioAbsoluto.toFixed(1)}
                        </td>
                        <td class="change-cell ${cambioRelativo > 0 ? 'positive-change' : 'negative-change'}">
                            +${cambioRelativo.toFixed(1)}%
                        </td>
                        <td class="value-cell">${casosAntes}</td>
                        <td class="value-cell">${casosDespues}</td>
                    </tr>
                `;
            }
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        return tableHTML;
    }
}

// Exportar para uso global
window.SinaloaWarAnalysis = SinaloaWarAnalysis;

