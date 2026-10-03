<?php
declare(strict_types=1);

namespace ESN\Proposals\Core;

class Response {

    public static function json(mixed $data, int $status = 200): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');

        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }

    public static function text(string $text, int $status = 200): void {
        http_response_code($status);
        header('Content-Type: text/plain; charset=utf-8');

        echo $text;
    }

    public static function empty(int $status = 204): void {
        http_response_code($status);
    }

    public static function error(
        string $message,
        int $status = 500,
        string $error = 'Internal Server Error',
        array $meta = []
    ): void {
        $payload = array_merge(
            ['error' => $error, 'message' => $message],
            $meta
        );

        self::json($payload, $status);
    }
}