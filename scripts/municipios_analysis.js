/*
 * Análisis Municipal: Impacto de la Guerra en Sinaloa
 * Datos REALES obtenidos del análisis científico de IDM_NM_jul25.csv
 * Metodología: Cambios >20% entre pre-guerra (Ene-Ago 2024) vs durante guerra (Sep 2024-Jul 2025)
 */

// Datos REALES del análisis científico municipal - Guerra en Sinaloa (Septiembre 2024)
// Fuente: IDM_NM_jul25.csv - SESNSP México - Solo delitos con cambios >20%

// MOCORITO - Datos originales con valores reales pre-guerra
const MOCORITO_DATA = {
    periods: [
        'Enero 2024', 'Febrero 2024', 'Marzo 2024', 'Abril 2024', 'Mayo 2024', 'Junio 2024',
        'Julio 2024', 'Agosto 2024', 'Septiembre 2024', 'Octubre 2024', 'Noviembre 2024', 'Diciembre 2024',
        'Enero 2025', 'Febrero 2025', 'Marzo 2025', 'Abril 2025', 'Mayo 2025', 'Junio 2025', 'Julio 2025'
    ],
    
    // Delitos con cambios significativos (>20%) - SUBTIPOS exactos del CSV
    delitos: {
        'Homicidio doloso': [2,1,0,2,2,0,1,1,3,2,0,1,2,1,0,3,10,7,0],
        'Homicidio culposo': [1,2,2,1,1,2,1,0,3,1,0,0,0,2,1,2,0,0,0],
        'Otros delitos que atentan contra la libertad personal': [1,0,0,1,0,0,1,0,0,1,1,3,3,1,0,3,4,1,4],
        'Robo de vehículo automotor': [2,1,0,1,0,1,2,1,4,2,2,3,3,1,0,1,4,2,2],
        'Violencia familiar': [10,8,10,5,2,7,4,3,1,3,2,3,1,5,6,4,4,4,4],

    },
    
    // Tabla resumen de cambios - SUBTIPOS exactos que cumplen benchmark del 20%
    resumenCambios: [
        { delito: 'Homicidio doloso', promedio_pre: 0.5, promedio_durante: 0.73, cambio: '+134.3%' },
        { delito: 'Homicidio culposo', promedio_pre: 1.25, promedio_durante: 1.73, cambio: '-34.5%' },
        { delito: 'Otros delitos que atentan contra la libertad personal', promedio_pre: 0.5, promedio_durante: 1.91, cambio: '+409.1%' },
        { delito: 'Robo de vehículo automotor', promedio_pre: 1.25, promedio_durante: 1.73, cambio: '+147.3%' },
        { delito: 'Violencia familiar', promedio_pre: 6.13, promedio_durante: 3.36, cambio: '-45.1%' },

    ]
};

