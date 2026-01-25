<?php
declare(strict_types=1);

namespace ESN\Proposals\Database;

use PDO;

final class Connection extends PDO
{
    public static function create(): PDO {
        $host = getenv('DB_HOST');
        $port = (int) (getenv('DB_PORT') ?: 3306);
        $database = getenv('MYSQL_DATABASE');
        $user = getenv('MYSQL_USER');
        $pass = getenv('MYSQL_PASSWORD');

        $connection = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $host,
            $port,
            $database
        );

        return new PDO($connection, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]);
    }
}
