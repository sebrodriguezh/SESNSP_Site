// Funciones específicas para el mapa municipal de Sinaloa

class SinaloaMunicipalMap {
    constructor() {
        this.map = null;
        this.municipalData = null;
        this.periods = [
            'Enero 2024', 'Febrero 2024', 'Marzo 2024', 'Abril 2024', 'Mayo 2024', 'Junio 2024', 'Julio 2024',
            'Agosto 2024', 'Septiembre 2024', 'Octubre 2024', 'Noviembre 2024', 'Diciembre 2024',
            'Enero 2025', 'Febrero 2025', 'Marzo 2025', 'Abril 2025', 'Mayo 2025', 'Junio 2025', 'Julio 2025'
        ];
    }

    async init() {
        console.log('Inicializando mapa municipal de Sinaloa...');
        
        try {
            await this.loadData();
            this.initializeMap();
            this.initializeControls();
            this.updateMap();
        } catch (error) {
            console.error('Error inicializando mapa:', error);
        }
    }

    async loadData() {
        console.log('Cargando datos municipales...');
        
        const response = await fetch('data/violencia_homicida_sinaloa_municipal_2024_2025.csv');
        const text = await response.text();
        
        // Parse CSV simple
        const lines = text.trim().split('\n');
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
        
        console.log(`Datos cargados: ${this.municipalData.length} registros`);
        console.log('Headers:', headers);
        console.log('Sample data:', this.municipalData.slice(0, 3));
        
        // Verificar períodos
        const periods = [...new Set(this.municipalData.map(row => row.Periodo))];
        console.log('Períodos disponibles:', periods);
    }

    initializeMap() {
        if (typeof L === 'undefined') {
            console.error('Leaflet no está disponible');
            return;
        }

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

        console.log('Mapa inicializado');
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

        console.log('Controles inicializados');
    }

