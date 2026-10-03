<?php
declare(strict_types=1);

use ESN\Proposals\Controllers\HealthController;
use ESN\Proposals\Core\Response;
use ESN\Proposals\Core\Router;

/** @var Router $router */
$router->get('/health', [new HealthController(), 'check']);
$router->get('/ping', fn() => Response::json(['pong' => true]));