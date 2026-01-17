<?php

$dbHost = getenv('DB_HOST');
$dbPort = getenv('DB_PORT');
$dbName = getenv('DB_NAME');
$dbUser = getenv('DB_USER');
$dbPass = getenv('DB_PASSWORD');

$mysqli = new mysqli(
    $dbHost,
    $dbUser,
    $dbPass,
    $dbName,
    (int)$dbPort
);

if ($mysqli->connect_error) {
    die("DB connection failed: " . $mysqli->connect_error);
}
