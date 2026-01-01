<?php
// Google OAuth Callback Handler
require_once '../ideas-esn/config.php';

// Configuración de Google OAuth
$GOOGLE_CLIENT_ID = "883668928240-r08gsh21u3u7erm681t649is5104ugan.apps.googleusercontent.com";
$GOOGLE_CLIENT_SECRET = "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";
$GOOGLE_REDIRECT_URI = "http://localhost/google-auth";
$GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
$GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

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

// Datos del usuario
$google_id = $userinfo["id"];
$name      = $userinfo["name"];
$email     = $userinfo["email"];
$picture   = $userinfo["picture"];

// ==== 3. Guardar / actualizar en DB ====
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// ¿Existe el usuario?
$stmt = $conn->prepare("SELECT id, username, role FROM users WHERE google_id = ?");
$stmt->bind_param("s", $google_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    // Usuario existente - actualizar last_login y obtener datos
    $stmt->bind_result($userId, $username, $role);
    $stmt->fetch();
    
    $session = uniqid('session_' . time() . '_', true);
    $update = $conn->prepare("UPDATE users SET session = ?, last_login = NOW() WHERE id = ?");
    $update->bind_param("si", $session, $userId);
    $update->execute();
} else {
    // Nuevo usuario - crear cuenta
    $username = $name;
    $session = uniqid('session_' . time() . '_', true);
    $role = 'user';
    
    $insert = $conn->prepare("INSERT INTO users (username, google_id, email, picture, session, login_method, role) VALUES (?, ?, ?, ?, ?, 'google', 'user')");
    $insert->bind_param("sssss", $username, $google_id, $email, $picture, $session);
    $insert->execute();
}

$conn->close();

// ==== 4. Crear sesión en localStorage (via JavaScript) ====
?>
<!DOCTYPE html>
<html>
<head>
    <title>Autenticando...</title>
    <script>
        // Guardar sesión en localStorage
        const sessionData = {
            username: <?= json_encode($username) ?>,
            userSession: <?= json_encode($session) ?>,
            userRole: <?= json_encode($role) ?>,
            loginMethod: 'google',
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
        };
        
        localStorage.setItem('esn_ideas_session', JSON.stringify(sessionData));
        
        // Redirigir a la aplicación
        window.location.href = '/ideas-esn/index.html';
    </script>
</head>
<body>
    <p>Autenticando con Google...</p>
</body>
</html>
