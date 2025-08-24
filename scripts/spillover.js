// Módulo para análisis de spillover
class SpilloverAnalysis {
    constructor() {
        this.spilloverData = null;
        this.tableData = null;
        this.currentPeriod = 'Enero 2024';
        this.currentDelito = 'Total';
        this.currentVista = 'absolutos';
        this.periodos = [];
        this.map = null;
        this.markers = [];
        this.initPeriodos();
        this.initEstadosCoords();
    }

    initEstadosCoords() {
        // Coordenadas aproximadas de las capitales de los estados
        this.estadosCoords = {
            'Sinaloa': [-107.3894, 25.0000],
            'Sonora': [-110.9559, 29.0892],
            'Chihuahua': [-106.0691, 28.6353],
            'Durango': [-104.6589, 24.0277],
            'Nayarit': [-104.8455, 21.7514]
        };
    }

    initPeriodos() {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        // 2024 completo
        meses.forEach(mes => {
            this.periodos.push(`${mes} 2024`);
        });
        
        // 2025 hasta junio
        for (let i = 0; i < 6; i++) {
            this.periodos.push(`${meses[i]} 2025`);
        }
    }

    async init() {
        try {
            await this.loadData();
            this.initMap();
            this.setupControls();
            this.updateVisualization();
            this.generateTable();
        } catch (error) {
            console.error('Error inicializando spillover:', error);
        }
    }

