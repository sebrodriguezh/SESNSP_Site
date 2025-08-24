// Análisis mejorado de spillover con shapefiles
class SpilloverEnhancedAnalysis {
    constructor() {
        this.sinaloaData = null;
        this.fronterizosData = null;
        this.estadosGeojson = {};
        this.sinaloaGeojson = null;
        this.fronterizosInfo = null;
        this.map = null;
        this.currentPeriod = 'Enero 2024';
        this.currentDelito = 'Total';
        this.periods = [];
        this.initPeriods();
    }

    initPeriods() {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        // 2024 completo
        meses.forEach(mes => {
            this.periods.push(`${mes} 2024`);
        });
        
        // 2025 hasta julio
        for (let i = 0; i < 7; i++) {
            this.periods.push(`${meses[i]} 2025`);
        }
    }

    async init() {
        console.log('Inicializando análisis de spillover mejorado...');
        
        try {
            console.log('1. Cargando datos...');
            await this.loadData();
            
            console.log('2. Inicializando mapa...');
            this.initMap();
            
            console.log('3. Configurando controles...');
            this.setupControls();
            
            console.log('4. Actualizando visualización...');
            this.updateVisualization();
            

            
            console.log('6. Generando tabla de spillover...');
            this.generateSpilloverTable();
            
            console.log('✅ Spillover mejorado inicializado completamente');
        } catch (error) {
            console.error('❌ Error inicializando spillover mejorado:', error);
        }
    }

    async loadData() {
        console.log('Cargando datos de spillover...');
        
        try {
            // Cargar datos de Sinaloa (usar los ya cargados del main)
            if (window.report && window.report.sinaloaMensualData) {
                this.sinaloaData = window.report.sinaloaMensualData;
                console.log('Datos de Sinaloa cargados:', this.sinaloaData.length);
            } else {
                console.log('Datos de Sinaloa no disponibles, cargando directamente...');
                const sinaloaResponse = await fetch('data/violencia_homicida_sinaloa_mensual_2024_2025.csv');
                const sinaloaText = await sinaloaResponse.text();
                this.sinaloaData = this.parseCSV(sinaloaText);
                console.log('Datos de Sinaloa cargados directamente:', this.sinaloaData.length);
            }
            
            // Cargar datos de municipios fronterizos
            const fronterizosResponse = await fetch('data/spillover_municipios_fronterizos_2024_2025.csv');
            if (!fronterizosResponse.ok) {
                throw new Error(`Error cargando datos fronterizos: ${fronterizosResponse.status}`);
            }
            const fronterizosText = await fronterizosResponse.text();
            this.fronterizosData = this.parseCSV(fronterizosText);
            console.log('Datos de municipios fronterizos cargados:', this.fronterizosData.length);
            console.log('Muestra de datos fronterizos:', this.fronterizosData.slice(0, 3));
            
            // Cargar información de municipios fronterizos
            const fronterizosInfoResponse = await fetch('data/municipios_fronterizos_sinaloa.json');
            this.fronterizosInfo = await fronterizosInfoResponse.json();
            console.log('Información de municipios fronterizos cargada');
            
            // Cargar GeoJSON de Sinaloa
            const sinaloaResponse = await fetch('data/sinaloa_municipios_new_simplified.geojson');
            this.sinaloaGeojson = await sinaloaResponse.json();
            console.log('GeoJSON de Sinaloa cargado:', this.sinaloaGeojson.features.length, 'municipios');
            
            // Cargar GeoJSON de estados colindantes
            const estados = ['sonora', 'chihuahua', 'durango', 'nayarit'];
            for (const estado of estados) {
                try {
                    const response = await fetch(`data/${estado}_municipios_simplified.geojson`);
                    this.estadosGeojson[estado] = await response.json();
                    console.log(`GeoJSON de ${estado} cargado:`, this.estadosGeojson[estado].features.length, 'municipios');
                } catch (error) {
                    console.error(`Error cargando GeoJSON de ${estado}:`, error);
                }
            }
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            throw error;
        }
    }

