<?php
declare(strict_types=1);

define('BASE_PATH', dirname(__DIR__, 2));

require_once BASE_PATH . '/vendor/autoload.php';

use ESN\Proposals\Core\HttpException;
use ESN\Proposals\Core\Response;

$container = require BASE_PATH . '/src/Bootstrap/bootstrap.php';
$router = $container->get('router');

require BASE_PATH . '/src/Routes/api.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

try {
    $router->dispatch($method, $path);
} catch (HttpException $e) {
    Response::error(
        $e->getMessage(),
        $e->getCode(),
        $e->getMessage(),
        $e->getTrace()
    );
} catch (Throwable $e) {
    Response::error('Internal Server Error');
}