<?php
session_start();
?>

<!DOCTYPE html>
<html>
<head>
    <title>Login con Google</title>
</head>
<body>

<?php if (!isset($_SESSION["user"])): ?>

    <h2>Login con Google</h2>
    <?php
    require 'config.php';

    $auth_url = $GOOGLE_AUTH_URL . "?" . http_build_query([
        "client_id"     => $GOOGLE_CLIENT_ID,
        "redirect_uri"  => $GOOGLE_REDIRECT_URI,
        "response_type" => "code",
        "scope"         => "openid email profile"
    ]);
    ?>

    <a href="<?= $auth_url ?>">
        <button style="padding:10px 20px;">Iniciar sesión con Google</button>
    </a>

<?php else: ?>

    <h2>Bienvenido, <?= $_SESSION["user"]["name"] ?>!</h2>
    <img src="<?= $_SESSION["user"]["picture"] ?>" width="80" style="border-radius:50%;">
    <p>Email: <?= $_SESSION["user"]["email"] ?></p>
    <p><a href="logout.php">Cerrar sesión</a></p>

<?php endif; ?>

</body>
</html>