    parseCSV(text) {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            // Manejar CSV con comillas
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

    initMap() {
        const mapContainer = document.getElementById('mapa-spillover');
        if (!mapContainer) {
            console.error('Contenedor del mapa de spillover no encontrado');
            return;
        }

        // Limpiar contenedor
        mapContainer.innerHTML = '';

        // Crear mapa centrado en la región de Sinaloa y estados colindantes (sin mapa base)
        this.map = L.map('mapa-spillover', {
            zoomControl: true,
            attributionControl: false
        }).setView([25.5, -107.0], 6);
        
        // Agregar fondo sutil para el mapa
        mapContainer.style.backgroundColor = '#f8f9fa';
        
        console.log('Mapa de spillover inicializado sin mapa base');
    }

    updateVisualization() {
        if (!this.map || !this.sinaloaGeojson) return;

        console.log(`Actualizando visualización para ${this.currentPeriod}, delito: ${this.currentDelito}`);

        // Limpiar capas anteriores
        this.map.eachLayer(layer => {
            if (layer !== this.map._layers[Object.keys(this.map._layers)[0]]) {
                this.map.removeLayer(layer);
            }
        });

        // Obtener datos del período actual
        const sinaloaDataPeriod = this.getSinaloaDataForPeriod(this.currentPeriod);
        const fronterizosDataPeriod = this.getFronterizosDataForPeriod(this.currentPeriod);

        // Agregar capa de Sinaloa
        this.addSinaloaLayer(sinaloaDataPeriod);

        // Agregar capas de estados colindantes
        this.addEstadosColindantesLayers(fronterizosDataPeriod);

        // Ajustar vista
        if (this.sinaloaLayer) {
            this.map.fitBounds(this.sinaloaLayer.getBounds(), {padding: [20, 20]});
        }

        // Actualizar tabla cuando cambie el tipo de delito o período
        this.updateSpilloverTable();
    }

    getSinaloaDataForPeriod(period) {
        if (!this.sinaloaData || !period) return null;
        
        return this.sinaloaData.find(row => row && row.Periodo === period);
    }

    getFronterizosDataForPeriod(period) {
        if (!this.fronterizosData || !period) return [];
        
        return this.fronterizosData.filter(row => row && row.Periodo === period);
    }

    addSinaloaLayer(sinaloaData) {
        // Obtener datos de violencia homicida total para todos los municipios de Sinaloa
        const periodData = this.getSinaloaMunicipalDataForPeriod(this.currentPeriod);
        
        // Calcular máximo global para normalización
        const allTotalValues = periodData.map(row => parseFloat(row.Total) || 0);
        const maxValue = Math.max(...allTotalValues, 1);
        
        this.sinaloaLayer = L.geoJSON(this.sinaloaGeojson, {
            style: (feature) => {
                const municipio = feature.properties.NOMGEO;
                const municipalData = periodData.find(row => row.Municipio === municipio);
                const value = municipalData ? (parseFloat(municipalData.Total) || 0) : 0;
                
                // Calcular color basado en el valor (escala de rojos)
                let fillColor = '#f8f9fa'; // Color base para valores 0
                if (value > 0) {
                    const intensity = value / maxValue;
                    if (intensity >= 0.8) fillColor = '#8b0000';
                    else if (intensity >= 0.6) fillColor = '#dc143c';
                    else if (intensity >= 0.4) fillColor = '#ff4500';
                    else if (intensity >= 0.2) fillColor = '#ff6347';
                    else fillColor = '#ffb6c1';
                }
                
                return {
                    fillColor: fillColor,
                    weight: 2,
                    opacity: 1,
                    color: '#2c3e50',
                    fillOpacity: 0.7
                };
            },
            onEachFeature: (feature, layer) => {
                const municipio = feature.properties.NOMGEO;
                const municipalData = periodData.find(row => row.Municipio === municipio);
                const value = municipalData ? (parseFloat(municipalData.Total) || 0) : 0;
                
                const popupContent = `
                    <div style="font-family: Arial, sans-serif;">
                        <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${municipio}</h4>
                        <p style="margin: 5px 0;"><strong>Estado:</strong> Sinaloa</p>
                        <p style="margin: 5px 0;"><strong>Período:</strong> ${this.currentPeriod}</p>
                        <p style="margin: 5px 0;"><strong>Violencia homicida total:</strong> ${value}</p>
                        <p style="margin: 5px 0; font-size: 12px; color: #666;">Municipio de Sinaloa</p>
                    </div>
                `;
                layer.bindPopup(popupContent);
            }
        }).addTo(this.map);
    }
    
    getSinaloaMunicipalDataForPeriod(period) {
        // Cargar datos municipales de Sinaloa si no están disponibles
        if (!this.sinaloaMunicipalData) {
            this.loadSinaloaMunicipalData();
        }
        
        if (!this.sinaloaMunicipalData) return [];
        
        return this.sinaloaMunicipalData.filter(row => row.Periodo === period);
    }
    
    async loadSinaloaMunicipalData() {
        try {
            const response = await fetch('data/violencia_homicida_sinaloa_municipal_2024_2025.csv');
            const text = await response.text();
            this.sinaloaMunicipalData = this.parseCSV(text);
            console.log('Datos municipales de Sinaloa cargados:', this.sinaloaMunicipalData.length);
        } catch (error) {
            console.error('Error cargando datos municipales de Sinaloa:', error);
            this.sinaloaMunicipalData = [];
        }
    }

    addEstadosColindantesLayers(fronterizosDataPeriod) {
        // Crear diccionario de datos por municipio
        const dataByMunicipality = {};
        fronterizosDataPeriod.forEach(row => {
            const key = `${row.Municipio}_${row.Entidad}`;
            dataByMunicipality[key] = parseFloat(row[this.currentDelito]) || 0;
        });

        // Agregar cada estado con estilo base
        Object.keys(this.estadosGeojson).forEach(estadoKey => {
            const estadoNombre = estadoKey.charAt(0).toUpperCase() + estadoKey.slice(1);
            const geojson = this.estadosGeojson[estadoKey];
            
            L.geoJSON(geojson, {
                style: (feature) => {
                    const municipioNombre = feature.properties.NOMGEO || feature.properties.NOM_MUN;
                    const key = `${municipioNombre}_${estadoNombre}`;
                    const value = dataByMunicipality[key] || 0;
                    const isFronterizo = this.isMunicipioFronterizo(municipioNombre, estadoNombre);
                    
                    return {
                        fillColor: '#f0f0f0',
                        weight: 1,
                        opacity: 1,
                        color: '#bdc3c7',
                        fillOpacity: 0.3
                    };
                },
                onEachFeature: (feature, layer) => {
                    const municipioNombre = feature.properties.NOMGEO || feature.properties.NOM_MUN;
                    const key = `${municipioNombre}_${estadoNombre}`;
                    const value = dataByMunicipality[key] || 0;
                    const isFronterizo = this.isMunicipioFronterizo(municipioNombre, estadoNombre);
                    
                    const popupContent = `
                        <div style="font-family: Arial, sans-serif;">
                            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${municipioNombre}</h4>
                            <p style="margin: 5px 0;"><strong>Estado:</strong> ${estadoNombre}</p>
                            <p style="margin: 5px 0;"><strong>Período:</strong> ${this.currentPeriod}</p>
                            <p style="margin: 5px 0;"><strong>${this.currentDelito}:</strong> ${value}</p>
                            <p style="margin: 5px 0; font-size: 12px; color: ${isFronterizo ? '#e74c3c' : '#666'};">
                                ${isFronterizo ? '🔴 Municipio fronterizo' : 'Municipio no fronterizo'}
                            </p>
                        </div>
                    `;
                    layer.bindPopup(popupContent);
                }
            }).addTo(this.map);
        });
        
        // Agregar círculos para municipios fronterizos
        this.addFronterizosCircles(fronterizosDataPeriod);
    }
    
    addFronterizosCircles(fronterizosDataPeriod) {
        console.log('Agregando círculos para municipios fronterizos...');
        console.log('Datos del período:', fronterizosDataPeriod.length, 'municipios');
        
        // Calcular máximo global para normalización
        const allValues = fronterizosDataPeriod.map(row => parseFloat(row[this.currentDelito]) || 0);
        const maxValue = Math.max(...allValues, 1); // Mínimo 1 para evitar división por cero
        
        console.log('Máximo valor para normalización:', maxValue);
        console.log('Valores encontrados:', allValues);
        
        let circlesCreated = 0;
        
        fronterizosDataPeriod.forEach(row => {
            const value = parseFloat(row[this.currentDelito]) || 0;
            console.log(`Procesando ${row.Municipio}, ${row.Entidad}: ${value} casos`);
            
            if (value > 0) {
                // Buscar coordenadas del municipio
                const coordinates = this.getMunicipioCoordinates(row.Municipio, row.Entidad);
                console.log(`Coordenadas para ${row.Municipio}:`, coordinates);
                
                if (coordinates) {
                    // Calcular tamaño del círculo (mínimo 8px, máximo 30px)
                    const size = Math.max(8, Math.min(30, 8 + (value / maxValue) * 22));
                    
                    console.log(`Creando círculo para ${row.Municipio}: tamaño ${size}px, valor ${value}`);
                    
                    // Crear círculo
                    const circle = L.circleMarker(coordinates, {
                        radius: size,
                        fillColor: '#e74c3c',
                        color: '#c0392b',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.7
                    }).addTo(this.map);
                    
                    circlesCreated++;
                    
                    // Agregar popup
                    const popupContent = `
                        <div style="font-family: Arial, sans-serif;">
                            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${row.Municipio}</h4>
                            <p style="margin: 5px 0;"><strong>Estado:</strong> ${row.Entidad}</p>
                            <p style="margin: 5px 0;"><strong>Período:</strong> ${this.currentPeriod}</p>
                            <p style="margin: 5px 0;"><strong>${this.currentDelito}:</strong> ${value}</p>
                            <p style="margin: 5px 0; font-size: 12px; color: #e74c3c;">
                                🔴 Municipio fronterizo con Sinaloa
                            </p>
                        </div>
                    `;
                    circle.bindPopup(popupContent);
                } else {
                    console.warn(`No se encontraron coordenadas para ${row.Municipio}, ${row.Entidad}`);
                }
            }
        });
        
        console.log(`✅ Círculos creados: ${circlesCreated}`);
    }
    
    getMunicipioCoordinates(municipio, estado) {
        // Buscar en el GeoJSON del estado correspondiente
        const estadoKey = estado.toLowerCase();
        if (this.estadosGeojson[estadoKey]) {
            const feature = this.estadosGeojson[estadoKey].features.find(f => 
                f.properties.NOMGEO === municipio || f.properties.NOM_MUN === municipio
            );
            if (feature) {
                // Calcular centro del polígono
                const geojsonLayer = L.geoJSON(feature);
                const bounds = geojsonLayer.getBounds();
                return bounds.getCenter();
            }
        }
        
        // Si no se encuentra, usar coordenadas aproximadas basadas en el nombre del municipio
        const coordenadasAproximadas = {
            'Huatabampo': [26.8261, -109.6422],
            'Álamos': [27.0167, -108.9333],
            'Alamos': [27.0167, -108.9333], // Sin acento
            'Chínipas': [27.4000, -108.5333],
            'Batopilas de Manuel Gómez Morín': [27.0167, -107.7333],
            'Guazapares': [27.4500, -108.0833],
            'Urique': [27.2167, -107.9167],
            'Morelos': [26.6667, -107.6333],
            'Guadalupe y Calvo': [26.1000, -106.9667],
            'Pueblo Nuevo': [23.3833, -105.3833],
            'San Dimas': [24.1167, -105.9333],
            'Tamazula': [24.9667, -106.9667],
            'Acaponeta': [22.5000, -105.3667],
            'Huajicori': [22.6333, -105.3167],
            'Tecuala': [22.4000, -105.4500]
        };
        
        return coordenadasAproximadas[municipio] || null;
    }

    isMunicipioFronterizo(municipio, estado) {
        if (!this.fronterizosInfo || !this.fronterizosInfo.estados || !this.fronterizosInfo.estados[estado]) return false;
        if (!municipio || !estado) return false;
        
        return this.fronterizosInfo.estados[estado].some(m => m && m.nombre === municipio);
    }

    getColorForValue(value, type) {
        if (value === 0) return '#f8f9fa';
        
        if (type === 'sinaloa') {
            // Escala de rojos para Sinaloa (valores más altos)
            if (value >= 200) return '#8b0000';
            if (value >= 150) return '#dc143c';
            if (value >= 100) return '#ff4500';
            if (value >= 50) return '#ff6347';
            return '#ffb6c1';
        } else {
            // Escala de azules para municipios fronterizos (valores más bajos)
            if (value >= 10) return '#0066cc';
            if (value >= 5) return '#3399ff';
            if (value >= 2) return '#66b3ff';
            if (value >= 1) return '#99ccff';
            return '#cce6ff';
        }
    }

    setupControls() {
        const mesSlider = document.getElementById('mes-slider');
        const periodoDisplay = document.getElementById('periodo-display');
        const delitoSelector = document.getElementById('delito-selector');

        if (mesSlider && periodoDisplay) {
            mesSlider.addEventListener('input', (e) => {
                const periodIndex = parseInt(e.target.value);
                this.currentPeriod = this.periods[periodIndex];
                periodoDisplay.textContent = this.currentPeriod;
                this.updateVisualization();
            });
        }

        if (delitoSelector) {
            delitoSelector.addEventListener('change', (e) => {
                this.currentDelito = e.target.value;
                this.updateVisualization();
            });
        }
    }



    generateSpilloverTable() {
        console.log('Generando tabla de spillover...');
        const container = document.getElementById('tabla-spillover');
        if (!container) {
            console.error('Contenedor tabla-spillover no encontrado');
            return;
        }
        
        console.log('Contenedor encontrado, limpiando...');
        // Crear contenedor para ambas tablas
        container.innerHTML = '';
        
        console.log('Generando tabla de valores absolutos...');
        // Tabla 1: Valores absolutos por municipio
        this.generateMunicipalAbsoluteTable(container);
        
        console.log('✅ Tabla de spillover generada');
    }

    generateMunicipalAbsoluteTable(container) {
        console.log('Generando tabla municipal absoluta...');
        
        if (!this.fronterizosData || this.fronterizosData.length === 0) {
            console.error('No hay datos de municipios fronterizos');
            const errorDiv = document.createElement('div');
            errorDiv.textContent = 'Error: No se pudieron cargar los datos de municipios fronterizos';
            errorDiv.style.color = 'red';
            container.appendChild(errorDiv);
            return;
        }
        
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-section';
        
        const title = document.createElement('h4');
        // Título dinámico basado en el tipo de delito seleccionado
        const delitoLabels = {
            'Total': 'Violencia homicida total',
            'Homicidio doloso': 'Homicidio doloso',
            'Homicidio culposo': 'Homicidio culposo',
            'Feminicidio': 'Feminicidio',
            'Otros delitos que atentan contra la vida y la integridad corporal': 'Otros delitos contra la vida'
        };
        title.textContent = `Valores absolutos por municipio fronterizo - ${delitoLabels[this.currentDelito] || 'Violencia homicida total'}`;
        title.style.marginBottom = '1rem';
        tableContainer.appendChild(title);
        
        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Header con todos los períodos
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Primera columna: Municipio
        const municipioTh = document.createElement('th');
        municipioTh.textContent = 'Municipio';
        municipioTh.style.position = 'sticky';
        municipioTh.style.left = '0';
        municipioTh.style.backgroundColor = '#ffffff';
        municipioTh.style.color = '#000000';
        municipioTh.style.border = '1px solid #dee2e6';
        headerRow.appendChild(municipioTh);
        
        // Columnas de períodos
        this.periods.forEach(period => {
            const th = document.createElement('th');
            th.textContent = period;
            th.style.textAlign = 'center';
            th.style.fontSize = '0.8rem';
            th.style.minWidth = '80px';
            th.style.backgroundColor = '#ffffff';
            th.style.color = '#000000';
            th.style.border = '1px solid #dee2e6';
            

            
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Body con datos por municipio
        const tbody = document.createElement('tbody');
        
        // Obtener lista única de municipios fronterizos
        const municipios = [...new Set(this.fronterizosData.map(row => `${row.Municipio}, ${row.Entidad}`))];
        
        municipios.forEach(municipioCompleto => {
            const [municipio, estado] = municipioCompleto.split(', ');
            const tr = document.createElement('tr');
            
            // Columna de municipio
            const municipioTd = document.createElement('td');
            municipioTd.textContent = municipioCompleto;
            municipioTd.style.fontWeight = '500';
            municipioTd.style.position = 'sticky';
            municipioTd.style.left = '0';
            municipioTd.style.backgroundColor = '#f8f9fa';
            municipioTd.style.borderRight = '2px solid #dee2e6';
            tr.appendChild(municipioTd);
            
            // Datos por período
            let totalMunicipio = 0;
            this.periods.forEach(period => {
                const data = this.fronterizosData.find(row => 
                    row.Municipio === municipio && 
                    row.Entidad === estado && 
                    row.Periodo === period
                );
                
                // Usar el tipo de delito seleccionado en lugar de siempre Total
                let value = 0;
                if (data) {
                    switch (this.currentDelito) {
                        case 'Homicidio doloso':
                            value = parseFloat(data['Homicidio doloso']) || 0;
                            break;
                        case 'Homicidio culposo':
                            value = parseFloat(data['Homicidio culposo']) || 0;
                            break;
                        case 'Feminicidio':
                            value = parseFloat(data['Feminicidio']) || 0;
                            break;
                        case 'Otros delitos que atentan contra la vida y la integridad corporal':
                            value = parseFloat(data['Otros delitos que atentan contra la vida y la integridad corporal']) || 0;
                            break;
                        default: // Total violencia homicida
                            value = parseFloat(data.Total) || 0;
                    }
                }
                totalMunicipio += value;
                
                const td = document.createElement('td');
                td.textContent = value;
                td.style.textAlign = 'center';
                
                // Colorear según valor
                if (value > 5) {
                    td.style.backgroundColor = '#ffebee';
                    td.style.color = '#c62828';
                    td.style.fontWeight = 'bold';
                } else if (value > 2) {
                    td.style.backgroundColor = '#fff3e0';
                    td.style.color = '#ef6c00';
                } else if (value > 0) {
                    td.style.backgroundColor = '#e8f5e8';
                    td.style.color = '#2e7d32';
                }
                

                
                tr.appendChild(td);
            });
            
            // Destacar municipios con más actividad
            if (totalMunicipio > 20) {
                tr.style.backgroundColor = '#fff5f5';
            }
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        

        
        container.appendChild(tableContainer);
    }

    updateSpilloverTable() {
        // Actualizar la tabla con el tipo de delito seleccionado
        const container = document.getElementById('tabla-spillover');
        if (!container) return;
        
        // Limpiar contenedor
        container.innerHTML = '';
        
        // Generar tabla actualizada
        this.generateMunicipalAbsoluteTable(container);
    }

    generateMunicipalChangesTable(container) {
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-section';
        tableContainer.style.marginTop = '2rem';
        
        const title = document.createElement('h4');
        title.textContent = 'Cambios porcentuales mes a mes';
        title.style.marginBottom = '1rem';
        tableContainer.appendChild(title);
        
        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const municipioTh = document.createElement('th');
        municipioTh.textContent = 'Municipio';
        municipioTh.style.position = 'sticky';
        municipioTh.style.left = '0';
        municipioTh.style.backgroundColor = '#f8f9fa';
        headerRow.appendChild(municipioTh);
        
        // Períodos de cambio (desde Febrero 2024)
        for (let i = 1; i < this.periods.length; i++) {
            const th = document.createElement('th');
            th.textContent = `${this.periods[i-1]} → ${this.periods[i]}`;
            th.style.textAlign = 'center';
            th.style.fontSize = '0.7rem';
            th.style.minWidth = '100px';
            headerRow.appendChild(th);
        }
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Body
        const tbody = document.createElement('tbody');
        
        const municipios = [...new Set(this.fronterizosData.map(row => `${row.Municipio}, ${row.Entidad}`))];
        
        municipios.forEach(municipioCompleto => {
            const [municipio, estado] = municipioCompleto.split(', ');
            const tr = document.createElement('tr');
            
            // Columna de municipio
            const municipioTd = document.createElement('td');
            municipioTd.textContent = municipioCompleto;
            municipioTd.style.fontWeight = '500';
            municipioTd.style.position = 'sticky';
            municipioTd.style.left = '0';
            municipioTd.style.backgroundColor = '#f8f9fa';
            municipioTd.style.borderRight = '2px solid #dee2e6';
            tr.appendChild(municipioTd);
            
            // Calcular cambios porcentuales
            for (let i = 1; i < this.periods.length; i++) {
                const prevData = this.fronterizosData.find(row => 
                    row.Municipio === municipio && 
                    row.Entidad === estado && 
                    row.Periodo === this.periods[i-1]
                );
                
                const currData = this.fronterizosData.find(row => 
                    row.Municipio === municipio && 
                    row.Entidad === estado && 
                    row.Periodo === this.periods[i]
                );
                
                const prevValue = prevData ? (parseFloat(prevData.Total) || 0) : 0;
                const currValue = currData ? (parseFloat(currData.Total) || 0) : 0;
                
                let change = 0;
                if (prevValue > 0) {
                    change = ((currValue - prevValue) / prevValue) * 100;
                } else if (currValue > 0) {
                    change = 100; // Nuevo caso
                }
                
                const td = document.createElement('td');
                td.style.textAlign = 'center';
                
                if (change === 0) {
                    td.textContent = '0%';
                    td.style.color = '#6c757d';
                } else {
                    td.textContent = (change > 0 ? '+' : '') + change.toFixed(0) + '%';
                    
                    if (change > 0) {
                        td.style.color = '#dc3545';
                        td.style.fontWeight = 'bold';
                        if (change > 100) {
                            td.style.backgroundColor = '#ffebee';
                        }
                    } else {
                        td.style.color = '#28a745';
                    }
                }
                
                tr.appendChild(td);
            }
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        
        container.appendChild(tableContainer);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando spillover enhanced...');
    
    // Inicializar directamente después de un delay
    setTimeout(() => {
        console.log('Iniciando análisis de spillover mejorado...');
        try {
            window.spilloverEnhanced = new SpilloverEnhancedAnalysis();
            window.spilloverEnhanced.init();
        } catch (error) {
            console.error('Error creando SpilloverEnhancedAnalysis:', error);
        }
    }, 6000); // Esperar 6 segundos para que otros scripts terminen
});