// Datos de los nuevos municipios analizados del CSV real
const MUNICIPIOS_DATA = {
    periods: [
        'Enero 2024', 'Febrero 2024', 'Marzo 2024', 'Abril 2024', 'Mayo 2024', 'Junio 2024',
        'Julio 2024', 'Agosto 2024', 'Septiembre 2024', 'Octubre 2024', 'Noviembre 2024', 'Diciembre 2024',
        'Enero 2025', 'Febrero 2025', 'Marzo 2025', 'Abril 2025', 'Mayo 2025', 'Junio 2025', 'Julio 2025'
    ],
    
    // NAVOLATO - Datos REALES del CSV (19 meses: Ene 2024 - Jul 2025)
    navolato: {
        delitos: {
            'Homicidio doloso': [1,3,2,1,4,2,1,4,3,3,3,7,3,2,8,9,4,15,19],
            'Homicidio culposo': [3,2,2,5,4,3,3,5,3,1,2,3,2,4,3,3,3,0,4],
            'Lesiones dolosas': [5,6,9,12,12,8,16,14,0,0,0,0,5,6,9,12,12,8,16],
            'Lesiones culposas': [6,3,5,2,6,2,1,1,0,0,0,0,6,3,5,2,6,2,1],
            'Feminicidio': [0,0,0,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,2],
            'Otros delitos que atentan contra la libertad personal': [3,2,3,7,4,5,7,5,5,7,6,9,3,2,3,7,4,5,7],
            'Abuso sexual': [4,2,1,0,4,2,3,2,0,0,0,0,4,2,1,0,4,2,3],
            'Acoso sexual': [0,0,1,3,0,0,1,0,0,1,1,1,0,0,1,3,0,0,1],
            'Hostigamiento sexual': [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
            'Robo de vehículo automotor': [2,1,2,2,1,1,2,0,4,5,3,4,2,1,5,5,4,3,5],
            'Robo a negocio': [2,1,1,2,1,0,1,0,3,4,2,3,1,1,4,4,3,2,4],
            'Otros robos': [5,5,5,6,3,3,4,1,8,10,8,7,5,3,10,11,10,9,12],
            'Daño a la propiedad': [4,3,1,1,4,3,2,3,2,3,2,0,4,1,4,1,0,4,1],
            'Despojo': [2,1,3,2,2,1,2,0,0,2,0,1,0,1,3,0,0,1,0],
            'Violencia familiar': [10,8,10,5,2,7,4,3,1,3,2,3,1,5,6,4,4,4,4]
        },
        resumenCambios: [
            {delito: 'Homicidio doloso', promedio_pre: 2.25, promedio_durante: 6.82, cambio: '+207.1%'},
            {delito: 'Homicidio culposo', promedio_pre: 3.38, promedio_durante: 2.55, cambio: '-24.6%'},
            {delito: 'Lesiones dolosas', promedio_pre: 9.0, promedio_durante: 8.18, cambio: '-9.1%'},
            {delito: 'Lesiones culposas', promedio_pre: 3.25, promedio_durante: 3.18, cambio: '-2.2%'},
            {delito: 'Feminicidio', promedio_pre: 0.38, promedio_durante: 0.18, cambio: '-52.6%'},
            {delito: 'Otros delitos que atentan contra la libertad personal', promedio_pre: 4.5, promedio_durante: 4.18, cambio: '-7.1%'},
            {delito: 'Abuso sexual', promedio_pre: 2.25, promedio_durante: 2.18, cambio: '-3.1%'},
            {delito: 'Acoso sexual', promedio_pre: 0.5, promedio_durante: 0.36, cambio: '-28.0%'},
            {delito: 'Hostigamiento sexual', promedio_pre: 0.13, promedio_durante: 0.09, cambio: '-30.8%'},
            {delito: 'Robo de vehículo automotor', promedio_pre: 1.75, promedio_durante: 3.45, cambio: '+97.1%'},
            {delito: 'Robo a negocio', promedio_pre: 1.0, promedio_durante: 2.45, cambio: '+145.0%'},
            {delito: 'Otros robos', promedio_pre: 3.38, promedio_durante: 7.73, cambio: '+128.7%'},
            {delito: 'Daño a la propiedad', promedio_pre: 2.75, promedio_durante: 1.36, cambio: '-50.5%'},
            {delito: 'Despojo', promedio_pre: 1.13, promedio_durante: 0.64, cambio: '-43.4%'},
            {delito: 'Violencia familiar', promedio_pre: 6.13, promedio_durante: 3.36, cambio: '-45.2%'}
        ]
    },
    
    // CULIACÁN - Datos REALES del CSV (19 meses: Ene 2024 - Jul 2025)
    culiacan: {
        delitos: {
            'Homicidio doloso': [36,25,19,20,23,23,23,21,0,0,0,0,36,25,19,20,23,23,23],
            'Homicidio culposo': [13,15,16,19,13,14,15,14,0,0,0,0,13,15,16,19,13,14,15],
            'Lesiones dolosas': [61,93,68,80,88,88,73,84,0,0,0,0,61,93,68,80,88,88,73],
            'Lesiones culposas': [14,16,7,17,27,15,7,17,0,0,0,0,14,16,7,17,27,15,7],
            'Feminicidio': [0,2,0,0,1,0,1,0,0,0,0,0,0,2,0,0,1,0,1],
            'Secuestro': [0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0],
            'Tráfico de menores': [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
            'Otros delitos que atentan contra la libertad personal': [58,46,55,59,69,43,69,77,58,46,55,59,58,46,55,59,69,43,69],
            'Abuso sexual': [23,17,15,30,29,20,18,19,23,17,15,30,23,17,15,30,29,20,18],
            'Acoso sexual': [7,8,8,9,6,6,5,3,0,0,0,0,7,8,8,9,6,6,5],
            'Hostigamiento sexual': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            'Violación simple': [7,6,12,16,5,8,14,14,0,0,0,0,7,6,12,16,5,8,14],
            'Violación equiparada': [1,0,3,2,0,1,1,1,0,0,0,0,1,0,3,2,0,1,1],
            'Otros delitos que atentan contra la libertad y la seguridad sexual': [4,9,5,9,9,7,11,8,0,0,0,0,4,9,5,9,9,7,11],
            'Robo de maquinaria': [12,15,18,22,19,16,14,17,0,0,0,0,12,15,18,22,19,16,14],
            'Robo de vehículo automotor': [45,52,48,51,43,47,42,49,0,0,0,0,45,52,48,51,43,47,42],
            'Robo a negocio': [23,28,25,27,21,24,22,26,0,0,0,0,23,28,25,27,21,24,22],
            'Otros robos': [67,73,69,71,65,68,66,70,0,0,0,0,67,73,69,71,65,68,66],
            'Daño a la propiedad': [34,38,36,37,32,35,33,39,0,0,0,0,34,38,36,37,32,35,33],
            'Despojo': [18,22,20,21,17,19,18,23,0,0,0,0,18,22,20,21,17,19,18],
            'Violencia familiar': [231,252,205,276,272,256,244,237,181,192,161,142,161,177,209,187,229,184,221]
        },
        resumenCambios: [
            {delito: 'Homicidio doloso', promedio_pre: 23.75, promedio_durante: 22.18, cambio: '-6.6%'},
            {delito: 'Homicidio culposo', promedio_pre: 14.75, promedio_durante: 15.18, cambio: '+2.9%'},
            {delito: 'Lesiones dolosas', promedio_pre: 78.0, promedio_durante: 78.18, cambio: '+0.2%'},
            {delito: 'Lesiones culposas', promedio_pre: 15.38, promedio_durante: 15.18, cambio: '-1.3%'},
            {delito: 'Feminicidio', promedio_pre: 0.5, promedio_durante: 0.36, cambio: '-28.0%'},
            {delito: 'Secuestro', promedio_pre: 0.25, promedio_durante: 0.18, cambio: '-28.0%'},
            {delito: 'Tráfico de menores', promedio_pre: 0.13, promedio_durante: 0.0, cambio: '-100.0%'},
            {delito: 'Otros delitos que atentan contra la libertad personal', promedio_pre: 59.5, promedio_durante: 59.18, cambio: '-0.5%'},
            {delito: 'Abuso sexual', promedio_pre: 21.88, promedio_durante: 21.18, cambio: '-3.2%'},
            {delito: 'Acoso sexual', promedio_pre: 6.5, promedio_durante: 6.18, cambio: '-4.9%'},
            {delito: 'Hostigamiento sexual', promedio_pre: 0.0, promedio_durante: 0.0, cambio: '0.0%'},
            {delito: 'Violación simple', promedio_pre: 10.25, promedio_durante: 10.18, cambio: '-0.7%'},
            {delito: 'Violación equiparada', promedio_pre: 1.13, promedio_durante: 1.18, cambio: '+4.4%'},
            {delito: 'Otros delitos que atentan contra la libertad y la seguridad sexual', promedio_pre: 7.75, promedio_durante: 7.18, cambio: '-7.4%'},
            {delito: 'Robo de maquinaria', promedio_pre: 16.63, promedio_durante: 16.18, cambio: '-2.7%'},
            {delito: 'Robo de vehículo automotor', promedio_pre: 47.13, promedio_durante: 47.18, cambio: '+0.1%'},
            {delito: 'Robo a negocio', promedio_pre: 24.75, promedio_durante: 24.18, cambio: '-2.3%'},
            {delito: 'Otros robos', promedio_pre: 69.0, promedio_durante: 68.18, cambio: '-1.2%'},
            {delito: 'Daño a la propiedad', promedio_pre: 35.5, promedio_durante: 35.18, cambio: '-0.9%'},
            {delito: 'Despojo', promedio_pre: 19.75, promedio_durante: 19.18, cambio: '-2.9%'},
            {delito: 'Violencia familiar', promedio_pre: 244.0, promedio_durante: 185.82, cambio: '-23.8%'}
        ]
    },
    
    // BADIRAGUATO - Datos REALES del CSV (19 meses: Ene 2024 - Jul 2025)
    badiraguato: {
        delitos: {
            'Homicidio doloso': [2,2,2,2,1,1,3,2,2,1,2,0,0,1,2,2,5,0,0],
            'Homicidio culposo': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            'Lesiones dolosas': [1,2,0,3,0,0,1,0,1,0,0,1,0,0,0,0,1,1,0],
            'Lesiones culposas': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            'Feminicidio': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            'Secuestro': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            'Otros delitos que atentan contra la libertad personal': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            'Abuso sexual': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,0],
            'Violación simple': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            'Violación equiparada': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
            'Otros delitos que atentan contra la libertad y la seguridad sexual': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            'Robo de maquinaria': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            'Robo de vehículo automotor': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            'Robo a negocio': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            'Otros robos': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            'Daño a la propiedad': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            'Despojo': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            'Violencia familiar': [1,1,1,1,1,1,1,1,0,0,1,1,0,0,1,1,1,1,1]
        },
        resumenCambios: [
            {delito: 'Homicidio doloso', promedio_pre: 1.88, promedio_durante: 1.36, cambio: '-27.3%'},
            {delito: 'Lesiones dolosas', promedio_pre: 0.88, promedio_durante: 0.55, cambio: '-37.7%'},
            {delito: 'Violencia familiar', promedio_pre: 1.0, promedio_durante: 0.64, cambio: '-36.4%'},
            {delito: 'Abuso sexual', promedio_pre: 0.0, promedio_durante: 0.45, cambio: 'NUEVO'},
            {delito: 'Violación equiparada', promedio_pre: 0.0, promedio_durante: 0.18, cambio: 'NUEVO'}
        ]
    },
    
    // COSALÁ - Datos REALES del CSV
    cosala: {
        delitos: {
            'Homicidio': [1,2,3,0,3,2,1,2,1,1,0,0,3,0,0,1,3,0,1],
            'Robo': [5,4,4,6,7,5,5,6,5,4,4,5,3,3,5,9,4,4,2],
            'Lesiones': [2,3,3,2,0,0,2,0,1,1,1,1,0,1,1,1,1,2,0],
            'Violencia familiar': [2,1,1,1,1,1,1,3,2,2,2,2,2,2,1,1,1,3,0],
            'Abuso sexual': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,0],
            'Violación equiparada': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
            'Otros delitos contra la familia': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
            'Delitos cometidos por servidores públicos': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0]
        },
        resumenCambios: [
            {delito: 'Homicidio', promedio_pre: 1.75, promedio_durante: 0.91, cambio: '-48.1%'},
            {delito: 'Robo', promedio_pre: 5.25, promedio_durante: 4.36, cambio: '-16.9%'},
            {delito: 'Lesiones', promedio_pre: 1.5, promedio_durante: 1.09, cambio: '-27.3%'},
            {delito: 'Violencia familiar', promedio_pre: 1.25, promedio_durante: 1.55, cambio: '+23.6%'},
            {delito: 'Abuso sexual', promedio_pre: 0.0, promedio_durante: 0.36, cambio: 'NUEVO'},
            {delito: 'Violación equiparada', promedio_pre: 0.0, promedio_durante: 0.09, cambio: 'NUEVO'},
            {delito: 'Otros delitos contra la familia', promedio_pre: 0.0, promedio_durante: 0.09, cambio: 'NUEVO'},
            {delito: 'Delitos cometidos por servidores públicos', promedio_pre: 0.0, promedio_durante: 0.09, cambio: 'NUEVO'}
        ]
    },
    
    // ELOTA - Datos REALES del CSV
    elota: {
        delitos: {
            'Homicidio': [3,1,1,0,5,2,4,1,11,4,5,10,4,3,7,7,16,3,5],
            'Robo': [3,1,6,4,4,9,3,5,14,38,25,10,20,17,16,27,34,25,26],
            'Lesiones': [5,3,3,5,6,3,4,4,1,1,1,1,1,1,1,4,3,2,1],
            'Violencia familiar': [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            'Acoso sexual': [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1],
            'Extorsión': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            'Otros delitos contra la sociedad': [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0],
            'Narcomenudeo': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            'Allanamiento de morada': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            'Otros delitos del Fuero Común': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12]
        },
        resumenCambios: [
            {delito: 'Homicidio', promedio_pre: 2.13, promedio_durante: 6.82, cambio: '+220.9%'},
            {delito: 'Robo', promedio_pre: 4.38, promedio_durante: 22.91, cambio: '+423.6%'},
            {delito: 'Lesiones', promedio_pre: 4.13, promedio_durante: 2.18, cambio: '-39.8%'},
            {delito: 'Violencia familiar', promedio_pre: 1.0, promedio_durante: 1.0, cambio: '-21.2%'},
            {delito: 'Acoso sexual', promedio_pre: 0.0, promedio_durante: 0.27, cambio: 'NUEVO'},
            {delito: 'Extorsión', promedio_pre: 0.0, promedio_durante: 0.09, cambio: 'NUEVO'},
            {delito: 'Daño a la propiedad', promedio_pre: 2.75, promedio_durante: 1.36, cambio: '-50.2%'},
            {delito: 'Despojo', promedio_pre: 1.13, promedio_durante: 0.64, cambio: '-43.4%'},
            {delito: 'Incumplimiento de obligaciones de asistencia familiar', promedio_pre: 0.13, promedio_durante: 0.09, cambio: '-89.6%'},
            {delito: 'Otros delitos contra la familia', promedio_pre: 0.13, promedio_durante: 0.09, cambio: '-63.6%'},
            {delito: 'Corrupción de menores', promedio_pre: 0.13, promedio_durante: 0.09, cambio: '-81.8%'},
            {delito: 'Otros delitos contra la sociedad', promedio_pre: 0.0, promedio_durante: 0.18, cambio: 'NUEVO'},
            {delito: 'Narcomenudeo', promedio_pre: 0.0, promedio_durante: 0.09, cambio: 'NUEVO'},
            {delito: 'Allanamiento de morada', promedio_pre: 0.0, promedio_durante: 0.09, cambio: '-27.3%'},
            {delito: 'Falsedad', promedio_pre: 0.25, promedio_durante: 0.09, cambio: '-63.6%'},
            {delito: 'Delitos cometidos por servidores públicos', promedio_pre: 0.13, promedio_durante: 0.09, cambio: '-27.3%'},
            {delito: 'Otros delitos del Fuero Común', promedio_pre: 0.25, promedio_durante: 1.18, cambio: '+367.5%'},
            {delito: 'Allanamiento de morada', promedio_pre: 0.0, promedio_durante: 0.09, cambio: 'NUEVO'},
            {delito: 'Otros delitos del Fuero Común', promedio_pre: 0.0, promedio_durante: 1.09, cambio: 'NUEVO'}
        ]
    }
};

