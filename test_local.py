#!/usr/bin/env python3
"""
Script de prueba local para el informe SESNSP
Ejecuta un servidor HTTP simple para probar el informe antes de subirlo a GitHub
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8003

def test_local():
    """Inicia un servidor local para probar el informe"""
    
    # Verificar que los archivos esenciales existan
    essential_files = [
        'index.html',
        'styles/main.css',
        'scripts/main.js',
        'violencia_homicida_sinaloa_municipal_2024_2025.csv'  # Este archivo sí existe
    ]
    
    missing_files = []
    for file_path in essential_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print("❌ Archivos faltantes:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        print("\nAsegúrate de estar en el directorio correcto")
        print(f"Directorio actual: {os.getcwd()}")
        print("Archivos CSV disponibles:")
        for csv_file in [f for f in os.listdir('.') if f.endswith('.csv')]:
            print(f"   - {csv_file}")
        return False
    
    print("✅ Todos los archivos esenciales están presentes")
    
    # Cambiar al directorio del script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            super().end_headers()
    
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"🚀 Servidor de prueba iniciado en http://localhost:{PORT}")
            print("📱 Abriendo el informe en tu navegador...")
            print("🔄 Presiona Ctrl+C para detener el servidor")
            
            # Abrir automáticamente en el navegador
            webbrowser.open(f'http://localhost:{PORT}')
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido")
        return True
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ El puerto {PORT} ya está en uso.")
            print(f"   Intenta con otro puerto o detén el proceso existente.")
        else:
            print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Probando informe SESNSP localmente...")
    print("=" * 50)
    
    success = test_local()
    
    if success:
        print("\n✅ Prueba local completada exitosamente")
        print("🎯 El informe está listo para subir a GitHub Pages")
    else:
        print("\n❌ La prueba local falló")
        print("🔧 Revisa los errores antes de continuar")
        sys.exit(1)
