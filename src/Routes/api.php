<?php
declare(strict_types=1);

use ESN\Proposals\Bootstrap\Container;
use ESN\Proposals\Core\Router;

/** @var Container $container */
$router = $container->get('router');

$router->group('/api', function (Router $router) use ($container) {

    require __DIR__ . '/api/health.php';

    // require __DIR__ . '/api/auth.php';
//    require __DIR__ . '/api/users.php';
//
    require __DIR__ . '/api/proposals.php';
//    require __DIR__ . '/api/problems.php';
//    require __DIR__ . '/api/matches.php';
//    require __DIR__ . '/api/contributions.php';

});
