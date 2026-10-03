// ===== FUNCIONES AUXILIARES =====

function generateSession() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function hasOpenModals() {
    const modals = document.querySelectorAll('.modal.active');
    return modals.length > 0;
}

// Debounce: Retrasa la ejecución de una función hasta que pasen X ms sin llamadas
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Validación de URLs para imágenes
function isValidUrl(string) {
    if (!string || string.trim() === '') return true; // URLs vacías son válidas (opcional)
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

function startAutoRefresh() {
    setInterval(() => {
        // Solo actualizar si NO hay modales abiertos
        if (!hasOpenModals() && currentTab !== 'matches') {
            loadCurrentTab();
        }
    }, 10000); // 10 segundos
}
