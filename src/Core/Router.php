<?php
declare(strict_types=1);

namespace ESN\Proposals\Core;
final class Router {

    private array $routes = [];
    private string $prefix = '';

    public function group(string $prefix, callable $callback): void {
        $previousPrefix = $this->prefix;
        $this->prefix .= rtrim($prefix, '/');
        
        $callback($this);

        $this->prefix = $previousPrefix;
    }

    public function get(string $path, callable $handler): void {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, callable $handler): void {
        $this->addRoute('POST', $path, $handler);
    }

    private function addRoute(string $method, string $path, callable $handler): void {
        $fullPath = $this->normalizePath($this->prefix . $path);
        $this->routes[$method][$fullPath] = $handler;
    }

    public function dispatch(string $method, string $path): void {
        $path = $this->normalizePath($path);

        if (!isset($this->routes[$method][$path])) {
            Response::json([
                'error' => 'Not Found',
                'method' => $method,
                'path' => $path
            ], 404);
            return;
        }

        try {
            $handler = $this->routes[$method][$path];
            call_user_func($handler);
        } catch (\Throwable $e) {
            Response::json([
                'error' => 'Internal Server Error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    private function normalizePath(string $path): string {
        $path = rtrim($path, '/');
        return $path === '' ? '/' : $path;
    }
}
