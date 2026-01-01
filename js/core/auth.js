// ===== AUTENTICACIÓN DUAL (Password + Google OAuth) =====

const SESSION_KEY = 'esn_ideas_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 días

// Guardar sesión en localStorage
function saveSession(loginMethod = 'manual') {
    const sessionData = {
        username: username,
        userSession: userSession,
        userRole: userRole,
        loginMethod: loginMethod,
        expiresAt: Date.now() + SESSION_DURATION
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
}

// Cargar sesión desde localStorage
function loadSession() {
    try {
        const data = localStorage.getItem(SESSION_KEY);
        if (!data) return null;
        
        const session = JSON.parse(data);
        
        // Verificar si la sesión ha expirado
        if (Date.now() > session.expiresAt) {
            clearSession();
            return null;
        }
        
        return session;
    } catch (error) {
        console.error('Error al cargar sesión:', error);
        clearSession();
        return null;
    }
}

// Limpiar sesión
function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

// Verificar y restaurar sesión al cargar la página
async function checkSession() {
    const session = loadSession();
    
    if (session) {
        // Restaurar variables globales
        username = session.username;
        userSession = session.userSession;
        userRole = session.userRole;
        
        // Mostrar interfaz
        showMainScreen();
        
        // Mensaje de bienvenida
        showToast(`¡Bienvenido de nuevo, ${username}!`, 'success');
        
        return true;
    }
    
    return false;
}

// Mostrar pantalla principal
function showMainScreen() {
    document.getElementById('currentUser').textContent = username;
    const badge = userRole === 'moderator'
        ? '<span class="bg-[#EC008C] text-white text-xs px-3 py-1 rounded-full font-bold">MODERADOR</span>'
        : '<span class="bg-[#00AEEF] text-white text-xs px-3 py-1 rounded-full font-bold">USUARIO</span>';
    document.getElementById('roleBadge').innerHTML = badge;
    
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainScreen').classList.remove('hidden');
    switchTab('proposals');
    
    // Iniciar auto-refresh
    startAutoRefresh();
    
    // Inicializar filtros
    initializeFilters();
}

// Cambiar entre tabs Login/Registro
function switchAuthTab(tab) {
    const loginTab = document.getElementById('tabLogin');
    const registerTab = document.getElementById('tabRegister');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (tab === 'login') {
        loginTab.style.background = 'linear-gradient(135deg, #00aeef, #ec008c)';
        loginTab.style.color = 'white';
        registerTab.style.background = '#e5e7eb';
        registerTab.style.color = '#374151';
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        registerTab.style.background = 'linear-gradient(135deg, #00aeef, #ec008c)';
        registerTab.style.color = 'white';
        loginTab.style.background = '#e5e7eb';
        loginTab.style.color = '#374151';
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

// LOGIN CON CONTRASEÑA
async function login() {
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    
    if (!usernameInput.value.trim() || !passwordInput.value) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    const loginBtn = document.getElementById('loginButton');
    const loginBtnText = document.getElementById('loginButtonText');
    const originalText = loginBtnText.textContent;
    
    loginBtn.disabled = true;
    loginBtnText.textContent = 'Entrando...';
    
    try {
        const response = await fetch('api-complete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'login',
                username: usernameInput.value.trim(),
                password: passwordInput.value
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            username = result.username;
            userSession = result.session;
            userRole = result.role;
            
            saveSession('manual');
            showMainScreen();
            showToast(`¡Bienvenido, ${username}!`, 'success');
        } else {
            showToast(result.error || 'Error al iniciar sesión', 'error');
            passwordInput.value = '';
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    } finally {
        loginBtn.disabled = false;
        loginBtnText.textContent = originalText;
    }
}

// REGISTRO CON CONTRASEÑA
async function register() {
    const usernameInput = document.getElementById('registerUsername');
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const confirmInput = document.getElementById('registerPasswordConfirm');
    
    // Validaciones
    if (!usernameInput.value.trim()) {
        showToast('Por favor ingresa un usuario', 'error');
        return;
    }
    
    if (passwordInput.value.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    if (passwordInput.value !== confirmInput.value) {
        showToast('Las contraseñas no coinciden', 'error');
        return;
    }
    
    const registerBtn = document.getElementById('registerButton');
    const registerBtnText = document.getElementById('registerButtonText');
    const originalText = registerBtnText.textContent;
    
    registerBtn.disabled = true;
    registerBtnText.textContent = 'Creando cuenta...';
    
    try {
        const response = await fetch('api-complete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'register',
                username: usernameInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            username = result.username;
            userSession = result.session;
            userRole = result.role;
            
            saveSession('manual');
            showMainScreen();
            showToast(`¡Cuenta creada! Bienvenido, ${username}!`, 'success');
        } else {
            showToast(result.error || 'Error al registrarse', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    } finally {
        registerBtn.disabled = false;
        registerBtnText.textContent = originalText;
    }
}

// LOGIN CON GOOGLE OAUTH
function loginWithGoogle() {
    // Configuración de Google OAuth
    const GOOGLE_CLIENT_ID = "883668928240-r08gsh21u3u7erm681t649is5104ugan.apps.googleusercontent.com";
    const GOOGLE_REDIRECT_URI = "http://localhost/google-auth";
    const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/auth";
    
    const authUrl = GOOGLE_AUTH_URL + "?" + new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: "openid email profile"
    });
    
    // Redirigir a Google OAuth
    window.location.href = authUrl;
}

// Cerrar sesión
function logout() {
    if (confirm('¿Seguro que quieres cerrar sesión?')) {
        clearSession();
        
        // Limpiar variables globales
        username = '';
        userSession = '';
        userRole = 'user';
        
        // Volver a pantalla de login
        document.getElementById('mainScreen').classList.add('hidden');
        document.getElementById('loginScreen').classList.remove('hidden');
        
        // Limpiar formularios
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        
        showToast('Sesión cerrada correctamente', 'success');
    }
}
