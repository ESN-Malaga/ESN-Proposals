<?php
declare(strict_types=1);

use ESN\Proposals\Bootstrap\Container;

$container = new Container();

require BASE_PATH . '/src/Bootstrap/modules/core.php';
require BASE_PATH . '/src/Bootstrap/modules/proposals.php';

return $container;