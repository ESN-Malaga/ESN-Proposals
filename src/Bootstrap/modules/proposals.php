<?php
declare(strict_types=1);

use ESN\Proposals\Bootstrap\Container;
use ESN\Proposals\Controllers\ProposalsController;
use ESN\Proposals\Repository\ProposalsRepository;
use ESN\Proposals\Services\ProposalsService;

/** @var Container $container */
$container->set('proposalsRepository', fn(Container $container) =>
    new ProposalsRepository($container->get('connection'))
);

$container->set('proposalsService', fn(Container $container) =>
    new ProposalsService($container->get('proposalsRepository'))
);

$container->set('proposalsController', fn(Container $container) =>
    new ProposalsController($container->get('proposalsService'))
);