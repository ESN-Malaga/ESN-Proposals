<?php
declare(strict_types=1);

define('BASE_PATH', dirname(__DIR__, 2));

require_once BASE_PATH . '/src/Database.php';
require_once BASE_PATH . '/src/Core/Response.php';
require_once BASE_PATH . '/src/Core/Router.php';
require_once BASE_PATH . '/src/Controllers/HealthController.php';



$conn = \App\Database::conn();
$router = new \App\Core\Router($conn);

require_once BASE_PATH . '/routes/api.php';

$method = $_SERVER['REQUEST_METHOD'];
$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {    
    $router->dispatch($method, $path);
} finally {
    $conn->close();
}