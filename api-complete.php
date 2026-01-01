<?php
// api-complete.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Error de conexión: ' . $conn->connect_error]));
}

$conn->set_charset("utf8mb4");

$action = isset($_GET['action']) ? $_GET['action'] : '';

// ===== FUNCIONES DE USUARIOS =====
function getUserRole($conn, $session) {
    $session = $conn->real_escape_string($session);
    $sql = "SELECT role FROM users WHERE session = '$session'";
    $result = $conn->query($sql);
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['role'];
    }
    return 'user';
}

function isModerator($conn, $session) {
    return getUserRole($conn, $session) === 'moderator';
}

function registerUser($conn, $username, $session, $role = 'user') {
    $username = $conn->real_escape_string($username);
    $session = $conn->real_escape_string($session);
    
    // Check if this username already exists with a moderator role
    $checkSql = "SELECT role FROM users WHERE username = '$username' LIMIT 1";
    $result = $conn->query($checkSql);
    
    if ($result && $result->num_rows > 0) {
        $existingUser = $result->fetch_assoc();
        // If user was already a moderator, keep that role
        if ($existingUser['role'] === 'moderator') {
            $role = 'moderator';
        }
    }
    
    $role = $conn->real_escape_string($role);
    
    $sql = "INSERT INTO users (username, session, role) VALUES ('$username', '$session', '$role') 
            ON DUPLICATE KEY UPDATE username = '$username'";
    return $conn->query($sql);
}

