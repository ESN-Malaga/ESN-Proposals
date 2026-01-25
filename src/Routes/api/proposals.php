<?php
declare(strict_types=1);

use ESN\Proposals\Bootstrap\Container;
use ESN\Proposals\Core\Router;

/** @var Container $container */
/** @var Router $router */
$router->group('/proposals', function (Router $router) use ($container) {
    $controller = $container->get('proposalsController');

    $router->get('', [$controller, 'list']);
//    $router->post('', [$controller, 'create']);
//    $router->post('/edit', [$controller, 'edit']);
//    $router->get('/check-support', [$controller, 'checkSupport']);
});