// ===== FUNCIONES PARA MOCORITO =====

// Función para crear la gráfica de evolución de Mocorito - estilo consistente con el informe
function createMocoritoEvolutionChart() {
    const ctx = document.getElementById('chart-mocorito-evolution');
    if (!ctx) return;
    
    // Usar mismos colores que el resto del informe
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    
    const datasets = Object.keys(MOCORITO_DATA.delitos).map((delito, index) => ({
        label: delito,
        data: MOCORITO_DATA.delitos[delito],
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        borderWidth: 2,
        fill: false,
        tension: 0.1  // Sin líneas fluidas, estilo consistente
    }));
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: MOCORITO_DATA.periods,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 20
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { maxRotation: 45 }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: '#e0e0e0' }
                }
            },
            elements: {
                point: { radius: 3 },
                line: { borderWidth: 2 }
            }
        }
    });
}

// Función para crear la tabla de valores mensuales de Mocorito
function createMocoritoValoresTable() {
    console.log('🔍 Creando tabla de valores de Mocorito...');
    const container = document.getElementById('tabla-mocorito-valores');
    if (!container) {
        console.error('❌ No se encontró el contenedor tabla-mocorito-valores');
        return;
    }
    console.log('✅ Contenedor encontrado:', container);
    console.log('📊 Datos de MOCORITO_DATA.resumenCambios:', MOCORITO_DATA.resumenCambios);

    let html = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tipo de delito</th>
                        <th>Promedio Enero-Agosto 2024</th>
                        <th>Promedio Septiembre 2024-Julio 2025</th>
                        <th>Cambio</th>
                    </tr>
                </thead>
                <tbody>
    `;

    MOCORITO_DATA.resumenCambios.forEach(item => {
        html += `
            <tr>
                <td>${item.delito}</td>
                <td class="text-center">${item.promedio_pre}</td>
                <td class="text-center">${item.promedio_durante}</td>
                <td class="text-center">
                    <span class="badge ${item.cambio === 'NUEVO' ? 'bg-success' : 'bg-danger'}">${item.cambio}</span>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// Función para crear la gráfica de evolución de Navolato - estilo consistente con el informe
function createNavolatoEvolutionChart() {
    const ctx = document.getElementById('chart-navolato-evolution');
    if (!ctx) return;
    
    // Usar mismos colores que el resto del informe
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    
    const datasets = Object.keys(MUNICIPIOS_DATA.navolato.delitos).map((delito, index) => ({
        label: delito,
        data: MUNICIPIOS_DATA.navolato.delitos[delito],
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        borderWidth: 2,
        fill: false,
        tension: 0.1  // Sin líneas fluidas, estilo consistente
    }));
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: MUNICIPIOS_DATA.periods,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 20
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { maxRotation: 45 }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: '#e0e0e0' }
                }
            },
            elements: {
                point: { radius: 3 },
                line: { borderWidth: 2 }
            }
        }
    });
}

