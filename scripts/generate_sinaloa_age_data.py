#!/usr/bin/env python3
"""
Script para generar datos de Sinaloa por edad y subtipo de delito
para la gráfica de barras apiladas de composición por edad
"""

import pandas as pd
import json

def generate_sinaloa_age_data():
    """Genera datos de Sinaloa por edad y subtipo de delito"""
    
    # Leer el CSV principal
    print("📊 Leyendo datos del CSV...")
    df = pd.read_csv('data/IDVFC_NM_jul25.csv', encoding='latin1')
    
    # Filtrar solo Sinaloa y violencia homicida
    sinaloa_data = df[
        (df['Entidad'] == 'Sinaloa') & 
        (df['Bien jurídico afectado'] == 'La vida y la Integridad corporal') &
        (df['Año'].isin([2024, 2025]))
    ].copy()
    
    print(f"✅ Datos de Sinaloa encontrados: {len(sinaloa_data):,} registros")
    
    # Subtipos de delitos que nos interesan
    subtipos_interes = [
        'Homicidio doloso',
        'Homicidio culposo', 
        'Feminicidio',
        'Otros delitos que atentan contra la vida y la integridad corporal'
    ]
    
    # Filtrar solo los subtipos de interés
    sinaloa_data = sinaloa_data[sinaloa_data['Subtipo de delito'].isin(subtipos_interes)]
    
    # Rangos de edad
    rangos_edad = [
        'Menores de edad (0-17)',
        'Adultos (18 y más)',
        'No especificado',
        'No identificado'
    ]
    
    # Meses de interés (enero 2024 a julio 2025)
    meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
        'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    
    # Crear estructura de datos para la gráfica
    datos_grafica = {}
    
    for subtipo in subtipos_interes:
        print(f"🔄 Procesando {subtipo}...")
        
        # Filtrar datos del subtipo
        subtipo_data = sinaloa_data[sinaloa_data['Subtipo de delito'] == subtipo]
        
        datos_subtipo = {}
        
        # Procesar cada año
        for año in [2024, 2025]:
            año_data = subtipo_data[subtipo_data['Año'] == año]
            
            # Determinar meses a procesar según el año
            if año == 2024:
                meses_año = meses  # Todos los meses de 2024
            else:  # 2025
                meses_año = meses[:7]  # Solo enero-julio de 2025
            
            for i, mes in enumerate(meses_año):
                # Crear etiqueta del mes
                if año == 2024:
                    etiqueta_mes = f"{mes} 2024"
                else:
                    etiqueta_mes = f"{mes} 2025"
                
                # Inicializar contadores por edad
                contadores_edad = {rango: 0 for rango in rangos_edad}
                
                # Sumar casos por rango de edad para este mes
                for _, fila in año_data.iterrows():
                    rango_edad = fila['Rango de edad']
                    casos_mes = fila[mes]
                    
                    if pd.notna(casos_mes) and casos_mes > 0:
                        contadores_edad[rango_edad] += casos_mes
                
                # Guardar datos del mes
                datos_subtipo[etiqueta_mes] = contadores_edad.copy()
        
        datos_grafica[subtipo] = datos_subtipo
    
    # Guardar como JSON para fácil uso en JavaScript
    print("💾 Guardando datos como JSON...")
    with open('data/sinaloa_edad_composicion.json', 'w', encoding='utf-8') as f:
        json.dump(datos_grafica, f, ensure_ascii=False, indent=2)
    
    # Crear CSV resumen para verificación
    print("📋 Creando CSV de resumen...")
    resumen_data = []
    
    for subtipo in subtipos_interes:
        for mes, datos_edad in datos_grafica[subtipo].items():
            total_mes = sum(datos_edad.values())
            
            for rango_edad, casos in datos_edad.items():
                porcentaje = (casos / total_mes * 100) if total_mes > 0 else 0
                
                resumen_data.append({
                    'Subtipo': subtipo,
                    'Mes': mes,
                    'Rango_Edad': rango_edad,
                    'Casos': casos,
                    'Porcentaje': round(porcentaje, 2),
                    'Total_Mes': total_mes
                })
    
    # Guardar CSV
    df_resumen = pd.DataFrame(resumen_data)
    df_resumen.to_csv('data/sinaloa_edad_composicion_resumen.csv', index=False, encoding='utf-8')
    
    # Mostrar estadísticas
    print("\n📊 ESTADÍSTICAS GENERADAS:")
    print(f"✅ Subtipos procesados: {len(subtipos_interes)}")
    print(f"✅ Meses totales: {len(datos_grafica[subtipos_interes[0]])}")
    print(f"✅ Rangos de edad: {len(rangos_edad)}")
    print(f"✅ Total de registros en resumen: {len(resumen_data):,}")
    
    # Mostrar muestra de datos
    print("\n🔍 MUESTRA DE DATOS (Homicidio doloso - Enero 2024):")
    muestra = datos_grafica['Homicidio doloso']['Enero 2024']
    for rango, casos in muestra.items():
        print(f"  {rango}: {casos} casos")
    
    print(f"\n✅ Archivos generados:")
    print(f"  📄 data/sinaloa_edad_composicion.json")
    print(f"  📄 data/sinaloa_edad_composicion_resumen.csv")
    
    return datos_grafica

if __name__ == "__main__":
    datos = generate_sinaloa_age_data()
