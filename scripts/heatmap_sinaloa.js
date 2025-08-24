// Mapa de calor simple para violencia homicida total en Sinaloa

class SinaloaHeatMap {
    constructor() {
        this.map = null;
        this.municipalData = null;
        this.geojsonLayer = null;
        this.circleLayer = null;
        this.globalMaxValue = 0;
        this.globalMinValue = 0;
        this.viewAdjusted = false;
        this.periods = [
            'Enero 2024', 'Febrero 2024', 'Marzo 2024', 'Abril 2024', 'Mayo 2024', 'Junio 2024', 'Julio 2024',
            'Agosto 2024', 'Septiembre 2024', 'Octubre 2024', 'Noviembre 2024', 'Diciembre 2024',
            'Enero 2025', 'Febrero 2025', 'Marzo 2025', 'Abril 2025', 'Mayo 2025', 'Junio 2025', 'Julio 2025'
        ];
        this.geojsonData = null;
    }

    async init() {
        console.log('Inicializando mapa de calor de Sinaloa...');
        
        try {
            await this.loadMunicipalData();
            await this.loadGeoJSON();
            this.calculateGlobalMaximum();
            this.initializeMap();
            this.initializeControls();
            this.updateHeatMap();
        } catch (error) {
            console.error('Error inicializando mapa de calor:', error);
        }
    }

    async loadMunicipalData() {
        console.log('📊 Cargando datos municipales...');
        
        try {
            const response = await fetch('data/violencia_homicida_sinaloa_municipal_2024_2025.csv');
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            console.log('📄 CSV text length:', text.length);
            console.log('📄 CSV preview:', text.substring(0, 200) + '...');
            
            this.municipalData = this.parseCSV(text);
            
            // Exponer datos globalmente para otros scripts
            window.heatmapData = this.municipalData;
            console.log('🌐 Datos expuestos globalmente como window.heatmapData');
            
            console.log(`✅ Datos municipales cargados: ${this.municipalData.length} registros`);
            
            if (this.municipalData.length > 0) {
                console.log('📋 Sample data:', this.municipalData.slice(0, 3));
                
                const enero2024 = this.municipalData.filter(row => row.Periodo === 'Enero 2024');
                console.log(`📅 Datos enero 2024: ${enero2024.length} municipios`);
                
                // Verificar que tenemos todos los períodos
                const uniquePeriods = [...new Set(this.municipalData.map(row => row.Periodo))];
                console.log('📅 Períodos únicos encontrados:', uniquePeriods);
            }
            
        } catch (error) {
            console.error('❌ Error cargando datos municipales:', error);
            throw error; // Re-lanzar para que se maneje en init()
        }
    }

