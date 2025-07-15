<?php
header('Content-Type: application/json');

// Configuración
$uploadDir = 'uploads/';
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
$maxFileSize = 5 * 1024 * 1024; // 5MB

// Respuesta inicial
$response = [
    'success' => false,
    'error' => '',
    'filepath' => ''
];

try {
    // Verificar método HTTP
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido. Solo POST.');
    }

    // Verificar si se subió un archivo
    if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Error al subir el archivo. Código: ' . $_FILES['photo']['error']);
    }

    $file = $_FILES['photo'];

    // Validar tipo de archivo
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);

    if (!in_array($mime, $allowedTypes)) {
        throw new Exception('Tipo de archivo no permitido. Solo se aceptan imágenes JPEG, PNG o GIF.');
    }

    // Validar tamaño de archivo
    if ($file['size'] > $maxFileSize) {
        throw new Exception('El archivo es demasiado grande. Tamaño máximo: 5MB.');
    }

    // Crear directorio si no existe
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Generar nombre único para el archivo
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('img_', true) . '.' . $extension;
    $filepath = $uploadDir . $filename;

    // Mover archivo subido
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        throw new Exception('Error al guardar el archivo en el servidor.');
    }

    // Éxito
    $response['success'] = true;
    $response['filepath'] = $filepath;

} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

// Enviar respuesta JSON
echo json_encode($response);
?>