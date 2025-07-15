document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const photoPreview = document.getElementById('photoPreview');
    const startButton = document.getElementById('startButton');
    const captureButton = document.getElementById('captureButton');
    const retakeButton = document.getElementById('retakeButton');
    const uploadButton = document.getElementById('uploadButton');
    const statusDiv = document.getElementById('status');
    const qrcodeDiv = document.getElementById('qrcode');
    
    let stream = null;
    let photoDataUrl = null;
    let cameras = [];
    let currentCameraIndex = 0;
    
    // Verificar compatibilidad y obtener cámaras
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        statusDiv.textContent = 'Tu navegador no soporta acceso a la cámara o esta función está deshabilitada.';
        statusDiv.className = 'status error';
        startButton.disabled = true;
    } else {
        getCameras();
    }

    // Obtener lista de cámaras disponibles
    async function getCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            cameras = devices.filter(device => device.kind === 'videoinput');
        } catch (err) {
            console.error('Error al obtener cámaras:', err);
        }
    }

    // Función para iniciar cámara con deviceId específico
    async function startCamera(deviceId = null) {
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };

        if (deviceId) {
            constraints.video.deviceId = { exact: deviceId };
        } else {
            constraints.video.facingMode = 'environment';
        }

        return await navigator.mediaDevices.getUserMedia(constraints);
    }
    
    // Activar cámara
    startButton.addEventListener('click', async function() {
        try {
            const deviceId = cameras.length > 0 ? cameras[currentCameraIndex]?.deviceId : null;
            stream = await startCamera(deviceId);
            
            video.srcObject = stream;
            startButton.disabled = true;
            captureButton.disabled = false;
            statusDiv.textContent = 'Cámara activada. Presiona "Capturar Foto" para tomar una imagen.';
            statusDiv.className = 'status';
        } catch (err) {
            console.error('Error al acceder a la cámara:', err);
            statusDiv.textContent = `Error al acceder a la cámara: ${err.message}`;
            statusDiv.className = 'status error';
        }
    });

    // Cambiar cámara (doble clic en video)
    video.addEventListener('dblclick', async function() {
        if (cameras.length > 1 && stream) {
            currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
            
            // Detener cámara actual
            stream.getTracks().forEach(track => track.stop());
            
            try {
                const deviceId = cameras[currentCameraIndex].deviceId;
                stream = await startCamera(deviceId);
                video.srcObject = stream;
                statusDiv.textContent = `Cambiado a cámara ${currentCameraIndex + 1} de ${cameras.length}`;
            } catch (err) {
                console.error('Error al cambiar cámara:', err);
                statusDiv.textContent = 'Error al cambiar cámara';
                statusDiv.className = 'status error';
            }
        }
    });
    
    // Capturar foto
    captureButton.addEventListener('click', function() {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        photoPreview.src = photoDataUrl;
        photoPreview.style.display = 'block';
        video.style.display = 'none';
        
        captureButton.disabled = true;
        retakeButton.disabled = false;
        uploadButton.disabled = false;
        
        // Generar código QR con la fecha y hora actual
        const now = new Date();
        const qrData = `IMG_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
        
        qrcodeDiv.innerHTML = '';
        new QRCode(qrcodeDiv, {
            text: qrData,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Detener la cámara
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        
        statusDiv.textContent = 'Foto capturada. Puedes subirla o volver a tomar.';
        statusDiv.className = 'status';

    });
    
    // Volver a tomar foto
    retakeButton.addEventListener('click', async function() {
        photoPreview.style.display = 'none';
        video.style.display = 'block';
        qrcodeDiv.innerHTML = '';
        
        // Reactivar la cámara
        try {
            const deviceId = cameras.length > 0 ? cameras[currentCameraIndex]?.deviceId : null;
            stream = await startCamera(deviceId);
            video.srcObject = stream;
        } catch (err) {
            console.error('Error al reactivar la cámara:', err);
            statusDiv.textContent = `Error al reactivar la cámara: ${err.message}`;
            statusDiv.className = 'status error';
            return;
        }
        
        captureButton.disabled = false;
        retakeButton.disabled = true;
        uploadButton.disabled = true;
        
        statusDiv.textContent = 'Cámara activada. Presiona "Capturar Foto" para tomar una imagen.';
        statusDiv.className = 'status';
    });
    
    // Subir imagen al servidor
    uploadButton.addEventListener('click', async function() {
        if (!photoDataUrl) {
            statusDiv.textContent = 'No hay imagen para subir.';
            statusDiv.className = 'status error';
            return;
        }
        
        uploadButton.disabled = true;
        statusDiv.textContent = 'Subiendo imagen...';
        statusDiv.className = 'status';
        
        try {
            // Convertir DataURL a Blob
            const blob = dataURLtoBlob(photoDataUrl);
            const formData = new FormData();
            formData.append('photo', blob, 'captura.jpg');
            
            const response = await fetch('../backend/upload.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                statusDiv.textContent = `Imagen subida correctamente: ${result.filepath}`;
                statusDiv.className = 'status success';
            } else {
                statusDiv.textContent = `Error al subir imagen: ${result.error}`;
                statusDiv.className = 'status error';
            }
        } catch (err) {
            console.error('Error al subir imagen:', err);
            statusDiv.textContent = `Error al subir imagen: ${err.message}`;
            statusDiv.className = 'status error';
        } finally {
            uploadButton.disabled = false;
        }
    });
    
    // Detener la cámara al salir de la página
    window.addEventListener('beforeunload', function() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    });
    
    // Función auxiliar para convertir DataURL a Blob
    function dataURLtoBlob(dataurl) {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new Blob([u8arr], { type: mime });
    }
});