    parseCSV(text) {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            const values = lines[i].split(',');
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index] ? values[index].trim() : '';
            });
            
            data.push(row);
        }
        
        return data;
    }

    calculateGlobalMaximum() {
        const allTotalValues = this.municipalData.map(row => parseFloat(row.Total) || 0);
        this.globalMaxValue = Math.max(...allTotalValues);
        this.globalMinValue = Math.min(...allTotalValues.filter(v => v > 0));
        
        console.log(`Máximo global de todo el período: ${this.globalMaxValue} casos`);
        console.log(`Mínimo global de todo el período: ${this.globalMinValue} casos`);
        
        const sortedData = [...this.municipalData].sort((a, b) => (parseFloat(b.Total) || 0) - (parseFloat(a.Total) || 0));
        console.log('Top 5 casos más altos de todo el período:');
        sortedData.slice(0, 5).forEach((row, index) => {
            console.log(`  ${index + 1}. ${row.Municipio} - ${row.Periodo}: ${row.Total} casos`);
        });
    }

    async loadGeoJSON() {
        console.log('Cargando GeoJSON de municipios...');
        
        try {
            console.log('Intentando cargar GeoJSON...');
            const response = await fetch('data/sinaloa_municipios_wgs84_simplified.geojson');
            console.log('Response status:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.geojsonData = await response.json();
            console.log(`✅ GeoJSON cargado: ${this.geojsonData.features.length} municipios`);
            
            // Mostrar municipios del nuevo shapefile
            console.log('Municipios en el nuevo GeoJSON:');
            this.geojsonData.features.forEach((feature, index) => {
                const bounds = L.geoJSON(feature).getBounds();
                const center = bounds.getCenter();
                console.log(`${index + 1}. ${feature.properties.NOMGEO}: [${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}]`);
            });
            
        } catch (error) {
            console.error('Error cargando GeoJSON:', error);
        }
    }

    initializeMap() {
        const mapElement = document.getElementById('sinaloa-map');
        if (!mapElement) {
            console.error('Elemento del mapa no encontrado');
            return;
        }

        if (mapElement._leaflet_id) {
            mapElement._leaflet_id = null;
            mapElement.innerHTML = '';
        }

        this.map = L.map('sinaloa-map', {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false
        }).setView([25.0, -107.5], 7);

        console.log('Mapa inicializado sin mapa base - solo shapefile');
    }

    initializeControls() {
        const crimeSelector = document.getElementById('crime-type-selector');
        const timeSlider = document.getElementById('time-slider');
        const timeDisplay = document.getElementById('time-display');

        if (crimeSelector) {
            crimeSelector.addEventListener('change', () => this.updateHeatMap());
        }

        if (timeSlider && timeDisplay) {
            timeSlider.addEventListener('input', (e) => {
                const periodIndex = parseInt(e.target.value);
                timeDisplay.textContent = this.periods[periodIndex];
                this.updateHeatMap();
            });
        }

        console.log('Controles inicializados');
    }

    updateHeatMap() {
        if (!this.map || !this.municipalData || !this.geojsonData) {
            console.log('Mapa, datos o GeoJSON no disponibles para actualizar');
            return;
        }

        const periodIndex = parseInt(document.getElementById('time-slider')?.value || '0');
        const selectedPeriod = this.periods[periodIndex];

        console.log(`Actualizando mapa de calor para: ${selectedPeriod}`);

        const periodData = this.municipalData.filter(row => row.Periodo === selectedPeriod);
        console.log(`Datos encontrados para ${selectedPeriod}: ${periodData.length} municipios`);

        if (periodData.length === 0) {
            console.log('No hay datos para el período seleccionado');
            return;
        }

        const dataByMunicipality = {};
        periodData.forEach(row => {
            const municipio = row.Municipio.trim().toLowerCase();
            const total = parseFloat(row.Total) || 0;
            dataByMunicipality[municipio] = {
                value: total,
                data: row
            };
        });

        const values = Object.values(dataByMunicipality).map(item => item.value);
        const monthMaxValue = Math.max(...values);
        const monthMinValue = Math.min(...values.filter(v => v > 0));

        console.log(`Valores del mes ${selectedPeriod}: ${monthMinValue || 0} - ${monthMaxValue}`);
        console.log(`Usando máximo global para normalización: ${this.globalMaxValue}`);

        if (this.geojsonLayer) {
            this.map.removeLayer(this.geojsonLayer);
        }

        this.geojsonLayer = L.geoJSON(this.geojsonData, {
            style: (feature) => {
                const municipio = feature.properties.NOMGEO.trim().toLowerCase();
                const municipalData = dataByMunicipality[municipio];
                
                let fillColor = '#e8e8e8';
                let fillOpacity = 0.5;
                
                if (municipalData && municipalData.value > 0) {
                    const intensity = this.globalMaxValue > 0 ? municipalData.value / this.globalMaxValue : 0;
                    fillColor = this.getHeatColor(intensity);
                    fillOpacity = 0.8;
                    
                    if (municipalData.value > 10) {
                        console.log(`${municipio}: ${municipalData.value} casos = ${(intensity * 100).toFixed(1)}% intensidad = ${fillColor}`);
                    }
                }

                return {
                    fillColor: fillColor,
                    weight: 2,
                    opacity: 1,
                    color: '#333333',
                    fillOpacity: fillOpacity
                };
            },
            onEachFeature: (feature, layer) => {
                const municipio = feature.properties.NOMGEO;
                const municipioKey = municipio.trim().toLowerCase();
                const municipalData = dataByMunicipality[municipioKey];

                let popupContent = `
                    <div style="font-family: Arial, sans-serif;">
                        <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${municipio}</h4>
                        <p style="margin: 5px 0;"><strong>Período:</strong> ${selectedPeriod}</p>
                `;

                if (municipalData) {
                    const data = municipalData.data;
                    const globalIntensity = this.globalMaxValue > 0 ? municipalData.value / this.globalMaxValue : 0;
                    const monthIntensity = monthMaxValue > 0 ? municipalData.value / monthMaxValue : 0;
                    popupContent += `
                        <hr style="margin: 10px 0;">
                        <p style="margin: 5px 0; color: #e74c3c; font-size: 16px;"><strong>Violencia homicida total: ${municipalData.value}</strong></p>
                        <p style="margin: 5px 0; font-size: 12px; color: #666;">Del mes: ${(monthIntensity * 100).toFixed(1)}% (máx: ${monthMaxValue})</p>
                        <p style="margin: 5px 0; font-size: 12px; color: #666;">Global: ${(globalIntensity * 100).toFixed(1)}% (máx: ${this.globalMaxValue})</p>
                        <hr style="margin: 10px 0;">
                        <div style="font-size: 12px; color: #666;">
                            <p style="margin: 2px 0;">• Homicidio doloso: ${data['Homicidio doloso'] || 0}</p>
                            <p style="margin: 2px 0;">• Homicidio culposo: ${data['Homicidio culposo'] || 0}</p>
                            <p style="margin: 2px 0;">• Feminicidio: ${data['Feminicidio'] || 0}</p>
                            <p style="margin: 2px 0;">• Otros delitos: ${data['Otros delitos que atentan contra la vida y la integridad corporal'] || 0}</p>
                        </div>
                    `;
                } else {
                    popupContent += `<p style="margin: 5px 0; color: #666;">Sin datos para este período</p>`;
                }

                popupContent += '</div>';
                layer.bindPopup(popupContent);

                layer.on({
                    mouseover: (e) => {
                        const layer = e.target;
                        layer.setStyle({
                            weight: 4,
                            color: '#333',
                            fillOpacity: 0.9
                        });
                        layer.bringToFront();
                    },
                    mouseout: (e) => {
                        this.geojsonLayer.resetStyle(e.target);
                    }
                });
            }
        }).addTo(this.map);

        // Ajustar vista una sola vez al cargar
        if (!this.viewAdjusted) {
            this.map.fitBounds(this.geojsonLayer.getBounds(), {padding: [10, 10]});
            this.viewAdjusted = true;
            console.log('Vista ajustada a los límites de Sinaloa');
        }

        // Agregar círculos para el delito específico
        this.addCrimeCircles(periodData, selectedPeriod);
        
        // Actualizar tabla
        this.updateMunicipalTable(periodData, selectedPeriod);

        console.log('Mapa de calor actualizado');
    }

    getHeatColor(intensity) {
        if (intensity >= 0.9) return '#800026';
        if (intensity >= 0.7) return '#BD0026';
        if (intensity >= 0.5) return '#E31A1C';
        if (intensity >= 0.3) return '#FC4E2A';
        if (intensity >= 0.15) return '#FD8D3C';
        if (intensity >= 0.05) return '#FEB24C';
        if (intensity > 0) return '#FFEDA0';
        return '#e8e8e8';
    }

    addCrimeCircles(periodData, selectedPeriod) {
        const crimeType = document.getElementById('crime-type-selector')?.value || 'Homicidio doloso';
        
        // Remover círculos anteriores
        if (this.circleLayer) {
            this.map.removeLayer(this.circleLayer);
            console.log('Círculos anteriores removidos');
        }

        // Coordenadas de municipios
        const coords = this.getMunicipalCoordinates();

        // Calcular valores para el delito específico del período
        const crimeValues = periodData.map(row => parseFloat(row[crimeType]) || 0);
        const maxCrime = Math.max(...crimeValues);
        const minCrime = Math.min(...crimeValues.filter(v => v > 0));
        
        // Para los círculos, usar el máximo global para mostrar diferencias reales entre períodos
        const globalCrimeValues = this.municipalData.map(row => parseFloat(row[crimeType]) || 0);
        const globalMaxCrime = Math.max(...globalCrimeValues);
        const globalMinCrime = Math.min(...globalCrimeValues.filter(v => v > 0));

        console.log(`\n=== CÍRCULOS PARA ${selectedPeriod} - ${crimeType} ===`);
        console.log(`Rango de valores del período: ${minCrime || 0} - ${maxCrime}`);
        console.log(`Rango global para círculos: ${globalMinCrime || 0} - ${globalMaxCrime}`);
        
        // Mostrar todos los valores para debug
        periodData.forEach(row => {
            const value = parseFloat(row[crimeType]) || 0;
            if (value > 0) {
                console.log(`${row.Municipio}: ${value} casos de ${crimeType}`);
            }
        });

        // Crear grupo de círculos
        this.circleLayer = L.layerGroup();
        let circlesCreated = 0;
        let culiacanCircles = 0;

        periodData.forEach(row => {
            const municipio = row.Municipio;
            const municipioCoords = coords[municipio];
            const crimeValue = parseFloat(row[crimeType]) || 0;
            
            // Debug específico para Culiacán
            if (municipio.toLowerCase().includes('culiac')) {
                console.log(`🔍 DEBUG CULIACÁN - ${selectedPeriod}:`);
                console.log(`  Nombre exacto: "${municipio}"`);
                console.log(`  Coordenadas encontradas: ${municipioCoords ? 'SÍ' : 'NO'}`);
                console.log(`  Valor ${crimeType}: ${row[crimeType]}`);
                console.log(`  Valor parseado: ${crimeValue}`);
                console.log(`  Max del período: ${maxCrime}`);
                console.log(`  Min del período: ${minCrime}`);
                console.log(`  Max global: ${globalMaxCrime}`);
                console.log(`  Min global: ${globalMinCrime}`);
            }
            
            if (!municipioCoords) {
                console.log(`❌ Sin coordenadas para: "${municipio}"`);
                return;
            }
            
            if (crimeValue > 0) {
                // Calcular tamaño del círculo de forma más directa y visible
                const minSize = 8;   // Tamaño mínimo visible
                const maxSize = 35;  // Tamaño máximo
                let circleSize;
                
                if (globalMaxCrime <= 1) {
                    // Para valores muy pequeños, tamaño fijo
                    circleSize = minSize + 2;
                } else if (globalMaxCrime === globalMinCrime) {
                    // Si todos tienen el mismo valor
                    circleSize = minSize + 8;
                } else {
                    // Escala lineal usando valores globales para mostrar diferencias reales
                    const globalRatio = (crimeValue - (globalMinCrime || 0)) / (globalMaxCrime - (globalMinCrime || 0));
                    circleSize = minSize + (globalRatio * (maxSize - minSize));
                }
                
                // Asegurar tamaño mínimo
                circleSize = Math.max(circleSize, minSize);

                // Crear círculo con ID único
                const circle = L.circleMarker(municipioCoords, {
                    radius: circleSize,
                    fillColor: '#e74c3c',
                    color: '#ffffff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                });
                
                // Agregar ID para debug
                circle._municipio = municipio;
                circle._periodo = selectedPeriod;
                circle._valor = crimeValue;

                // Calcular ratios para el popup
                const monthRatio = maxCrime > minCrime ? (crimeValue - (minCrime || 0)) / (maxCrime - (minCrime || 0)) : 0;
                const globalRatio = globalMaxCrime > globalMinCrime ? (crimeValue - (globalMinCrime || 0)) / (globalMaxCrime - (globalMinCrime || 0)) : 0;
                
                // Popup para el círculo
                const popupContent = `
                    <div style="font-family: Arial, sans-serif;">
                        <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${municipio}</h4>
                        <p style="margin: 5px 0;"><strong>Período:</strong> ${selectedPeriod}</p>
                        <hr style="margin: 10px 0;">
                        <p style="margin: 5px 0; color: #e74c3c; font-size: 16px;"><strong>${crimeType}: ${crimeValue}</strong></p>
                        <p style="margin: 5px 0; font-size: 12px; color: #666;">Del mes: ${(monthRatio * 100).toFixed(1)}% (máx: ${maxCrime})</p>
                        <p style="margin: 5px 0; font-size: 12px; color: #666;">Global: ${(globalRatio * 100).toFixed(1)}% (máx: ${globalMaxCrime})</p>
                        <p style="margin: 5px 0;">Violencia homicida total: ${row.Total}</p>
                    </div>
                `;

                circle.bindPopup(popupContent);
                this.circleLayer.addLayer(circle);
                circlesCreated++;
                
                if (municipio.toLowerCase().includes('culiac')) {
                    culiacanCircles++;
                }
                
                // Debug extra para Culiacán
                if (municipio.toLowerCase().includes('culiac')) {
                    console.log(`🎯 CÍRCULO CULIACÁN:`);
                    console.log(`  Valor: ${crimeValue}`);
                    console.log(`  Tamaño calculado: ${circleSize.toFixed(1)}px`);
                    console.log(`  Ratio mensual: ${(monthRatio * 100).toFixed(1)}%`);
                    console.log(`  Ratio global: ${(globalRatio * 100).toFixed(1)}%`);
                    console.log(`  Coordenadas: [${municipioCoords[0]}, ${municipioCoords[1]}]`);
                }
                
                console.log(`${municipio}: ${crimeValue} casos → ${circleSize.toFixed(1)}px (global: ${(globalRatio * 100).toFixed(1)}%)`);
            }
        });

        this.circleLayer.addTo(this.map);
        console.log(`✅ Total círculos creados: ${circlesCreated}`);
        console.log(`🎯 Círculos de Culiacán: ${culiacanCircles}`);
    }

    getMunicipalCoordinates() {
        // Coordenadas oficiales del Marco Geoestadístico INEGI 2022 (20 municipios)
        return {
            'Ahome': [25.9353, -109.1622],
            'Angostura': [25.1460, -108.1417],
            'Badiraguato': [25.5909, -107.3960],
            'Choix': [26.6803, -108.2770],
            'Concordia': [23.4142, -105.9918],
            'Cosalá': [24.4815, -106.7994],
            'Culiacán': [24.6812, -107.2529],
            'El Fuerte': [26.2620, -108.6784],
            'Eldorado': [24.3543, -107.4047],
            'Elota': [24.0434, -106.8421],
            'Escuinapa': [22.7240, -105.6859],
            'Guasave': [25.5181, -108.5491],
            'Juan José Ríos': [25.6897, -108.8555],
            'Mazatlán': [23.4683, -106.3060],
            'Mocorito': [25.3599, -107.7796],
            'Navolato': [24.7232, -107.7648],
            'Rosario': [23.0562, -105.8054],
            'Salvador Alvarado': [25.4185, -108.0760],
            'San Ignacio': [23.9545, -106.3702],
            'Sinaloa': [25.9691, -108.1088]
        };
    }

    updateMunicipalTable(data, selectedPeriod) {
        const container = document.getElementById('tabla-municipal-sinaloa');
        const subtitle = document.getElementById('municipal-table-subtitle');
        
        if (!container) return;

        const crimeType = document.getElementById('crime-type-selector')?.value || 'Homicidio doloso';

        if (subtitle) {
            subtitle.textContent = `Datos de ${selectedPeriod}`;
        }

        // Ordenar por el delito seleccionado
        const sortedData = [...data].sort((a, b) => (parseFloat(b[crimeType]) || 0) - (parseFloat(a[crimeType]) || 0));

        // Crear tabla
        const table = document.createElement('table');
        table.className = 'data-table';

        // Headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        ['#', 'Municipio', 'Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos', 'Total'].forEach(header => {
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

            // Datos
            ['Homicidio doloso', 'Homicidio culposo', 'Feminicidio', 'Otros delitos que atentan contra la vida y la integridad corporal', 'Total'].forEach(campo => {
                const td = document.createElement('td');
                const value = parseFloat(row[campo]) || 0;
                td.textContent = value.toString();
                td.style.textAlign = 'center';
                
                // Destacar la columna del delito seleccionado
                if (campo === crimeType) {
                    td.style.backgroundColor = '#fff3cd';
                    td.style.fontWeight = 'bold';
                }
                
                tr.appendChild(td);
            });

            // Destacar top 3
            if (index < 3) {
                tr.style.backgroundColor = '#f8f9fa';
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
        sourceNote.innerHTML = `<strong>Fuente:</strong> SESNSP. Datos municipales de Sinaloa para ${selectedPeriod}. Ordenado por ${crimeType}.`;

        container.innerHTML = '';
        container.appendChild(table);
        container.appendChild(sourceNote);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.sinaloaHeatMap = new SinaloaHeatMap();
        window.sinaloaHeatMap.init();
    }, 2000);
});

// Clase para manejar los snapshots de evolución temporal
class SinaloaSnapshots {
    constructor(heatmapInstance) {
        this.heatmap = heatmapInstance;
        this.snapshots = [];
        this.initializeControls();
    }

    initializeControls() {
        const crimeTypeSelect = document.getElementById('snapshot-crime-type');
        
        if (crimeTypeSelect) {
            // Generar snapshots iniciales
            this.generateSnapshots();
            
            // Regenerar cuando cambie el selector
            crimeTypeSelect.addEventListener('change', () => {
                this.generateSnapshots();
            });
        }
    }

    async generateSnapshots() {
        const crimeType = document.getElementById('snapshot-crime-type').value;
        const grid = document.getElementById('snapshots-grid');
        
        // Verificar que los datos estén disponibles
        if (!this.heatmap || !this.heatmap.municipalData || !this.heatmap.municipalData.length) {
            grid.innerHTML = '<div class="snapshot-loading" style="grid-column: 1 / -1; height: 200px;">Esperando datos...</div>';
            
            // Reintentar después de 1 segundo
            setTimeout(() => {
                this.generateSnapshots();
            }, 1000);
            return;
        }
        
        // Mostrar loading sin cambiar la altura del contenedor
        grid.innerHTML = '<div class="snapshot-loading" style="grid-column: 1 / -1; height: 200px;">Generando snapshots...</div>';
        
        try {
            // Obtener todos los períodos
            const periods = this.heatmap.periods;
            
            // Limpiar grid
            grid.innerHTML = '';
            
            // Calcular máximo global para este tipo de delito
            const globalCrimeValues = this.heatmap.municipalData.map(row => parseFloat(row[crimeType]) || 0);
            const globalMaxCrime = Math.max(...globalCrimeValues);
            
            // Generar snapshot para cada período
            for (const period of periods) {
                const snapshotElement = this.createSnapshot(period, crimeType, globalMaxCrime);
                grid.appendChild(snapshotElement);
            }
            
            // Generar tabla de datos correspondiente
            this.generateSnapshotsTable(crimeType);
            
            // Snapshots generados exitosamente
            
        } catch (error) {
            console.error('Error generando snapshots:', error);
            grid.innerHTML = '<div class="snapshot-loading" style="grid-column: 1 / -1; height: 200px;">Error generando snapshots: ' + error.message + '</div>';
        }
    }

    createSnapshot(period, crimeType, globalMaxCrime) {
        // Crear elemento contenedor
        const snapshotDiv = document.createElement('div');
        snapshotDiv.className = 'snapshot-item';
        
        // Header
        const header = document.createElement('div');
        header.className = 'snapshot-header';
        header.innerHTML = `<h4 class="snapshot-title">${period}</h4>`;
        
        // Contenedor del mapa
        const mapDiv = document.createElement('div');
        mapDiv.className = 'snapshot-map';
        const mapId = `snapshot-map-${period.replace(/\s+/g, '-').toLowerCase()}`;
        mapDiv.id = mapId;
        
        // Crear el mapa después de que el elemento esté en el DOM
        setTimeout(() => {
            this.createSnapshotMap(mapId, period, crimeType, globalMaxCrime);
        }, 100);
        
        // Ensamblar solo título y mapa (sin cajas ni estadísticas)
        snapshotDiv.appendChild(header);
        snapshotDiv.appendChild(mapDiv);
        
        return snapshotDiv;
    }

    createSnapshotMap(mapId, period, crimeType, globalMaxCrime) {
        // Verificar que el contenedor existe
        const mapContainer = document.getElementById(mapId);
        if (!mapContainer) {
            return;
        }
        
        // Filtrar datos del período
        const periodData = this.heatmap.municipalData.filter(row => row.Periodo === period);
        
        if (periodData.length === 0) {
            mapContainer.innerHTML = '<div class="snapshot-loading">Sin datos</div>';
            return;
        }
        
        // Limpiar contenedor antes de crear el mapa
        mapContainer.innerHTML = '';
        
        // Crear mapa pequeño con mejor zoom para ver todo el estado
        const map = L.map(mapId, {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false
        }).setView([25.0, -107.5], 5.8);
        
        // Crear heatmap de fondo
        this.createSnapshotHeatmap(map, periodData, crimeType, globalMaxCrime);
        
        // Crear círculos
        this.createSnapshotCircles(map, periodData, crimeType, globalMaxCrime);
    }

    createSnapshotHeatmap(map, periodData, crimeType, globalMaxCrime) {
        if (!this.heatmap.geojsonData) return;
        
        // Crear diccionario de datos por municipio (usando violencia total para el fondo)
        const dataByMunicipality = {};
        periodData.forEach(row => {
            const municipio = row.Municipio.trim().toLowerCase();
            const value = parseFloat(row.Total) || 0; // Usar violencia total para el heatmap
            dataByMunicipality[municipio] = {
                value: value,
                data: row
            };
        });
        
        // Crear capa GeoJSON
        const geojsonLayer = L.geoJSON(this.heatmap.geojsonData, {
            style: (feature) => {
                const municipio = feature.properties.NOMGEO.trim().toLowerCase();
                const municipalData = dataByMunicipality[municipio];
                
                let fillColor = '#e8e8e8';
                let fillOpacity = 0.5;
                
                if (municipalData && municipalData.value > 0) {
                    // Usar el máximo global de violencia total para normalizar
                    const globalMaxTotal = Math.max(...this.heatmap.municipalData.map(row => parseFloat(row.Total) || 0));
                    const intensity = globalMaxTotal > 0 ? municipalData.value / globalMaxTotal : 0;
                    fillColor = this.heatmap.getHeatColor(intensity);
                    fillOpacity = 0.8;
                }
                
                return {
                    fillColor: fillColor,
                    weight: 1,
                    opacity: 1,
                    color: '#333333',
                    fillOpacity: fillOpacity
                };
            }
        });
        
        geojsonLayer.addTo(map);
    }

    createSnapshotCircles(map, periodData, crimeType, globalMaxCrime) {
        const coords = this.heatmap.getMunicipalCoordinates();
        
        // Calcular valores globales para círculos
        const globalCrimeValues = this.heatmap.municipalData.map(row => parseFloat(row[crimeType]) || 0);
        const globalMinCrime = Math.min(...globalCrimeValues.filter(v => v > 0));
        
        periodData.forEach(row => {
            const municipio = row.Municipio;
            const municipioCoords = coords[municipio];
            const crimeValue = parseFloat(row[crimeType]) || 0;
            
            if (!municipioCoords || crimeValue <= 0) return;
            
            // Calcular tamaño del círculo - ajustado para zoom reducido
            const minSize = 4;
            const maxSize = 14;
            let circleSize;
            
            if (globalMaxCrime <= 1) {
                circleSize = minSize + 1;
            } else if (globalMaxCrime === globalMinCrime) {
                circleSize = minSize + 2;
            } else {
                const globalRatio = (crimeValue - (globalMinCrime || 0)) / (globalMaxCrime - (globalMinCrime || 0));
                circleSize = minSize + (globalRatio * (maxSize - minSize));
            }
            
            circleSize = Math.max(circleSize, minSize);
            
            // Crear círculo
            const circle = L.circleMarker(municipioCoords, {
                radius: circleSize,
                fillColor: '#e74c3c',
                color: '#ffffff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
            
            // Popup simple
            circle.bindPopup(`
                <div style="font-family: Arial, sans-serif; font-size: 10px;">
                    <strong>${municipio}</strong><br>
                    ${crimeType}: ${crimeValue}
                </div>
            `);
            
            circle.addTo(map);
        });
    }

    updateSnapshotStats(statsDiv, periodData, crimeType) {
        // Calcular estadísticas
        const values = periodData.map(row => parseFloat(row[crimeType]) || 0).filter(v => v > 0);
        const total = values.reduce((sum, val) => sum + val, 0);
        const max = Math.max(...values);
        const municipiosAfectados = values.length;
        
        // Encontrar municipio con más casos
        let maxMunicipio = '';
        let maxValue = 0;
        periodData.forEach(row => {
            const value = parseFloat(row[crimeType]) || 0;
            if (value > maxValue) {
                maxValue = value;
                maxMunicipio = row.Municipio;
            }
        });
        
        // Actualizar HTML
        statsDiv.innerHTML = `
            <div class="snapshot-stat">
                <span class="snapshot-stat-label">Total:</span>
                <span class="snapshot-stat-value">${total}</span>
            </div>
            <div class="snapshot-stat">
                <span class="snapshot-stat-label">Municipios:</span>
                <span class="snapshot-stat-value">${municipiosAfectados}</span>
            </div>
            <div class="snapshot-stat">
                <span class="snapshot-stat-label">Máximo:</span>
                <span class="snapshot-stat-value">${maxMunicipio} (${max})</span>
            </div>
        `;
    }

    generateSnapshotsTable(crimeType) {
        const tablesGrid = document.getElementById('snapshots-tables-grid');
        const subtitle = document.getElementById('snapshots-table-subtitle');
        
        if (!tablesGrid) return;
        
        // Actualizar subtítulo
        const crimeDisplayName = crimeType === 'Otros delitos que atentan contra la vida y la integridad corporal' 
            ? 'Otros delitos' 
            : crimeType;
        
        subtitle.textContent = `Ranking de municipios por ${crimeDisplayName}`;
        
        // Limpiar grid
        tablesGrid.innerHTML = '';
        
        // Obtener todos los períodos
        const periods = this.heatmap.periods;
        
        // Generar una tabla pequeña para cada período
        periods.forEach(period => {
            const periodData = this.heatmap.municipalData.filter(row => row.Periodo === period);
            
            // Filtrar y ordenar municipios con casos (Top 10)
            const municipiosConCasos = periodData
                .map(row => ({
                    municipio: row.Municipio,
                    valor: parseFloat(row[crimeType]) || 0
                }))
                .filter(item => item.valor > 0)
                .sort((a, b) => b.valor - a.valor)
                .slice(0, 10); // Top 10
            
            // Crear contenedor de tabla snapshot
            const tableContainer = document.createElement('div');
            tableContainer.className = 'ranking-table-container';
            
            // Título de la tabla
            const title = document.createElement('div');
            title.className = 'ranking-table-title';
            title.textContent = period;
            
            // Crear tabla pequeña
            const table = document.createElement('table');
            table.className = 'ranking-mini-table';
            
            // Header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            const rankHeader = document.createElement('th');
            rankHeader.textContent = '#';
            headerRow.appendChild(rankHeader);
            
            const municipioHeader = document.createElement('th');
            municipioHeader.textContent = 'Municipio';
            headerRow.appendChild(municipioHeader);
            
            const valorHeader = document.createElement('th');
            valorHeader.textContent = 'Casos';
            headerRow.appendChild(valorHeader);
            
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Body
            const tbody = document.createElement('tbody');
            
            if (municipiosConCasos.length === 0) {
                // Si no hay casos, mostrar mensaje
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 3;
                cell.textContent = 'Sin casos';
                cell.style.textAlign = 'center';
                cell.style.fontStyle = 'italic';
                cell.style.color = '#95a5a6';
                row.appendChild(cell);
                tbody.appendChild(row);
            } else {
                // Mostrar ranking
                municipiosConCasos.forEach((item, index) => {
                    const row = document.createElement('tr');
                    
                    // Ranking
                    const rankCell = document.createElement('td');
                    rankCell.className = 'rank-cell';
                    rankCell.textContent = index + 1;
                    row.appendChild(rankCell);
                    
                    // Municipio
                    const municipioCell = document.createElement('td');
                    municipioCell.className = 'state-cell';
                    municipioCell.textContent = item.municipio;
                    row.appendChild(municipioCell);
                    
                    // Valor
                    const valorCell = document.createElement('td');
                    valorCell.className = 'value-cell';
                    valorCell.textContent = item.valor;
                    row.appendChild(valorCell);
                    
                    tbody.appendChild(row);
                });
            }
            
            table.appendChild(tbody);
            
            // Ensamblar
            tableContainer.appendChild(title);
            tableContainer.appendChild(table);
            tablesGrid.appendChild(tableContainer);
        });
        
        console.log(`Snapshots de tablas generados: ${periods.length} períodos para ${crimeType}`);
    }
}

// Inicializar snapshots cuando el heatmap esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Función para inicializar snapshots cuando el heatmap esté listo
    function initializeSnapshots() {
        if (window.sinaloaHeatMap && window.sinaloaHeatMap.municipalData && window.sinaloaHeatMap.municipalData.length > 0) {
            window.sinaloaSnapshots = new SinaloaSnapshots(window.sinaloaHeatMap);
        } else {
            setTimeout(initializeSnapshots, 1000);
        }
    }
    
    // Iniciar después de un delay inicial
    setTimeout(initializeSnapshots, 1000);
});