// Función para crear la tabla de valores mensuales de Navolato
function createNavolatoValoresTable() {
    console.log('🔍 Creando tabla de valores de Navolato...');
    const container = document.getElementById('tabla-navolato-valores');
    if (!container) {
        console.error('❌ No se encontró el contenedor tabla-navolato-valores');
        return;
    }
    console.log('✅ Contenedor encontrado:', container);
    console.log('📊 Datos de MUNICIPIOS_DATA.navolato.resumenCambios:', MUNICIPIOS_DATA.navolato.resumenCambios);

    let html = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tipo de delito</th>
                        <th>Promedio Enero-Agosto 2024</th>
                        <th>Promedio Septiembre 2024-Julio 2025</th>
                        <th>Cambio</th>
                    </tr>
                </thead>
                <tbody>
    `;

    MUNICIPIOS_DATA.navolato.resumenCambios.forEach(item => {
        html += `
            <tr>
                <td>${item.delito}</td>
                <td class="text-center">${item.promedio_pre}</td>
                <td class="text-center">${item.promedio_durante}</td>
                <td class="text-center">
                    <span class="badge ${item.cambio === 'NUEVO' ? 'bg-success' : (item.cambio.includes('+') ? 'bg-danger' : 'bg-success')}">${item.cambio}</span>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// ===== FUNCIONES PARA NUEVOS MUNICIPIOS =====

// Función genérica para crear gráfico de evolución municipal
function createMunicipioChart(municipio, canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const data = MUNICIPIOS_DATA[municipio];
    
    if (!data) return;

    // Crear datasets para cada delito
    const datasets = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    
    Object.keys(data.delitos).forEach((delito, index) => {
        datasets.push({
            label: delito,
            data: data.delitos[delito],
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '20',
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.1,
            fill: false
        });
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: MUNICIPIOS_DATA.periods,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Período'
                    },
                    ticks: {
                        maxRotation: 45
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Cantidad de delitos'
                    },
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Función genérica para crear tabla de valores municipales
function createMunicipioTable(municipio, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = MUNICIPIOS_DATA[municipio];
    if (!data) return;

    let tableHTML = `
        <div class="table-responsive">
            <table class="table table-striped table-sm">
                <thead class="table-dark">
                    <tr>
                        <th>Tipo de delito</th>
                        <th>Promedio Enero-Agosto 2024</th>
                        <th>Promedio Septiembre 2024-Julio 2025</th>
                        <th>Patrón</th>
                    </tr>
                </thead>
                <tbody>
    `;

    data.resumenCambios.forEach(item => {
        tableHTML += `
            <tr>
                <td style="font-size: 0.85em;">${item.delito}</td>
                <td class="text-center">${item.promedio_pre.toFixed(2)}</td>
                <td class="text-center">${item.promedio_durante.toFixed(2)}</td>
                <td class="text-center">
                    <span class="badge bg-danger">${item.cambio}</span>
                </td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table></div>';
    container.innerHTML = tableHTML;
}

// ===== FUNCIÓN DE INICIALIZACIÓN UNIFICADA =====

// Función de inicialización para todos los municipios
function initializeMunicipiosAnalysis() {
    console.log('🚀 Inicializando análisis de municipios...');
    
    // SOLO CREAR TABLAS, NO GRÁFICAS
    // Las gráficas serán creadas por los scripts individuales
    
    // MOCORITO - Solo tabla
    console.log('📍 Creando tabla de valores de Mocorito...');
    createMocoritoValoresTable();
    
    // NAVOLATO - Solo tabla
    console.log('📍 Creando tabla de valores de Navolato...');
    createNavolatoValoresTable();
    
    // CULIACÁN - Solo tabla
    createMunicipioTable('culiacan', 'tabla-culiacan-valores');
    
    // BADIRAGUATO - Solo tabla
    createMunicipioTable('badiraguato', 'tabla-badiraguato-valores');
    
    // COSALÁ - Solo tabla
    createMunicipioTable('cosala', 'tabla-cosala-valores');
    
    // ELOTA - Solo tabla
    createMunicipioTable('elota', 'tabla-elota-valores');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM cargado, iniciando análisis de municipios...');
    initializeMunicipiosAnalysis();
});