// ===== MANEJO DE REQUESTS =====
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = isset($data['action']) ? $data['action'] : '';
    
    // ===== AUTENTICACIÓN =====
    
    // REGISTRO CON CONTRASEÑA
    if ($action === 'register') {
        $username = $conn->real_escape_string($data['username']);
        $password = $data['password'];
        $email = $conn->real_escape_string($data['email'] ?? '');
        
        // Verificar si el usuario ya existe
        $check = $conn->query("SELECT id FROM users WHERE username = '$username'");
        if ($check && $check->num_rows > 0) {
            echo json_encode(['error' => 'El usuario ya existe']);
            exit;
        }
        
        // Hash de la contraseña
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $session = uniqid('session_' . time() . '_', true);
        
        $sql = "INSERT INTO users (username, password_hash, session, login_method, email, role) 
                VALUES ('$username', '$password_hash', '$session', 'manual', '$email', 'user')";
        
        if ($conn->query($sql)) {
            echo json_encode([
                'success' => true,
                'session' => $session,
                'username' => $username,
                'role' => 'user'
            ]);
        } else {
            echo json_encode(['error' => 'Error al registrar: ' . $conn->error]);
        }
    }
    
    // LOGIN CON CONTRASEÑA
    elseif ($action === 'login') {
        $username = $conn->real_escape_string($data['username']);
        $password = $data['password'];
        
        // Buscar usuario
        $sql = "SELECT id, username, password_hash, role FROM users 
                WHERE username = '$username' AND login_method = 'manual'";
        $result = $conn->query($sql);
        
        if ($result && $result->num_rows > 0) {
            $user = $result->fetch_assoc();
            
            // Verificar contraseña
            if (password_verify($password, $user['password_hash'])) {
                // Generar nueva sesión
                $session = uniqid('session_' . time() . '_', true);
                $userId = $user['id'];
                
                // Actualizar sesión y last_login
                $conn->query("UPDATE users SET session = '$session', last_login = NOW() WHERE id = $userId");
                
                echo json_encode([
                    'success' => true,
                    'session' => $session,
                    'username' => $user['username'],
                    'role' => $user['role']
                ]);
            } else {
                echo json_encode(['error' => 'Contraseña incorrecta']);
            }
        } else {
            echo json_encode(['error' => 'Usuario no encontrado']);
        }
    }
    
    // VALIDAR SESIÓN (para auto-login)
    elseif ($action === 'validate_session') {
        $session = $conn->real_escape_string($data['session']);
        
        $sql = "SELECT username, role FROM users WHERE session = '$session'";
        $result = $conn->query($sql);
        
        if ($result && $result->num_rows > 0) {
            $user = $result->fetch_assoc();
            echo json_encode([
                'valid' => true,
                'username' => $user['username'],
                'role' => $user['role']
            ]);
        } else {
            echo json_encode(['valid' => false]);
        }
    }
    
    // REGISTRAR/LOGIN USUARIO (legacy - mantener compatibilidad)
    elseif ($action === 'register_user') {
        $username = $data['username'];
        $session = $data['session'];
        
        if (registerUser($conn, $username, $session)) {
            $role = getUserRole($conn, $session);
            echo json_encode(['success' => true, 'role' => $role]);
        } else {
            echo json_encode(['error' => 'Error al registrar usuario']);
        }
    }
    
    // ===== PROPUESTAS =====
    elseif ($action === 'create_proposal') {
        $username = $conn->real_escape_string($data['username']);
        $session = $conn->real_escape_string($data['session']);
        $title = $conn->real_escape_string($data['title']);
        $description = $conn->real_escape_string($data['description'] ?? '');
        $slack_url = $conn->real_escape_string($data['slack_url'] ?? '');
        $attachments = $conn->real_escape_string($data['attachments'] ?? '[]');
        $category = $conn->real_escape_string($data['category']);
        $color = $conn->real_escape_string($data['color']);
        
        registerUser($conn, $username, $session);
        
        $sql = "INSERT INTO proposals (user_session, username, title, description, slack_url, attachments, category, color) 
                VALUES ('$session', '$username', '$title', '$description', '$slack_url', '$attachments', '$category', '$color')";
        
        if ($conn->query($sql)) {
            echo json_encode(['success' => true, 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['error' => 'Error al crear propuesta: ' . $conn->error]);
        }
    }
    
    elseif ($action === 'edit_proposal') {
        $id = (int)$data['id'];
        $session = $conn->real_escape_string($data['session']);
        $title = $conn->real_escape_string($data['title']);
        $description = $conn->real_escape_string($data['description'] ?? '');
        $image_url = $conn->real_escape_string($data['image_url'] ?? '');
        
        // Solo el creador puede editar, a menos que esté bloqueado
        $sql = "UPDATE proposals SET title = '$title', description = '$description', image_url = '$image_url' 
                WHERE id = $id AND user_session = '$session' AND is_locked = FALSE";
        
        if ($conn->query($sql)) {
            if ($conn->affected_rows > 0) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['error' => 'No puedes editar esta propuesta']);
            }
        } else {
            echo json_encode(['error' => 'Error al editar: ' . $conn->error]);
        }
    }
    
    elseif ($action === 'delete_proposal') {
        $id = (int)$data['id'];
        $session = $conn->real_escape_string($data['session']);
        
        // Usuario puede borrar su propia propuesta, moderador puede borrar cualquiera
        if (isModerator($conn, $session)) {
            $sql = "DELETE FROM proposals WHERE id = $id";
        } else {
            $sql = "DELETE FROM proposals WHERE id = $id AND user_session = '$session'";
        }
        
        if ($conn->query($sql)) {
            if ($conn->affected_rows > 0) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['error' => 'No puedes borrar esta propuesta']);
            }
        } else {
            echo json_encode(['error' => 'Error al borrar: ' . $conn->error]);
        }
    }
    
    elseif ($action === 'highlight_proposal') {
        $id = (int)$data['id'];
        $session = $conn->real_escape_string($data['session']);
        $highlighted = $data['highlighted'] ? 1 : 0;
        
        if (!isModerator($conn, $session)) {
            echo json_encode(['error' => 'Solo moderadores pueden destacar propuestas']);
            exit;
        }
        
        $sql = "UPDATE proposals SET is_highlighted = $highlighted WHERE id = $id";
        
        if ($conn->query($sql)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Error: ' . $conn->error]);
        }
    }
    
    elseif ($action === 'lock_proposal') {
        $id = (int)$data['id'];
        $session = $conn->real_escape_string($data['session']);
        $locked = $data['locked'] ? 1 : 0;
        
        if (!isModerator($conn, $session)) {
            echo json_encode(['error' => 'Solo moderadores pueden bloquear propuestas']);
            exit;
        }
        
        $sql = "UPDATE proposals SET is_locked = $locked WHERE id = $id";
        
        if ($conn->query($sql)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Error: ' . $conn->error]);
        }
    }
    
    // ===== PROBLEMAS =====
    elseif ($action === 'create_problem') {
        $username = $conn->real_escape_string($data['username']);
        $session = $conn->real_escape_string($data['session']);
        $title = $conn->real_escape_string($data['title']);
        $description = $conn->real_escape_string($data['description'] ?? '');
        $slack_url = $conn->real_escape_string($data['slack_url'] ?? '');
        $attachments = $conn->real_escape_string($data['attachments'] ?? '[]');
        $category = $conn->real_escape_string($data['category']);
        $color = $conn->real_escape_string($data['color']);
        
        registerUser($conn, $username, $session);
        
        $sql = "INSERT INTO problems (user_session, username, title, description, slack_url, attachments, category, color) 
                VALUES ('$session', '$username', '$title', '$description', '$slack_url', '$attachments', '$category', '$color')";
        
        if ($conn->query($sql)) {
            $problem_id = $conn->insert_id;
            // Auto-agregar al creador como supporter
            $sql2 = "INSERT INTO problem_supporters (problem_id, user_session, username) 
                     VALUES ($problem_id, '$session', '$username')";
            $conn->query($sql2);
            
            echo json_encode(['success' => true, 'id' => $problem_id]);
        } else {
            echo json_encode(['error' => 'Error al crear problema: ' . $conn->error]);
        }
    }
    
    elseif ($action === 'support_problem') {
        $problem_id = (int)$data['problem_id'];
        $session = $conn->real_escape_string($data['session']);
        $username = $conn->real_escape_string($data['username']);
        
        // Agregar apoyo
        $sql = "INSERT IGNORE INTO problem_supporters (problem_id, user_session, username) 
                VALUES ($problem_id, '$session', '$username')";
        
        if ($conn->query($sql)) {
            // Actualizar contador
            $sql2 = "UPDATE problems SET support_count = (SELECT COUNT(*) FROM problem_supporters WHERE problem_id = $problem_id) 
                     WHERE id = $problem_id";
            $conn->query($sql2);
            
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Error: ' . $conn->error]);
        }
    }
    
    elseif ($action === 'unsupport_problem') {
        $problem_id = (int)$data['problem_id'];
        $session = $conn->real_escape_string($data['session']);
        
        // Verificar que no sea el creador
        $check = "SELECT user_session FROM problems WHERE id = $problem_id";
        $result = $conn->query($check);
        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            if ($row['user_session'] === $session) {
                echo json_encode(['error' => 'El creador no puede quitar su apoyo']);
                exit;
            }
        }
        
        $sql = "DELETE FROM problem_supporters WHERE problem_id = $problem_id AND user_session = '$session'";
        
        if ($conn->query($sql)) {
            // Actualizar contador
            $sql2 = "UPDATE problems SET support_count = (SELECT COUNT(*) FROM problem_supporters WHERE problem_id = $problem_id) 
                     WHERE id = $problem_id";
            $conn->query($sql2);
            
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Error: ' . $conn->error]);
        }
    }
    
    // ===== APOYO A PROPUESTAS =====
    elseif ($action === 'support_proposal') {
        $proposal_id = (int)$data['proposal_id'];
        $session = $conn->real_escape_string($data['session']);
        $username = $conn->real_escape_string($data['username']);
        
        // Agregar apoyo
        $sql = "INSERT IGNORE INTO proposal_support (proposal_id, user_session, username) 
                VALUES ($proposal_id, '$session', '$username')";
        
        if ($conn->query($sql)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Error: ' . $conn->error]);
        }
    }
    
    elseif ($action === 'unsupport_proposal') {
        $proposal_id = (int)$data['proposal_id'];
        $session = $conn->real_escape_string($data['session']);
        
        $sql = "DELETE FROM proposal_support WHERE proposal_id = $proposal_id AND user_session = '$session'";
        
        if ($conn->query($sql)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Error: ' . $conn->error]);
        }
    }
    
    elseif ($action === 'delete_problem') {
        $id = (int)$data['id'];
        $session = $conn->real_escape_string($data['session']);
        
        if (isModerator($conn, $session)) {
            $sql = "DELETE FROM problems WHERE id = $id";
        } else {
            $sql = "DELETE FROM problems WHERE id = $id AND user_session = '$session'";
        }
        
        if ($conn->query($sql)) {
            if ($conn->affected_rows > 0) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['error' => 'No puedes borrar este problema']);
            }
        } else {
            echo json_encode(['error' => 'Error: ' . $conn->error]);
        }
    }
    
    elseif ($action === 'edit_problem') {
        $id = (int)$data['id'];
        $session = $conn->real_escape_string($data['session']);
        $title = $conn->real_escape_string($data['title']);
        $description = $conn->real_escape_string($data['description'] ?? '');
        $category = $conn->real_escape_string($data['category']);
        
        // Solo el creador puede editar su problema
        $sql = "UPDATE problems SET title = '$title', description = '$description', category = '$category' 
                WHERE id = $id AND user_session = '$session'";
        
        if ($conn->query($sql)) {
            if ($conn->affected_rows > 0) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['error' => 'No puedes editar este problema']);
            }
        } else {
            echo json_encode(['error' => 'Error al editar: ' . $conn->error]);
        }
    }
    
    // ===== MATCHES =====
    elseif ($action === 'create_match') {
        $problem_id = (int)$data['problem_id'];
        $proposal_id = (int)$data['proposal_id'];
        $session = $conn->real_escape_string($data['session']);
        $username = $conn->real_escape_string($data['username']);
        $notes = $conn->real_escape_string($data['notes'] ?? '');
        
        // Todos los usuarios pueden crear matches (visible inmediatamente)
        $status = 'published'; // Matches visibles para todos
        
        $sql = "INSERT INTO matches (problem_id, proposal_id, moderator_session, moderator_username, notes, status) 
                VALUES ($problem_id, $proposal_id, '$session', '$username', '$notes', '$status')";
        
        if ($conn->query($sql)) {
            echo json_encode(['success' => true, 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['error' => 'Error: ' . $conn->error]);
        }
    }
    
    elseif ($action === 'delete_match') {
        $id = (int)$data['id'];
        $session = $conn->real_escape_string($data['session']);
        
        if (!isModerator($conn, $session)) {
            echo json_encode(['error' => 'Solo moderadores pueden borrar matches']);
            exit;
        }
        
        $sql = "DELETE FROM matches WHERE id = $id";
        
        if ($conn->query($sql)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Error: ' . $conn->error]);
        }
    }
    
    // ===== APORTACIONES/CONTRIBUCIONES (POST) =====
    elseif ($action === 'create_contribution') {
        $item_type = $conn->real_escape_string($data['item_type']);
        $item_id = (int)$data['item_id'];
        $session = $conn->real_escape_string($data['session']);
        $username = $conn->real_escape_string($data['username']);
        $text = $conn->real_escape_string($data['text']);
        
        // Verificar que NO sea el owner
        $table = '';
        $ownerField = 'user_session';
        
        if ($item_type === 'proposal') {
            $table = 'proposals';
        } elseif ($item_type === 'problem') {
            $table = 'problems';
        } elseif ($item_type === 'match') {
            $table = 'matches';
            $ownerField = 'moderator_session';
        }
        
        $check = $conn->query("SELECT $ownerField as owner_session FROM $table WHERE id = $item_id");
        
        if ($check && $check->num_rows > 0) {
            $item = $check->fetch_assoc();
            
            if ($item['owner_session'] === $session) {
                echo json_encode(['error' => 'No puedes aportar a tu propio item']);
            } else {
                $sql = "INSERT INTO contributions (item_type, item_id, user_session, username, contribution_text) 
                        VALUES ('$item_type', $item_id, '$session', '$username', '$text')";
                
                if ($conn->query($sql)) {
                    echo json_encode(['success' => true]);
                } else {
                    echo json_encode(['error' => 'Error al crear aportación: ' . $conn->error]);
                }
            }
        } else {
            echo json_encode(['error' => 'Item no encontrado']);
        }
    }
    
    elseif ($action === 'delete_contribution') {
        $id = (int)$data['id'];
        $session = $conn->real_escape_string($data['session']);
        
        // Verificar permisos (owner o moderador)
        if (isModerator($conn, $session)) {
            $sql = "DELETE FROM contributions WHERE id = $id";
        } else {
            $sql = "DELETE FROM contributions WHERE id = $id AND user_session = '$session'";
        }
        
        if ($conn->query($sql)) {
            if ($conn->affected_rows > 0) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['error' => 'No puedes borrar esta aportación']);
            }
        } else {
            echo json_encode(['error' => 'Error al borrar: ' . $conn->error]);
        }
    }
}

