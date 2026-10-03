<?php
declare(strict_types=1);

namespace ESN\Proposals\Core;

class HttpException extends \RuntimeException {

    public function __construct(
        public readonly string $status,
        string $message,
        public readonly array $meta = []
    ) {
        parent::__construct($message);
    }
}