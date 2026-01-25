<?php
declare(strict_types=1);

namespace ESN\Proposals\Bootstrap;

use RuntimeException;

final class Container {

    private array $factories = [];

    private array $instances = [];

    public function get(string $id): mixed {
        if (array_key_exists($id, $this->instances)) {
            return $this->instances[$id];
        }
        if (!isset($this->factories[$id])) {
            throw new RuntimeException("Service not found: $id");
        }

        $this->instances[$id] = ($this->factories[$id])($this);
        return $this->instances[$id];
    }

    public function set(string $id, callable $factory): void {
        $this->factories[$id] = $factory;
    }

    public function has(string $id): bool {
        return array_key_exists($id, $this->instances) || isset($this->factories[$id]);
    }
}