// ===== GET REQUESTS =====
elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    if ($action === 'get_user_role') {
        $session = $_GET['session'] ?? '';
        $role = getUserRole($conn, $session);
        echo json_encode(['role' => $role]);
    }
    
    elseif ($action === 'load_proposals') {
        $category = isset($_GET['category']) ? $conn->real_escape_string($_GET['category']) : '';
        
        $sql = "SELECT p.*, 
                COALESCE(COUNT(ps.id), 0) as support_count
                FROM proposals p
                LEFT JOIN proposal_support ps ON p.id = ps.proposal_id";
        if ($category) {
            $sql .= " WHERE p.category = '$category'";
        }
        $sql .= " GROUP BY p.id ORDER BY p.is_highlighted DESC, p.created_at DESC";
        
        $result = $conn->query($sql);
        $proposals = [];
        if ($result && $result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $proposals[] = $row;
            }
        }
        echo json_encode($proposals);
    }
    
    elseif ($action === 'check_proposal_support') {
        $proposal_id = (int)$_GET['proposal_id'];
        $session = $conn->real_escape_string($_GET['session']);
        
        $sql = "SELECT id FROM proposal_support WHERE proposal_id = $proposal_id AND user_session = '$session'";
        $result = $conn->query($sql);
        
        echo json_encode(['is_supporting' => $result && $result->num_rows > 0]);
    }
    
    elseif ($action === 'load_problems') {
        $category = isset($_GET['category']) ? $conn->real_escape_string($_GET['category']) : '';
        
        $sql = "SELECT p.*, 
                (SELECT GROUP_CONCAT(username SEPARATOR ', ') FROM problem_supporters WHERE problem_id = p.id) as supporters
                FROM problems p";
        if ($category) {
            $sql .= " WHERE p.category = '$category'";
        }
        $sql .= " ORDER BY p.support_count DESC, p.created_at DESC";
        
        $result = $conn->query($sql);
        $problems = [];
        if ($result && $result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $problems[] = $row;
            }
        }
        echo json_encode($problems);
    }
    
    elseif ($action === 'check_support') {
        $problem_id = (int)$_GET['problem_id'];
        $session = $conn->real_escape_string($_GET['session']);
        
        $sql = "SELECT id FROM problem_supporters WHERE problem_id = $problem_id AND user_session = '$session'";
        $result = $conn->query($sql);
        
        echo json_encode(['is_supporting' => $result && $result->num_rows > 0]);
    }
    
    elseif ($action === 'load_matches') {
        $sql = "SELECT m.*, 
                p.title as problem_title, p.category as problem_category,
                pr.title as proposal_title, pr.category as proposal_category
                FROM matches m
                JOIN problems p ON m.problem_id = p.id
                JOIN proposals pr ON m.proposal_id = pr.id
                ORDER BY m.created_at DESC";
        
        $result = $conn->query($sql);
        $matches = [];
        if ($result && $result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $matches[] = $row;
            }
        }
        echo json_encode($matches);
    }

    // ===== APORTACIONES/CONTRIBUCIONES (GET) =====
    elseif ($action === 'load_contributions') {
        $item_type = $conn->real_escape_string($_GET['item_type']);
        $item_id = (int)$_GET['item_id'];
        
        $sql = "SELECT * FROM contributions 
                WHERE item_type = '$item_type' AND item_id = $item_id 
                ORDER BY created_at DESC";
        
        $contributions = [];
        
        // Check if table exists first
        $checkTable = $conn->query("SHOW TABLES LIKE 'contributions'");
        if ($checkTable && $checkTable->num_rows > 0) {
            $result = $conn->query($sql);
            if ($result && $result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $contributions[] = $row;
                }
            }
        }
        
        echo json_encode($contributions);
    }
}

$conn->close();
?>