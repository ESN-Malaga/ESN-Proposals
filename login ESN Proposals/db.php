<?php
$DB_HOST = "localhost";
$DB_USER = "root";   // por defecto en XAMPP
$DB_PASS = "";        // vacío en XAMPP
$DB_NAME = "login_esn";

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if ($conn->connect_error) {
    die("Error en la conexión: " . $conn->connect_error);
}
