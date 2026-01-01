<?php
// setup_db.php
// Script para reparar/actualizar la base de datos automáticamente
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Configuración de base de datos (copiada de config.php para asegurar independencia)
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'sistema_ideas');

$response = ['log' => []];

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
    
    if ($conn->connect_error) {
        throw new Exception("Error de conexión: " . $conn->connect_error);
    }
    
    $response['log'][] = "Conectado a MySQL";
    
    // Crear base de datos si no existe
    $sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME;
    if ($conn->query($sql)) {
        $response['log'][] = "Base de datos verificada";
    } else {
        throw new Exception("Error creando DB: " . $conn->error);
    }
    
    $conn->select_db(DB_NAME);
    
    // 1. Tabla CONTRIBUTIONS
    $sql = "CREATE TABLE IF NOT EXISTS contributions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_type ENUM('proposal', 'problem') NOT NULL,
      item_id INT NOT NULL,
      user_session VARCHAR(100) NOT NULL,
      username VARCHAR(100) NOT NULL,
      contribution_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_item (item_type, item_id),
      INDEX idx_user (user_session)
    )";
    
    if ($conn->query($sql)) {
        $response['log'][] = "Tabla 'contributions' verificada/creada";
    } else {
        throw new Exception("Error creando tabla contributions: " . $conn->error);
    }
    
    // 2. Columnas en PROPOSALS
    // Slack URL
    $check = $conn->query("SHOW COLUMNS FROM proposals LIKE 'slack_url'");
    if ($check->num_rows == 0) {
        // Verificar si existe image_url para renombrar
        $checkImage = $conn->query("SHOW COLUMNS FROM proposals LIKE 'image_url'");
        if ($checkImage->num_rows > 0) {
            $conn->query("ALTER TABLE proposals CHANGE COLUMN image_url slack_url VARCHAR(500) NULL");
            $response['log'][] = "Columna 'image_url' renombrada a 'slack_url' en proposals";
        } else {
            $conn->query("ALTER TABLE proposals ADD COLUMN slack_url VARCHAR(500) NULL");
            $response['log'][] = "Columna 'slack_url' creada en proposals";
        }
    }
    
    // Attachments
    $check = $conn->query("SHOW COLUMNS FROM proposals LIKE 'attachments'");
    if ($check->num_rows == 0) {
        $conn->query("ALTER TABLE proposals ADD COLUMN attachments TEXT NULL");
        $response['log'][] = "Columna 'attachments' creada en proposals";
    }
    
    // 3. Columnas en PROBLEMS
    // Slack URL
    $check = $conn->query("SHOW COLUMNS FROM problems LIKE 'slack_url'");
    if ($check->num_rows == 0) {
        // Verificar si existe image_url para renombrar
        $checkImage = $conn->query("SHOW COLUMNS FROM problems LIKE 'image_url'");
        if ($checkImage->num_rows > 0) {
            $conn->query("ALTER TABLE problems CHANGE COLUMN image_url slack_url VARCHAR(500) NULL");
            $response['log'][] = "Columna 'image_url' renombrada a 'slack_url' en problems";
        } else {
            $conn->query("ALTER TABLE problems ADD COLUMN slack_url VARCHAR(500) NULL");
            $response['log'][] = "Columna 'slack_url' creada en problems";
        }
    }
    
    // Attachments
    $check = $conn->query("SHOW COLUMNS FROM problems LIKE 'attachments'");
    if ($check->num_rows == 0) {
        $conn->query("ALTER TABLE problems ADD COLUMN attachments TEXT NULL");
        $response['log'][] = "Columna 'attachments' creada en problems";
    }
    
    $response['success'] = true;
    $response['message'] = "Base de datos actualizada correctamente";
    
} catch (Exception $e) {
    $response['success'] = false;
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
?>
