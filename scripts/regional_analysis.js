// Análisis Regional de Sinaloa

class SinaloaRegionalAnalysis {
    constructor() {
        this.municipalData = null;
        this.geojsonData = null;
        this.regionalMaps = {};
        
        // Definición de regiones
        this.regiones = {
            'Norte': ['Ahome', 'El Fuerte', 'Choix'],
            'Centro Norte': ['Angostura', 'Guasave', 'Mocorito', 'Salvador Alvarado', 'Sinaloa', 'Juan José Ríos'],
            'Centro': ['Badiraguato', 'Eldorado', 'Cosalá', 'Culiacán', 'Elota', 'Navolato'],
            'Sur': ['Concordia', 'Rosario', 'Escuinapa', 'Mazatlán', 'San Ignacio']
        };
        
        this.periods = [
            'Enero 2024', 'Febrero 2024', 'Marzo 2024', 'Abril 2024', 'Mayo 2024', 'Junio 2024', 'Julio 2024',
            'Agosto 2024', 'Septiembre 2024', 'Octubre 2024', 'Noviembre 2024', 'Diciembre 2024',
            'Enero 2025', 'Febrero 2025', 'Marzo 2025', 'Abril 2025', 'Mayo 2025', 'Junio 2025', 'Julio 2025'
        ];
    }

    async init() {
        console.log('Inicializando análisis regional de Sinaloa...');
        
        try {
            // Cargar datos independientemente si no están disponibles del heatmap principal
            if (window.sinaloaHeatMap && window.sinaloaHeatMap.municipalData && window.sinaloaHeatMap.geojsonData) {
                console.log('Usando datos del heatmap principal...');
                this.municipalData = window.sinaloaHeatMap.municipalData;
                this.geojsonData = window.sinaloaHeatMap.geojsonData;
            } else {
                console.log('Cargando datos independientemente...');
                await this.loadMunicipalData();
                await this.loadGeoJSON();
            }
            
            // Verificar que tenemos los datos necesarios
            if (!this.municipalData || !this.geojsonData) {
                console.log('Datos no disponibles, reintentando...');
                setTimeout(() => this.init(), 1000);
                return;
            }
            
            // Verificar que el contenedor regional existe
            const regionalContainer = document.getElementById('regional-snapshots-grid');
            if (!regionalContainer) {
                console.log('Contenedor regional no encontrado, esperando...');
                setTimeout(() => this.init(), 500);
                return;
            }
            
            this.initializeControls();
            this.generateRegionalMaps();
            this.generateRegionalEvolutionChart();
            this.generateRegionalTable();
            this.generateRegionalRankingSnapshots();
            
            console.log('Análisis regional inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando análisis regional:', error);
            // Reintentar después de un error
            setTimeout(() => this.init(), 2000);
        }
    }

