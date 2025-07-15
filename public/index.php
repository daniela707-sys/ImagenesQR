<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Captura de Imágenes con QR</title>
    <link rel="stylesheet" href="css/style.css">
    <script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>
</head>
<body>
    <div class="container">
        <h1>Captura de Imágenes con QR</h1>
        
        <div class="camera-section">
            <video id="video" autoplay playsinline></video>
            <canvas id="canvas"></canvas>
            
            <div class="controls">
                <button id="startButton" class="btn">Activar Cámara</button>
                <button id="captureButton" class="btn" disabled>Capturar Foto</button>
                <button id="retakeButton" class="btn" disabled>Volver a Tomar</button>
                <button id="uploadButton" class="btn" disabled>Subir Imagen</button>
            </div>
            
            <div class="camera-info">
                <small>💡 Doble clic en el video para cambiar de cámara</small>
            </div>
            
            <div class="preview">
                <img id="photoPreview" alt="Previsualización">
                <div id="qrcode"></div>
            </div>
            
            <div id="status" class="status"></div>
        </div>
    </div>
    
    <script src="js/main.js"></script>
</body>
</html>