    updateMap() {
        if (!this.map || !this.municipalData) {
            console.log('Mapa o datos no disponibles');
            return;
        }

        const crimeType = document.getElementById('crime-type-selector')?.value || 'Homicidio doloso';
        const periodIndex = parseInt(document.getElementById('time-slider')?.value || '0');
        const selectedPeriod = this.periods[periodIndex];

        console.log('Actualizando mapa:', { crimeType, selectedPeriod });

        // Filtrar datos del período
        const periodData = this.municipalData.filter(row => row.Periodo === selectedPeriod);
        console.log(`Datos del período: ${periodData.length} registros`);

        if (periodData.length === 0) {
            console.log('No hay datos para el período:', selectedPeriod);
            return;
        }

        // Limpiar marcadores anteriores
        this.map.eachLayer(layer => {
            if (layer instanceof L.CircleMarker || layer instanceof L.Circle) {
                this.map.removeLayer(layer);
            }
        });

        // Coordenadas de municipios
        const coords = this.getMunicipalCoordinates();

        // Calcular valores máximos para el delito seleccionado
        const selectedValues = periodData.map(row => parseFloat(row[crimeType]) || 0);
        const maxSelected = Math.max(...selectedValues);
        const minSelected = Math.min(...selectedValues.filter(v => v > 0));

        console.log(`Valores para ${crimeType}:`, { min: minSelected, max: maxSelected });

        // Crear marcadores
        periodData.forEach(row => {
            const municipio = row.Municipio;
            const municipioCoords = coords[municipio];
            
            if (!municipioCoords) {
                console.log('Coordenadas no encontradas para:', municipio);
                return;
            }

            const selectedCases = parseFloat(row[crimeType]) || 0;
            const totalCases = parseFloat(row.Total) || 0;

            // Solo crear marcador si hay casos del delito seleccionado
            if (selectedCases === 0) {
                // Crear marcador pequeño y gris para municipios sin casos
                const emptyMarker = L.circleMarker(municipioCoords, {
                    radius: 4,
                    fillColor: '#cccccc',
                    color: '#999999',
                    weight: 1,
                    opacity: 0.7,
                    fillOpacity: 0.5
                }).addTo(this.map);

                emptyMarker.bindPopup(`
                    <div style="font-family: Arial, sans-serif;">
                        <h4 style="margin: 0 0 10px 0; color: #666;">${municipio}</h4>
                        <p style="margin: 5px 0;"><strong>Período:</strong> ${selectedPeriod}</p>
                        <p style="margin: 5px 0; color: #666;">Sin casos de ${crimeType}</p>
                        <p style="margin: 5px 0;">Total violencia homicida: ${totalCases}</p>
                    </div>
                `);
                return;
            }

            // Calcular tamaño basado en los casos
            const minSize = 8;
            const maxSize = 30;
            let markerSize;
            
            if (maxSelected === minSelected) {
                markerSize = (minSize + maxSize) / 2;
            } else {
                const ratio = (selectedCases - minSelected) / (maxSelected - minSelected);
                markerSize = minSize + (ratio * (maxSize - minSize));
            }

            // Color basado en intensidad relativa
            const intensity = maxSelected > 0 ? selectedCases / maxSelected : 0;
            const markerColor = this.getCrimeColor(intensity);
            
            // Crear marcador
            const marker = L.circleMarker(municipioCoords, {
                radius: markerSize,
                fillColor: markerColor,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(this.map);

            // Popup con información completa
            const popupContent = `
                <div style="font-family: Arial, sans-serif;">
                    <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${municipio}</h4>
                    <p style="margin: 5px 0;"><strong>Período:</strong> ${selectedPeriod}</p>
                    <hr style="margin: 10px 0;">
                    <p style="margin: 5px 0; color: #e74c3c; font-size: 16px;"><strong>${crimeType}: ${selectedCases}</strong></p>
                    <p style="margin: 5px 0;">Violencia homicida total: ${totalCases}</p>
                    <hr style="margin: 10px 0;">
                    <div style="font-size: 12px; color: #666;">
                        <p style="margin: 2px 0;">• Homicidio doloso: ${row['Homicidio doloso'] || 0}</p>
                        <p style="margin: 2px 0;">• Homicidio culposo: ${row['Homicidio culposo'] || 0}</p>
                        <p style="margin: 2px 0;">• Feminicidio: ${row['Feminicidio'] || 0}</p>
                        <p style="margin: 2px 0;">• Otros delitos: ${row['Otros delitos que atentan contra la vida y la integridad corporal'] || 0}</p>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            
            console.log(`${municipio}: ${selectedCases} casos, tamaño: ${markerSize.toFixed(1)}, color: ${markerColor}`);
        });

        // Actualizar tabla
        this.updateTable(periodData, selectedPeriod);
    }

    getCrimeColor(intensity) {
        // Gradiente simple y claro para el delito seleccionado
        if (intensity >= 0.8) return '#8B0000'; // Rojo muy oscuro - Muy alto
        if (intensity >= 0.6) return '#DC143C'; // Rojo oscuro - Alto
        if (intensity >= 0.4) return '#FF4500'; // Naranja rojo - Medio-alto
        if (intensity >= 0.2) return '#FF8C00'; // Naranja - Medio
        if (intensity > 0) return '#FFA500';    // Naranja claro - Bajo
        return '#cccccc'; // Gris - Sin casos
    }

    getMunicipalCoordinates() {
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
            'Juan José Ríos': [25.75, -108.8],
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

    updateTable(data, period) {
        const container = document.getElementById('tabla-municipal-sinaloa');
        const subtitle = document.getElementById('municipal-table-subtitle');
        
        if (!container) return;

        if (subtitle) {
            subtitle.textContent = `Datos de ${period}`;
        }

        // Ordenar por el delito seleccionado si no es "Total", sino por total
        const crimeType = document.getElementById('crime-type-selector')?.value || 'Total';
        const sortField = crimeType === 'Total' ? 'Total' : crimeType;
        const sortedData = [...data].sort((a, b) => (parseFloat(b[sortField]) || 0) - (parseFloat(a[sortField]) || 0));

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
        const municipalMap = new SinaloaMunicipalMap();
        municipalMap.init();
    }, 2000);
});