    async loadMunicipalData() {
        console.log('📊 Cargando datos municipales para análisis regional...');
        
        try {
            const response = await fetch('data/violencia_homicida_sinaloa_municipal_2024_2025.csv');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            this.municipalData = this.parseCSV(text);
            
            console.log(`✅ Datos municipales cargados para análisis regional: ${this.municipalData.length} registros`);
            
        } catch (error) {
            console.error('❌ Error cargando datos municipales para análisis regional:', error);
            throw error;
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

    async loadGeoJSON() {
        console.log('🗺️ Cargando GeoJSON para análisis regional...');
        
        try {
            const response = await fetch('data/sinaloa_municipios_wgs84_simplified.geojson');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.geojsonData = await response.json();
            console.log(`✅ GeoJSON cargado para análisis regional: ${this.geojsonData.features.length} municipios`);
            
        } catch (error) {
            console.error('❌ Error cargando GeoJSON para análisis regional:', error);
            throw error;
        }
    }

    initializeControls() {
        const crimeTypeSelect = document.getElementById('regional-crime-type');
        const focusSelect = document.getElementById('regional-focus');
        
        // Evitar múltiples event listeners
        if (crimeTypeSelect && !crimeTypeSelect._regionalListenerAdded) {
            crimeTypeSelect._regionalListenerAdded = true;
            
            crimeTypeSelect.addEventListener('change', () => {
                console.log('Cambio en tipo de delito regional');
                this.generateRegionalMaps();
                this.generateRegionalEvolutionChart();
                this.generateRegionalTable();
                this.generateRegionalRankingSnapshots();
            });
        }
        
        if (focusSelect && !focusSelect._regionalListenerAdded) {
            focusSelect._regionalListenerAdded = true;
            
            focusSelect.addEventListener('change', () => {
                console.log('Cambio en enfoque regional');
                this.generateRegionalMaps();
            });
        }
        
        // Generar contenido inicial
        this.generateRegionalMaps();
    }

    generateRegionalMaps() {
        const grid = document.getElementById('regional-snapshots-grid');
        const crimeTypeSelect = document.getElementById('regional-crime-type');
        const focusSelect = document.getElementById('regional-focus');
        
        if (!grid || !crimeTypeSelect || !focusSelect) {
            console.error('Elementos del DOM no encontrados para mapas regionales');
            return;
        }
        
        const selectedCrimeType = crimeTypeSelect.value;
        const selectedFocus = focusSelect.value;
        
        console.log(`Generando mapas regionales para: ${selectedCrimeType}, enfoque: ${selectedFocus}`);
        
        // Limpiar grid completamente
        grid.innerHTML = '';
        
        // Mostrar loading
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'snapshot-loading';
        loadingDiv.style.cssText = 'grid-column: 1 / -1; height: 200px; display: flex; justify-content: center; align-items: center;';
        loadingDiv.textContent = 'Generando snapshots regionales...';
        grid.appendChild(loadingDiv);
        
        try {
            // Calcular máximo global para este tipo de delito
            const globalCrimeValues = this.municipalData.map(row => parseFloat(row[selectedCrimeType]) || 0);
            const globalMaxCrime = Math.max(...globalCrimeValues);
            
            // Esperar un momento y luego crear los elementos
            setTimeout(() => {
                // Limpiar loading
                grid.innerHTML = '';
                
                // Crear todos los elementos snapshot primero
                const snapshotData = [];
                this.periods.forEach(period => {
                    const snapshotElement = this.createRegionalSnapshot(period, selectedCrimeType, selectedFocus, globalMaxCrime);
                    grid.appendChild(snapshotElement);
                    
                    const mapId = `regional-snapshot-map-${period.replace(/\s+/g, '-').toLowerCase()}`;
                    snapshotData.push({
                        period: period,
                        mapId: mapId,
                        crimeType: selectedCrimeType,
                        focus: selectedFocus,
                        globalMaxCrime: globalMaxCrime
                    });
                });
                
                console.log(`Elementos snapshot creados: ${snapshotData.length}`);
                
                // Verificar que los elementos existen en el DOM
                setTimeout(() => {
                    const availableContainers = Array.from(document.querySelectorAll('[id^="regional-snapshot-map-"]')).map(el => el.id);
                    console.log('Contenedores disponibles después de crear elementos:', availableContainers);
                    
                    // Verificar que todos los contenedores tienen dimensiones
                    const containersWithDimensions = availableContainers.filter(id => {
                        const container = document.getElementById(id);
                        if (container) {
                            const rect = container.getBoundingClientRect();
                            return rect.width > 0 && rect.height > 0;
                        }
                        return false;
                    });
                    
                    console.log(`Contenedores con dimensiones: ${containersWithDimensions.length}/${availableContainers.length}`);
                    
                    // Crear los mapas uno por uno con verificación
                    this.createMapsSequentially(snapshotData, 0);
                }, 1000);
                
            }, 200);
            
        } catch (error) {
            console.error('Error generando snapshots regionales:', error);
            grid.innerHTML = '<div class="snapshot-loading" style="grid-column: 1 / -1; height: 200px;">Error: ' + error.message + '</div>';
        }
    }

    createMapsSequentially(snapshotData, index) {
        if (index >= snapshotData.length) {
            console.log('✅ Todos los mapas regionales creados');
            return;
        }
        
        const data = snapshotData[index];
        console.log(`Creando mapa ${index + 1}/${snapshotData.length}: ${data.period}`);
        
        // Verificar que el contenedor existe antes de crear el mapa
        const container = document.getElementById(data.mapId);
        if (container) {
            // Verificar que el contenedor está visible y tiene dimensiones
            const rect = container.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                this.createRegionalSnapshotMap(data.mapId, data.period, data.crimeType, data.focus, data.globalMaxCrime);
            } else {
                console.log(`Contenedor ${data.mapId} no tiene dimensiones, reintentando...`);
                // Reintentar después de un delay más largo
                setTimeout(() => {
                    this.createMapsSequentially(snapshotData, index);
                }, 500);
                return;
            }
        } else {
            console.error(`Contenedor no encontrado: ${data.mapId}`);
            // Listar todos los contenedores disponibles para debug
            const allContainers = Array.from(document.querySelectorAll('[id^="regional-snapshot-map-"]'));
            console.log('Contenedores disponibles:', allContainers.map(el => el.id));
        }
        
        // Continuar con el siguiente mapa después de un pequeño delay
        setTimeout(() => {
            this.createMapsSequentially(snapshotData, index + 1);
        }, 300);
    }

    calculateRegionalData(periodData, crimeType) {
        const regionalData = {};
        
        Object.keys(this.regiones).forEach(regionName => {
            const municipios = this.regiones[regionName];
            let totalRegional = 0;
            const municipiosData = [];
            
            municipios.forEach(municipio => {
                const municipioData = periodData.find(row => row.Municipio === municipio);
                const value = municipioData ? (parseFloat(municipioData[crimeType]) || 0) : 0;
                totalRegional += value;
                
                if (value > 0) {
                    municipiosData.push({
                        municipio: municipio,
                        valor: value
                    });
                }
            });
            
            regionalData[regionName] = {
                total: totalRegional,
                municipios: municipiosData.sort((a, b) => b.valor - a.valor)
            };
        });
        
        return regionalData;
    }

    createRegionalSnapshot(period, crimeType, focus, globalMaxCrime) {
        // Crear elemento contenedor
        const snapshotDiv = document.createElement('div');
        snapshotDiv.className = 'snapshot-item';
        
        // Header con período
        const header = document.createElement('div');
        header.className = 'snapshot-header';
        
        const title = document.createElement('h4');
        title.className = 'snapshot-title';
        title.textContent = period;
        header.appendChild(title);
        
        // Contenedor del mapa
        const mapDiv = document.createElement('div');
        mapDiv.className = 'snapshot-map';
        const mapId = `regional-snapshot-map-${period.replace(/\s+/g, '-').toLowerCase()}`;
        mapDiv.id = mapId;
        
        // Agregar un placeholder inicial
        mapDiv.innerHTML = '<div class="snapshot-loading">Cargando mapa...</div>';
        
        console.log(`Creando elemento snapshot regional con ID: ${mapId}`);
        
        // Ensamblar
        snapshotDiv.appendChild(header);
        snapshotDiv.appendChild(mapDiv);
        
        return snapshotDiv;
    }

    createRegionalSnapshotMap(mapId, period, crimeType, focus, globalMaxCrime) {
        try {
            // Verificar que el contenedor existe
            const mapContainer = document.getElementById(mapId);
            if (!mapContainer) {
                console.error(`Contenedor de mapa regional no encontrado: ${mapId}`);
                console.log('Contenedores disponibles:', Array.from(document.querySelectorAll('[id^="regional-snapshot-map-"]')).map(el => el.id));
                
                // Verificar si el contenedor padre existe
                const parentContainer = document.getElementById('regional-snapshots-grid');
                if (parentContainer) {
                    console.log('Contenedor padre regional-snapshots-grid encontrado');
                    console.log('Hijos del contenedor padre:', parentContainer.children.length);
                } else {
                    console.error('Contenedor padre regional-snapshots-grid NO encontrado');
                }
                return;
            }
            
            console.log(`Creando mapa regional para: ${period} (${mapId})`);
            
            // Verificar que tenemos datos
            if (!this.municipalData || !this.geojsonData) {
                console.error('Datos no disponibles para crear mapa regional');
                mapContainer.innerHTML = '<div class="snapshot-loading">Datos no disponibles</div>';
                return;
            }
            
            // Filtrar datos del período
            const periodData = this.municipalData.filter(row => row.Periodo === period);
            
            if (periodData.length === 0) {
                mapContainer.innerHTML = '<div class="snapshot-loading">Sin datos para ' + period + '</div>';
                return;
            }
            
            // Limpiar contenedor antes de crear el mapa
            mapContainer.innerHTML = '';
            
            // Verificar si ya existe un mapa en este contenedor
            if (mapContainer._leaflet_id) {
                mapContainer._leaflet_id = null;
            }
            
            // Crear mapa
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
            
            // Crear heatmap de fondo con colores regionales
            this.createRegionalHeatmap(map, periodData, crimeType, focus, globalMaxCrime);
            
            // Crear círculos
            this.createRegionalCircles(map, periodData, crimeType, focus, globalMaxCrime);
            
            console.log(`✅ Mapa regional creado exitosamente: ${period}`);
            
        } catch (error) {
            console.error(`Error creando mapa regional para ${period}:`, error);
            const mapContainer = document.getElementById(mapId);
            if (mapContainer) {
                mapContainer.innerHTML = '<div class="snapshot-loading">Error creando mapa</div>';
            }
            
            // Intentar recrear el mapa después de un delay
            setTimeout(() => {
                console.log(`Reintentando crear mapa para ${period}...`);
                this.createRegionalSnapshotMap(mapId, period, crimeType, focus, globalMaxCrime);
            }, 1000);
        }
    }

    createRegionalHeatmap(map, periodData, crimeType, focus, globalMaxCrime) {
        if (!this.geojsonData || !this.geojsonData.features) {
            console.error('GeoJSON no disponible para crear heatmap regional');
            return;
        }
        
        try {
            // Crear diccionario de datos por municipio
            const dataByMunicipality = {};
            periodData.forEach(row => {
                const municipio = row.Municipio.trim().toLowerCase();
                const value = parseFloat(row[crimeType]) || 0;
                dataByMunicipality[municipio] = {
                    value: value,
                    data: row
                };
            });
            
            // Crear capa GeoJSON con colores por región
            const geojsonLayer = L.geoJSON(this.geojsonData, {
                style: (feature) => {
                    try {
                        const municipio = feature.properties.NOMGEO.trim().toLowerCase();
                        const municipalData = dataByMunicipality[municipio];
                        
                        // Determinar región del municipio
                        const region = this.getMunicipioRegion(feature.properties.NOMGEO);
                        
                        let fillColor = '#e8e8e8';
                        let fillOpacity = 0.3;
                        let strokeColor = '#333333';
                        let strokeWidth = 1;
                        
                        // Si hay enfoque regional, destacar solo esa región
                        if (focus !== 'all' && region !== focus) {
                            fillColor = '#f5f5f5';
                            fillOpacity = 0.2;
                            strokeColor = '#cccccc';
                        } else {
                            // Colores por región
                            const regionColors = {
                                'Norte': '#e74c3c',
                                'Centro Norte': '#3498db', 
                                'Centro': '#2ecc71',
                                'Sur': '#f39c12'
                            };
                            
                            if (municipalData && municipalData.value > 0) {
                                const intensity = globalMaxCrime > 0 ? municipalData.value / globalMaxCrime : 0;
                                const baseColor = regionColors[region] || '#95a5a6';
                                fillColor = this.adjustColorIntensity(baseColor, intensity);
                                fillOpacity = 0.7;
                                strokeWidth = 2;
                            } else {
                                fillColor = regionColors[region] || '#95a5a6';
                                fillOpacity = 0.3;
                            }
                        }
                        
                        return {
                            fillColor: fillColor,
                            weight: strokeWidth,
                            opacity: 1,
                            color: strokeColor,
                            fillOpacity: fillOpacity
                        };
                    } catch (error) {
                        console.error('Error aplicando estilo a feature:', error);
                        return {
                            fillColor: '#e8e8e8',
                            weight: 1,
                            opacity: 1,
                            color: '#333333',
                            fillOpacity: 0.3
                        };
                    }
                }
            });
            
            geojsonLayer.addTo(map);
            
            // Ajustar vista del mapa a los límites del GeoJSON
            map.fitBounds(geojsonLayer.getBounds(), {padding: [5, 5]});
            
        } catch (error) {
            console.error('Error creando heatmap regional:', error);
        }
    }

    createRegionalCircles(map, periodData, crimeType, focus, globalMaxCrime) {
        const coords = this.getMunicipalCoordinates();
        
        // Calcular valores globales para círculos
        const globalCrimeValues = this.municipalData.map(row => parseFloat(row[crimeType]) || 0);
        const globalMinCrime = Math.min(...globalCrimeValues.filter(v => v > 0));
        
        periodData.forEach(row => {
            const municipio = row.Municipio;
            const municipioCoords = coords[municipio];
            const crimeValue = parseFloat(row[crimeType]) || 0;
            
            if (!municipioCoords || crimeValue <= 0) return;
            
            // Determinar región del municipio
            const region = this.getMunicipioRegion(municipio);
            
            // Si hay enfoque regional, mostrar solo esa región
            if (focus !== 'all' && region !== focus) return;
            
            // Calcular tamaño del círculo
            const minSize = 3;
            const maxSize = 12;
            let circleSize;
            
            if (globalMaxCrime <= 1) {
                circleSize = minSize + 1;
            } else if (globalMaxCrime === globalMinCrime) {
                circleSize = minSize + 4;
            } else {
                const globalRatio = (crimeValue - (globalMinCrime || 0)) / (globalMaxCrime - (globalMinCrime || 0));
                circleSize = minSize + (globalRatio * (maxSize - minSize));
            }
            
            circleSize = Math.max(circleSize, minSize);
            
            // Color por región
            const regionColors = {
                'Norte': '#c0392b',
                'Centro Norte': '#2980b9', 
                'Centro': '#27ae60',
                'Sur': '#d68910'
            };
            
            // Crear círculo
            const circle = L.circleMarker(municipioCoords, {
                radius: circleSize,
                fillColor: regionColors[region] || '#e74c3c',
                color: '#ffffff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
            
            // Popup simple
            circle.bindPopup(`
                <div style="font-family: Arial, sans-serif; font-size: 12px;">
                    <strong>${municipio}</strong><br>
                    Región: ${region}<br>
                    ${crimeType}: ${crimeValue}
                </div>
            `);
            
            circle.addTo(map);
        });
    }

    getMunicipioRegion(municipio) {
        for (const [regionName, municipios] of Object.entries(this.regiones)) {
            if (municipios.includes(municipio)) {
                return regionName;
            }
        }
        return 'Sin región';
    }

    getMunicipalCoordinates() {
        // Coordenadas oficiales del Marco Geoestadístico INEGI 2022 (exactamente las mismas del heatmap principal)
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

    adjustColorIntensity(baseColor, intensity) {
        // Convertir color hex a RGB y ajustar intensidad
        const hex = baseColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Ajustar intensidad (más intenso = más oscuro)
        const factor = 0.3 + (intensity * 0.7); // Entre 0.3 y 1.0
        const newR = Math.round(r * factor);
        const newG = Math.round(g * factor);
        const newB = Math.round(b * factor);
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    }

    generateRegionalEvolutionChart() {
        const canvas = document.getElementById('chart-regional-evolution');
        const crimeTypeSelect = document.getElementById('regional-crime-type');
        
        if (!canvas || !crimeTypeSelect) return;
        
        const selectedCrimeType = crimeTypeSelect.value;
        
        // Calcular datos por región y período
        const datasets = [];
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
        
        Object.keys(this.regiones).forEach((regionName, index) => {
            const regionValues = this.periods.map(period => {
                const periodData = this.municipalData.filter(row => row.Periodo === period);
                const regionalData = this.calculateRegionalData(periodData, selectedCrimeType);
                return regionalData[regionName].total;
            });
            
            datasets.push({
                label: regionName,
                data: regionValues,
                borderColor: colors[index],
                backgroundColor: colors[index] + '20',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            });
        });
        
        // Destruir gráfica anterior si existe
        if (canvas.chart) {
            canvas.chart.destroy();
        }
        
        // Crear nueva gráfica
        const ctx = canvas.getContext('2d');
        canvas.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.periods,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Evolución de ${selectedCrimeType} por región`
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Casos'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Período'
                        }
                    }
                }
            }
        });
    }

    generateRegionalTable() {
        const tableContainer = document.getElementById('tabla-regional-sinaloa');
        const crimeTypeSelect = document.getElementById('regional-crime-type');
        
        if (!tableContainer || !crimeTypeSelect) return;
        
        const selectedCrimeType = crimeTypeSelect.value;
        
        // Crear tabla
        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const regionHeader = document.createElement('th');
        regionHeader.textContent = 'Región';
        headerRow.appendChild(regionHeader);
        
        this.periods.forEach(period => {
            const th = document.createElement('th');
            th.textContent = period;
            th.style.textAlign = 'center';
            headerRow.appendChild(th);
        });
        
        const totalHeader = document.createElement('th');
        totalHeader.textContent = 'Total';
        totalHeader.style.textAlign = 'center';
        totalHeader.style.fontWeight = 'bold';
        headerRow.appendChild(totalHeader);
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Body
        const tbody = document.createElement('tbody');
        
        Object.keys(this.regiones).forEach(regionName => {
            const row = document.createElement('tr');
            
            // Región
            const regionCell = document.createElement('td');
            regionCell.textContent = regionName;
            regionCell.style.fontWeight = '500';
            row.appendChild(regionCell);
            
            let totalRegion = 0;
            
            // Períodos
            this.periods.forEach(period => {
                const periodData = this.municipalData.filter(row => row.Periodo === period);
                const regionalData = this.calculateRegionalData(periodData, selectedCrimeType);
                const value = regionalData[regionName].total;
                
                const td = document.createElement('td');
                td.textContent = value;
                td.style.textAlign = 'center';
                totalRegion += value;
                row.appendChild(td);
            });
            
            // Total
            const totalCell = document.createElement('td');
            totalCell.textContent = totalRegion;
            totalCell.style.textAlign = 'center';
            totalCell.style.fontWeight = 'bold';
            totalCell.style.backgroundColor = '#f8f9fa';
            row.appendChild(totalCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        
        // Limpiar y agregar tabla
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    }

    generateRegionalRankingSnapshots() {
        const grid = document.getElementById('regional-ranking-grid');
        const crimeTypeSelect = document.getElementById('regional-crime-type');
        
        if (!grid || !crimeTypeSelect) return;
        
        const selectedCrimeType = crimeTypeSelect.value;
        
        // Limpiar grid
        grid.innerHTML = '';
        
        // Generar tabla para cada período
        this.periods.forEach(period => {
            const periodData = this.municipalData.filter(row => row.Periodo === period);
            const regionalData = this.calculateRegionalData(periodData, selectedCrimeType);
            
            // Ordenar regiones por total
            const regionesOrdenadas = Object.keys(regionalData)
                .map(region => ({
                    region: region,
                    total: regionalData[region].total
                }))
                .sort((a, b) => b.total - a.total);
            
            // Crear tabla snapshot
            const tableContainer = document.createElement('div');
            tableContainer.className = 'ranking-table-container';
            
            const title = document.createElement('div');
            title.className = 'ranking-table-title';
            title.textContent = period;
            
            const table = document.createElement('table');
            table.className = 'ranking-mini-table';
            
            // Header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            ['#', 'Región', 'Casos'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                headerRow.appendChild(th);
            });
            
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Body
            const tbody = document.createElement('tbody');
            
            regionesOrdenadas.forEach((item, index) => {
                const row = document.createElement('tr');
                
                const rankCell = document.createElement('td');
                rankCell.className = 'rank-cell';
                rankCell.textContent = index + 1;
                row.appendChild(rankCell);
                
                const regionCell = document.createElement('td');
                regionCell.className = 'state-cell';
                regionCell.textContent = item.region;
                row.appendChild(regionCell);
                
                const valorCell = document.createElement('td');
                valorCell.className = 'value-cell';
                valorCell.textContent = item.total;
                row.appendChild(valorCell);
                
                tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            
            tableContainer.appendChild(title);
            tableContainer.appendChild(table);
            grid.appendChild(tableContainer);
        });
    }
}

// Inicializar análisis regional
document.addEventListener('DOMContentLoaded', function() {
    // Evitar múltiples inicializaciones
    if (window.sinaloaRegionalAnalysis) {
        console.log('Análisis regional ya inicializado');
        return;
    }
    
    // Función para intentar inicializar
    function tryInitRegionalAnalysis() {
        // Verificar si el heatmap principal ya está cargado
        if (window.sinaloaHeatMap && window.sinaloaHeatMap.municipalData && window.sinaloaHeatMap.geojsonData) {
            console.log('Datos del heatmap disponibles, iniciando análisis regional...');
            window.sinaloaRegionalAnalysis = new SinaloaRegionalAnalysis();
            window.sinaloaRegionalAnalysis.init();
        } else {
            console.log('Esperando datos del heatmap principal...');
            // Si después de 10 segundos no hay datos del heatmap, inicializar independientemente
            if (Date.now() - startTime > 10000) {
                console.log('Timeout esperando heatmap, inicializando análisis regional independientemente...');
                window.sinaloaRegionalAnalysis = new SinaloaRegionalAnalysis();
                window.sinaloaRegionalAnalysis.init();
            } else {
                setTimeout(tryInitRegionalAnalysis, 1000);
            }
        }
    }
    
    const startTime = Date.now();
    
    // Iniciar el proceso de inicialización
    setTimeout(tryInitRegionalAnalysis, 2000);
});