// Mapa choropleth de municipios de Sinaloa con shapefiles

class SinaloaChoroplethMap {
    constructor() {
        this.map = null;
        this.municipalData = null;
        this.geojsonLayer = null;
        this.periods = [
            'Enero 2024', 'Febrero 2024', 'Marzo 2024', 'Abril 2024', 'Mayo 2024', 'Junio 2024', 'Julio 2024',
            'Agosto 2024', 'Septiembre 2024', 'Octubre 2024', 'Noviembre 2024', 'Diciembre 2024',
            'Enero 2025', 'Febrero 2025', 'Marzo 2025', 'Abril 2025', 'Mayo 2025', 'Junio 2025', 'Julio 2025'
        ];
        this.geojsonData = null;
    }

    async init() {
        console.log('Inicializando mapa choropleth de Sinaloa...');
        
        try {
            await this.loadData();
            await this.loadGeoJSON();
            this.initializeMap();
            this.initializeControls();
            this.updateMap();
            this.createLegend();
        } catch (error) {
            console.error('Error inicializando mapa choropleth:', error);
        }
    }

    async loadData() {
        console.log('Cargando datos municipales...');
        
        const response = await fetch('data/violencia_homicida_sinaloa_municipal_2024_2025.csv');
        const text = await response.text();
        
        // Parse CSV
        const lines = text.trim().split('\\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        this.municipalData = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            const values = lines[i].split(',');
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index] ? values[index].trim() : '';
            });
            
            this.municipalData.push(row);
        }
        
        console.log(`Datos municipales cargados: ${this.municipalData.length} registros`);
    }

    async loadGeoJSON() {
        console.log('Cargando GeoJSON de municipios...');
        
        const response = await fetch('data/sinaloa_municipios_simplified.geojson');
        this.geojsonData = await response.json();
        
        console.log(`GeoJSON cargado: ${this.geojsonData.features.length} municipios`);
        
        // Mostrar nombres de municipios en el GeoJSON
        console.log('Municipios en GeoJSON:');
        this.geojsonData.features.forEach((feature, index) => {
            console.log(`  ${index + 1}. ${feature.properties.nom_mun}`);
        });
    }

    initializeMap() {
        const mapElement = document.getElementById('sinaloa-map');
        if (!mapElement) {
            console.error('Elemento del mapa no encontrado');
            return;
        }

        // Verificar si el mapa ya está inicializado
        if (mapElement._leaflet_id) {
            console.log('Mapa ya inicializado, reutilizando...');
            return;
        }

        this.map = L.map('sinaloa-map').setView([25.0, -107.5], 8);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        console.log('Mapa choropleth inicializado');
    }

    initializeControls() {
        const crimeSelector = document.getElementById('crime-type-selector');
        const timeSlider = document.getElementById('time-slider');
        const timeDisplay = document.getElementById('time-display');

        if (crimeSelector) {
            crimeSelector.addEventListener('change', () => this.updateMap());
        }

        if (timeSlider && timeDisplay) {
            timeSlider.addEventListener('input', (e) => {
                const periodIndex = parseInt(e.target.value);
                timeDisplay.textContent = this.periods[periodIndex];
                this.updateMap();
            });
        }

        console.log('Controles choropleth inicializados');
    }

    updateMap() {
        if (!this.map || !this.municipalData || !this.geojsonData) {
            console.log('Mapa, datos o GeoJSON no disponibles');
            return;
        }

        const crimeType = document.getElementById('crime-type-selector')?.value || 'Total';
        const periodIndex = parseInt(document.getElementById('time-slider')?.value || '0');
        const selectedPeriod = this.periods[periodIndex];

        console.log('Actualizando mapa choropleth:', { crimeType, selectedPeriod });

        // Filtrar datos del período
        const periodData = this.municipalData.filter(row => row.Periodo === selectedPeriod);
        console.log(`Datos del período: ${periodData.length} registros`);

        // Crear un mapa de datos por municipio
        const dataByMunicipality = {};
        periodData.forEach(row => {
            const municipio = this.normalizeMunicipalityName(row.Municipio);
            const value = parseFloat(row[crimeType]) || 0;
            dataByMunicipality[municipio] = {
                value: value,
                data: row
            };
        });

        // Calcular valores máximos y mínimos
        const values = Object.values(dataByMunicipality).map(item => item.value);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values.filter(v => v > 0));

        console.log(`Rango de valores: ${minValue} - ${maxValue}`);

        // Remover capa anterior si existe
        if (this.geojsonLayer) {
            this.map.removeLayer(this.geojsonLayer);
        }

        // Crear nueva capa GeoJSON
        this.geojsonLayer = L.geoJSON(this.geojsonData, {
            style: (feature) => this.getFeatureStyle(feature, dataByMunicipality, maxValue),
            onEachFeature: (feature, layer) => this.onEachFeature(feature, layer, dataByMunicipality, crimeType, selectedPeriod)
        }).addTo(this.map);

        // Ajustar vista al contenido
        this.map.fitBounds(this.geojsonLayer.getBounds());

        // Actualizar tabla
        this.updateTable(periodData, selectedPeriod, crimeType);
    }

    normalizeMunicipalityName(name) {
        // Normalizar nombres de municipios para hacer match entre datos y GeoJSON
        return name.trim()
            .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
            .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
            .toLowerCase();
    }

    getFeatureStyle(feature, dataByMunicipality, maxValue) {
        const municipio = this.normalizeMunicipalityName(feature.properties.nom_mun);
        const municipalData = dataByMunicipality[municipio];
        
        let fillColor = '#cccccc'; // Gris por defecto
        let fillOpacity = 0.3;
        
        if (municipalData && municipalData.value > 0) {
            const intensity = maxValue > 0 ? municipalData.value / maxValue : 0;
            fillColor = this.getColorByIntensity(intensity);
            fillOpacity = 0.7;
        }

        return {
            fillColor: fillColor,
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: fillOpacity
        };
    }

    getColorByIntensity(intensity) {
        // Gradiente de colores para el choropleth
        if (intensity >= 0.8) return '#800026'; // Rojo muy oscuro
        if (intensity >= 0.6) return '#BD0026'; // Rojo oscuro
        if (intensity >= 0.4) return '#E31A1C'; // Rojo
        if (intensity >= 0.2) return '#FC4E2A'; // Naranja rojo
        if (intensity > 0) return '#FD8D3C';    // Naranja
        return '#cccccc'; // Gris
    }

    onEachFeature(feature, layer, dataByMunicipality, crimeType, selectedPeriod) {
        const municipio = feature.properties.nom_mun;
        const municipioNorm = this.normalizeMunicipalityName(municipio);
        const municipalData = dataByMunicipality[municipioNorm];

        // Hover effects
        layer.on({
            mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 5,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.9
                });
                layer.bringToFront();
            },
            mouseout: (e) => {
                this.geojsonLayer.resetStyle(e.target);
            },
            click: (e) => {
                this.map.fitBounds(e.target.getBounds());
            }
        });

        // Popup
        let popupContent = `
            <div style="font-family: Arial, sans-serif;">
                <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${municipio}</h4>
                <p style="margin: 5px 0;"><strong>Período:</strong> ${selectedPeriod}</p>
                <hr style="margin: 10px 0;">
        `;

        if (municipalData) {
            const data = municipalData.data;
            popupContent += `
                <p style="margin: 5px 0; color: #e74c3c; font-size: 16px;"><strong>${crimeType}: ${municipalData.value}</strong></p>
                <p style="margin: 5px 0;">Violencia homicida total: ${data.Total}</p>
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
    }

    createLegend() {
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = (map) => {
            const div = L.DomUtil.create('div', 'info legend');
            const grades = [0, 0.2, 0.4, 0.6, 0.8];
            const colors = ['#cccccc', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];

            div.innerHTML = '<h4>Intensidad</h4>';

            for (let i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + colors[i + 1] + '; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i> ' +
                    (grades[i + 1] ? Math.round(grades[i] * 100) + '% &ndash; ' + Math.round(grades[i + 1] * 100) + '%<br>' : Math.round(grades[i] * 100) + '%+');
            }

            return div;
        };

        legend.addTo(this.map);
    }

    updateTable(data, period, crimeType) {
        const container = document.getElementById('tabla-municipal-sinaloa');
        const subtitle = document.getElementById('municipal-table-subtitle');
        
        if (!container) return;

        if (subtitle) {
            subtitle.textContent = `Datos de ${period} - ${crimeType}`;
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
                tr.appendChild(td);
            });

            // Destacar top 3
            if (index < 3) {
                tr.style.backgroundColor = '#fff3cd';
            }

            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);

        container.innerHTML = '';
        container.appendChild(table);
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que se cargue todo
    setTimeout(() => {
        const choroplethMap = new SinaloaChoroplethMap();
        choroplethMap.init();
    }, 3000);
});