    initMap() {
        // Usar Leaflet con OpenStreetMap (gratuito, sin token)
        this.map = L.map('mapa-spillover').setView([26.0, -107.0], 6);
        
        // Agregar capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 8,
            minZoom: 5
        }).addTo(this.map);

        // Inicializar markers después de que el mapa esté listo
        setTimeout(() => {
            this.updateMapMarkers();
        }, 500);
    }

    async loadData() {
        // Cargar datos JSON
        const response1 = await fetch('data/spillover_data.json');
        this.spilloverData = await response1.json();
        
        // Cargar tabla CSV
        const response2 = await fetch('data/spillover_table.csv');
        const text = await response2.text();
        this.tableData = this.parseCSV(text);
        
        console.log('Datos de spillover cargados');
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

    setupControls() {
        const slider = document.getElementById('mes-slider');
        const periodoDisplay = document.getElementById('periodo-display');
        const delitoSelector = document.getElementById('delito-selector');
        const vistaSelector = document.getElementById('vista-selector');

        // Configurar slider
        slider.max = this.periodos.length - 1;
        
        slider.addEventListener('input', (e) => {
            const index = parseInt(e.target.value);
            this.currentPeriod = this.periodos[index];
            periodoDisplay.textContent = this.currentPeriod;
            this.updateVisualization();
        });

        // Configurar selector de delito
        delitoSelector.addEventListener('change', (e) => {
            this.currentDelito = e.target.value;
            this.updateVisualization();
        });

        // Configurar selector de vista
        vistaSelector.addEventListener('change', (e) => {
            this.currentVista = e.target.value;
            this.updateVisualization();
        });
    }

    updateVisualization() {
        this.updateMapMarkers();
        this.updateTableFilter();
    }

    updateMapMarkers() {
        if (!this.map) return;

        // Limpiar markers existentes
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        const estados = ['Sinaloa', 'Sonora', 'Chihuahua', 'Durango', 'Nayarit'];
        
        // Obtener datos del período actual
        const [mes, año] = this.currentPeriod.split(' ');
        const añoNum = parseInt(año);
        
        const valores = [];
        
        estados.forEach(estado => {
            let valor = 0;
            let variacion = 0;
            
            if (this.spilloverData[estado] && 
                this.spilloverData[estado][añoNum] && 
                this.spilloverData[estado][añoNum][mes]) {
                
                valor = this.spilloverData[estado][añoNum][mes][this.currentDelito] || 0;
                variacion = this.calculateVariacion(estado, mes, añoNum);
            }
            
            valores.push({ estado, valor, variacion });
        });

        // Determinar rangos para colores y tamaños
        const maxValor = Math.max(...valores.map(v => Math.abs(v.valor)));
        
        valores.forEach(({ estado, valor, variacion }) => {
            const coords = this.estadosCoords[estado];
            if (!coords) return;

            // Determinar tamaño y color
            const size = this.getMarkerSize(Math.abs(valor), maxValor);
            const color = this.getMarkerColor(valor, maxValor);
            
            // Crear icono personalizado
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: `
                    <div style="
                        width: ${size}px;
                        height: ${size}px;
                        background-color: ${color};
                        border: 3px solid white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        color: white;
                        font-size: ${Math.max(10, size/4)}px;
                        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    ">
                        ${this.currentVista === 'absolutos' ? 
                            Math.round(valor).toString() : 
                            valor.toFixed(0) + '%'}
                    </div>
                `,
                iconSize: [size, size],
                iconAnchor: [size/2, size/2]
            });

            // Crear popup content
            const popupContent = this.createPopupContent(estado, valor, variacion);

            // Crear marker con Leaflet
            const marker = L.marker([coords[1], coords[0]], { icon: customIcon })
                .addTo(this.map)
                .bindPopup(popupContent);

            this.markers.push(marker);
        });
    }

    getMarkerSize(valor, maxValor) {
        const minSize = 30;
        const maxSize = 80;
        const ratio = maxValor > 0 ? valor / maxValor : 0;
        return minSize + (maxSize - minSize) * ratio;
    }

    getMarkerColor(valor, maxValor) {
        if (this.currentVista === 'variacion') {
            if (valor > 50) return '#8e44ad';
            if (valor > 20) return '#e74c3c';
            if (valor > 0) return '#e67e22';
            if (valor > -20) return '#f39c12';
            return '#27ae60';
        } else {
            const ratio = maxValor > 0 ? Math.abs(valor) / maxValor : 0;
            if (ratio > 0.8) return '#8e44ad';
            if (ratio > 0.6) return '#e74c3c';
            if (ratio > 0.4) return '#e67e22';
            if (ratio > 0.2) return '#f39c12';
            return '#27ae60';
        }
    }

    createPopupContent(estado, valor, variacion) {
        const delitoLabel = this.currentDelito === 'Total' ? 'Total violencia homicida' : this.currentDelito;
        const variacionClass = variacion >= 0 ? 'positiva' : 'negativa';
        const variacionSymbol = variacion >= 0 ? '+' : '';
        
        return `
            <div class="popup-content">
                <h4>${estado}</h4>
                <div class="label">${delitoLabel}</div>
                <div class="metric">${this.formatValue(valor)}</div>
                <div class="label">Período: ${this.currentPeriod}</div>
                ${this.currentVista === 'absolutos' ? 
                    `<div class="variacion ${variacionClass}">Variación: ${variacionSymbol}${variacion.toFixed(1)}%</div>` : 
                    ''
                }
            </div>
        `;
    }

    calculateVariacion(estado, mes, año) {
        // Calcular variación respecto al mismo mes del año anterior o mes anterior
        let valorActual = 0;
        let valorAnterior = 0;
        
        if (this.spilloverData[estado] && 
            this.spilloverData[estado][año] && 
            this.spilloverData[estado][año][mes]) {
            valorActual = this.spilloverData[estado][año][mes][this.currentDelito] || 0;
        }
        
        // Si es 2025, comparar con mismo mes de 2024
        if (año === 2025) {
            if (this.spilloverData[estado] && 
                this.spilloverData[estado][2024] && 
                this.spilloverData[estado][2024][mes]) {
                valorAnterior = this.spilloverData[estado][2024][mes][this.currentDelito] || 0;
            }
        } else {
            // Si es 2024, comparar con mes anterior (simplificado)
            const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const mesIndex = meses.indexOf(mes);
            
            if (mesIndex > 0) {
                const mesAnterior = meses[mesIndex - 1];
                if (this.spilloverData[estado] && 
                    this.spilloverData[estado][año] && 
                    this.spilloverData[estado][año][mesAnterior]) {
                    valorAnterior = this.spilloverData[estado][año][mesAnterior][this.currentDelito] || 0;
                }
            }
        }
        
        if (valorAnterior === 0) return 0;
        return ((valorActual - valorAnterior) / valorAnterior * 100);
    }

    getIntensidadColor(valor, maxValor) {
        const absValor = Math.abs(valor);
        const ratio = maxValor > 0 ? absValor / maxValor : 0;
        
        if (this.currentVista === 'variacion') {
            // Para variaciones, usar colores basados en el signo
            if (valor > 50) return 'intensidad-muy-alta';
            if (valor > 20) return 'intensidad-alta';
            if (valor > 0) return 'intensidad-media';
            if (valor > -20) return 'intensidad-baja';
            return 'intensidad-muy-baja';
        } else {
            // Para valores absolutos
            if (ratio > 0.8) return 'intensidad-muy-alta';
            if (ratio > 0.6) return 'intensidad-alta';
            if (ratio > 0.4) return 'intensidad-media';
            if (ratio > 0.2) return 'intensidad-baja';
            return 'intensidad-muy-baja';
        }
    }

    formatValue(valor) {
        if (this.currentVista === 'variacion') {
            return valor.toFixed(1) + '%';
        } else {
            return Math.round(valor).toLocaleString();
        }
    }

    updateTableFilter() {
        // Filtrar tabla por período actual si es necesario
        this.generateTable();
    }

    generateTable() {
        const container = document.getElementById('tabla-spillover');
        if (!container || !this.tableData) return;

        // Filtrar datos por período actual
        const [mes, año] = this.currentPeriod.split(' ');
        const filteredData = this.tableData.filter(row => 
            row.Mes === mes && row.Año === año
        );

        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['Estado', 'Feminicidio', 'Homicidio culposo', 'Homicidio doloso', 'Otros delitos contra la vida', 'Total'];
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Body
        const tbody = document.createElement('tbody');
        filteredData.forEach(row => {
            const tr = document.createElement('tr');
            
            // Estado
            const tdEstado = document.createElement('td');
            tdEstado.textContent = row.Estado;
            tdEstado.style.textAlign = 'left';
            tdEstado.style.fontWeight = '500';
            tr.appendChild(tdEstado);
            
            // Delitos
            const delitos = ['Feminicidio', 'Homicidio culposo', 'Homicidio doloso', 
                           'Otros delitos que atentan contra la vida y la integridad corporal', 'Total'];
            
            delitos.forEach(delito => {
                const td = document.createElement('td');
                const valor = parseInt(row[delito]) || 0;
                td.textContent = valor.toLocaleString();
                td.style.textAlign = 'center';
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        
        container.innerHTML = '';
        container.appendChild(table);
    }
}

// Instancia global
window.spilloverAnalysis = new SpilloverAnalysis();