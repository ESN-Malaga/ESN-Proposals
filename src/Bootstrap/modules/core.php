<?php
declare(strict_types=1);

use ESN\Proposals\Bootstrap\Container;
use ESN\Proposals\Core\Router;
use ESN\Proposals\Database\Connection;

/** @var Container $container */
$container->set('router', fn(Container $container) => new Router());
$container->set('connection', fn(Container $container) => Connection::create());
