<?php
namespace ESN\Proposals\Controllers;

use ESN\Proposals\Core\Response;
use JsonException;

class HealthController {
    /**
     * @throws JsonException
     */
    public function check(): void {
        Response::json([
            'status' => 'ok',
            'time' => date('c'),
            'service' => 'esn-proposals'
        ]);
    }
}
