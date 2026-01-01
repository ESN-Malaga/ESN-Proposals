<?php
require 'config.php';
require 'db.php';

if (!isset($_GET['code'])) {
    die("No code provided");
}

// ==== 1. Obtener token ====
$token_request = curl_init($GOOGLE_TOKEN_URL);

curl_setopt($token_request, CURLOPT_RETURNTRANSFER, true);
curl_setopt($token_request, CURLOPT_POST, true);
curl_setopt($token_request, CURLOPT_POSTFIELDS, [
    "code"          => $_GET['code'],
    "client_id"     => $GOOGLE_CLIENT_ID,
    "client_secret" => $GOOGLE_CLIENT_SECRET,
    "redirect_uri"  => $GOOGLE_REDIRECT_URI,
    "grant_type"    => "authorization_code"
]);

$response = json_decode(curl_exec($token_request), true);
curl_close($token_request);

if (!isset($response["access_token"])) {
    die("No access token");
}

$access_token = $response["access_token"];

// ==== 2. Obtener datos del usuario ====
$user_request = curl_init($GOOGLE_USERINFO_URL);
curl_setopt($user_request, CURLOPT_RETURNTRANSFER, true);
curl_setopt($user_request, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . $access_token
]);

$userinfo = json_decode(curl_exec($user_request), true);
curl_close($user_request);

// Datos a guardar
$google_id = $userinfo["id"];
$name      = $userinfo["name"];
$email     = $userinfo["email"];
$picture   = $userinfo["picture"];

// ==== 3. Guardar / actualizar en DB ====

// ¿Existe el usuario?
$stmt = $conn->prepare("SELECT id FROM users WHERE google_id = ?");
$stmt->bind_param("s", $google_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    // Actualizar último login
    $update = $conn->prepare("UPDATE users SET last_login = NOW() WHERE google_id = ?");
    $update->bind_param("s", $google_id);
    $update->execute();
} else {
    // Insertar nuevo usuario
    $insert = $conn->prepare("INSERT INTO users (google_id, name, email, picture) VALUES (?, ?, ?, ?)");
    $insert->bind_param("ssss", $google_id, $name, $email, $picture);
    $insert->execute();
}

// ==== 4. Crear sesión ====
session_start();
$_SESSION["user"] = $userinfo;

// ==== 5. Volver al inicio ====
header("Location: index.php");
exit;
