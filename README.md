# ImagenesQR - Sistema de Captura de Imágenes con Códigos QR

## 📋 Descripción

Sistema web que permite capturar imágenes usando la cámara del dispositivo, generar códigos QR únicos para cada captura y subir las imágenes al servidor. Ideal para documentación fotográfica con trazabilidad, para visualizar en diferentes dispositivos puede ingresar en su navegador a la url https://imagenqr.rf.gd/?i=1.

## 🏗️ Arquitectura de la Solución

### Estructura del Proyecto
```
ImagenesQR/
├── backend/
│   ├── uploads/           # Directorio de imágenes subidas
│   └── upload.php         # API para subida de archivos
├── public/
│   ├── css/
│   │   └── style.css      # Estilos de la aplicación
│   ├── js/
│   │   └── main.js        # Lógica del frontend
│   └── index.php          # Página principal
├── .htaccess              # Configuración de Apache
├── package.json           # Dependencias de Node.js
└── README.md              # Documentación
```

### Componentes Principales

#### Frontend
- **HTML5**: Estructura de la aplicación
- **CSS3**: Estilos responsivos y modernos
- **JavaScript ES6+**: Lógica de captura de cámara y manejo de eventos
- **QRCode.js**: Generación de códigos QR
- **MediaDevices API**: Acceso a la cámara del dispositivo

#### Backend
- **PHP 7.4+**: Procesamiento del servidor
- **Apache**: Servidor web con mod_rewrite

### Flujo de Funcionamiento

1. **Activación de Cámara**: El usuario activa la cámara web/móvil y puede cambiar la camara con doble clic 
2. **Captura de Imagen**: Se toma una foto y se muestra la previsualización
3. **Generación de QR**: Se crea un código QR único con timestamp
4. **Subida al Servidor**: La imagen se envía al backend PHP
5. **Almacenamiento**: La imagen se guarda con nombre único

## 🚀 Instrucciones de Instalación

### Requisitos Previos
- **XAMPP** (Apache + PHP + MySQL)
- **Node.js** (para gestión de dependencias)
- Navegador web moderno con soporte para MediaDevices API

### Instalación Paso a Paso

1. **Clonar/Descargar el proyecto**
   ```bash
   # Si usas Git
   git clone https://github.com/daniela707-sys/ImagenesQR.git
   
   # O descargar y extraer en c:\xampp\htdocs\
   ```

2. **Configurar XAMPP**
   - Instalar XAMPP desde https://www.apachefriends.org/
   - Iniciar Apache desde el panel de control de XAMPP
   - Verificar que PHP esté habilitado

3. **Instalar dependencias**
   ```bash
   cd c:\xampp\htdocs\ImagenesQR
   npm install
   ```

4. **Configurar permisos**
   - Asegurar que el directorio `backend/uploads/` tenga permisos de escritura
   - En Windows: Clic derecho → Propiedades → Seguridad → Editar

5. **Acceder a la aplicación**
   - Abrir navegador en: `http://localhost/ImagenesQR/public/`

## ⚙️ Configuración Requerida

### Configuración de Apache (.htaccess)
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /public/index.php [L]
```

### Configuración PHP (upload.php)
```php
// Configuración de subida de archivos
$uploadDir = 'uploads/';
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
$maxFileSize = 5 * 1024 * 1024; // 5MB
```

### Configuración de Cámara (JavaScript)
```javascript
// Configuración de MediaDevices
video: {
    facingMode: 'environment', // Cámara trasera preferida
    width: { ideal: 1280 },
    height: { ideal: 720 }
}
```

### Variables de Entorno Recomendadas
- **PHP**: `upload_max_filesize = 10M`
- **PHP**: `post_max_size = 10M`
- **PHP**: `max_execution_time = 30`

## 🐛 Problemas Encontrados y Soluciones Aplicadas

### 1. Acceso a la Cámara en HTTPS
**Problema**: Los navegadores modernos requieren HTTPS para acceder a la cámara.

**Solución Aplicada**:
```javascript
// Verificación de compatibilidad
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    statusDiv.textContent = 'Tu navegador no soporta acceso a la cámara o esta función está deshabilitada.';
    statusDiv.className = 'status error';
    startButton.disabled = true;
}
```

**Solución Recomendada**: Configurar certificado SSL en Apache o usar localhost para desarrollo.

### 2. Gestión de Memoria con Imágenes Grandes
**Problema**: Las imágenes de alta resolución pueden causar problemas de memoria.

**Solución Aplicada**:
```javascript
// Compresión de imagen al capturar
photoDataUrl = canvas.toDataURL('image/jpeg', 0.8); // Calidad 80%
```

### 3. Limpieza de Recursos de Cámara
**Problema**: La cámara permanecía activa al cambiar de página.

**Solución Aplicada**:
```javascript
// Detener cámara al salir
window.addEventListener('beforeunload', function() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});
```

### 4. Validación de Archivos en el Servidor
**Problema**: Necesidad de validar tipos y tamaños de archivo.

**Solución Aplicada**:
```php
// Validación robusta de archivos
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);

if (!in_array($mime, $allowedTypes)) {
    throw new Exception('Tipo de archivo no permitido.');
}
```

### 5. Nombres de Archivo Únicos
**Problema**: Evitar colisiones de nombres de archivo.

**Solución Aplicada**:
```php
// Generación de nombres únicos
$filename = uniqid('img_', true) . '.' . $extension;
```

### 6. Compatibilidad Móvil
**Problema**: Diferencias en el comportamiento entre dispositivos móviles y desktop.

**Solución Aplicada**:
```javascript
// Deteccion de camaras disponibles 
async function getCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            cameras = devices.filter(device => device.kind === 'videoinput');
        } catch (err) {
            console.error('Error al obtener cámaras:', err);
        }
    }
```

## 📱 Uso de la Aplicación

1. **Activar Cámara**: Clic en "Activar Cámara"
2. **Capturar**: Clic en "Capturar Foto" cuando esté listo
3. **Revisar**: Verificar la imagen y el código QR generado
4. **Rehacer** (opcional): Clic en "Volver a Tomar" si no está conforme
5. **Subir**: Clic en "Subir Imagen" para guardar en el servidor

## 🔧 Mantenimiento

### Limpieza de Archivos
```bash
# Limpiar archivos antiguos (ejecutar periódicamente)
find backend/uploads/ -name "*.jpg" -mtime +30 -delete
```

### Monitoreo de Espacio
- Revisar regularmente el directorio `backend/uploads/`
- Implementar rotación de archivos si es necesario

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver archivo LICENSE para más detalles.

