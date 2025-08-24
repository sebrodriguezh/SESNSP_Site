# 🚀 Guía de Despliegue en GitHub Pages

## 📋 Pasos para publicar el informe

### 1. Crear repositorio en GitHub
1. Ve a [github.com](https://github.com) y crea una cuenta si no la tienes
2. Haz clic en "New repository" (botón verde)
3. **Nombre del repositorio**: `sesnsp-informe-2025` (o el que prefieras)
4. **Descripción**: "Reporte de Incidencia Delictiva - SESNSP México 2025"
5. **Visibilidad**: Public (para que sea accesible)
6. **NO inicialices** con README, .gitignore o licencia
7. Haz clic en "Create repository"

### 2. Subir archivos al repositorio
```bash
# En tu terminal, desde la carpeta sesnsp_informe_github_pages
git init
git add .
git commit -m "Primer commit: Informe SESNSP completo"
git branch -M main
git remote add origin https://github.com/TUUSUARIO/sesnsp-informe-2025.git
git push -u origin main
```

### 3. Activar GitHub Pages
1. Ve a tu repositorio en GitHub
2. Haz clic en **Settings** (pestaña)
3. En el menú izquierdo, haz clic en **Pages**
4. En **Source**, selecciona **Deploy from a branch**
5. En **Branch**, selecciona **gh-pages** y haz clic en **Save**
6. Espera unos minutos para que se active

### 4. Acceder al informe
- **URL**: `https://TUUSUARIO.github.io/sesnsp-informe-2025/`
- El informe estará disponible públicamente
- Se actualiza automáticamente cada vez que hagas push a main

## 🔧 Configuración automática

### GitHub Actions
El repositorio incluye un workflow automático que:
- Se ejecuta en cada push a main
- Despliega automáticamente a la rama gh-pages
- No requiere configuración adicional

### Estructura del repositorio
```
sesnsp-informe-2025/
├── index.html              # Página principal
├── styles/                 # Estilos CSS
├── scripts/                # Scripts JavaScript
├── *.csv                   # Datos de violencia
├── *.json                  # Datos estructurados
├── *.geojson              # Archivos geográficos
├── README.md              # Documentación
├── .gitignore             # Archivos excluidos
└── .github/workflows/     # Automatización
```

## 📊 Verificación del despliegue

### ✅ Checklist de verificación
- [ ] Repositorio creado en GitHub
- [ ] Archivos subidos correctamente
- [ ] GitHub Pages activado
- [ ] URL accesible públicamente
- [ ] Gráficas se cargan correctamente
- [ ] Mapas interactivos funcionan
- [ ] Datos se muestran correctamente

### 🐛 Solución de problemas comunes

#### Error: "Page not found"
- Verifica que GitHub Pages esté activado
- Espera 5-10 minutos después de activar
- Verifica que la rama sea `gh-pages`

#### Error: "Scripts not loading"
- Verifica que las rutas en `index.html` sean correctas
- Asegúrate de que todos los archivos `.js` estén en la carpeta `scripts/`

#### Error: "Data not loading"
- Verifica que los archivos CSV y JSON estén en la raíz
- Comprueba que los archivos GeoJSON estén presentes

## 🔄 Actualizaciones futuras

### Para actualizar el informe:
```bash
# Hacer cambios en los archivos
git add .
git commit -m "Actualización: [descripción de cambios]"
git push origin main
```

### GitHub Actions se ejecutará automáticamente y:
- Construirá la nueva versión
- La desplegará a gh-pages
- El informe se actualizará en 2-5 minutos

## 📱 Acceso móvil
- El informe es completamente responsive
- Funciona en dispositivos móviles
- Los mapas se adaptan a pantallas pequeñas

## 🌐 Compartir con colegas
Una vez desplegado, puedes compartir:
- **URL directa**: `https://TUUSUARIO.github.io/sesnsp-informe-2025/`
- **Código QR**: Genera uno con la URL
- **Enlace en presentaciones**: Ideal para reuniones

---

**¡Listo! Tu informe estará disponible públicamente en GitHub Pages.**
