// ===== GESTIÓN DE MODALES =====

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Sistema de confirmación
let confirmCallback = null;

function showConfirm(title, message) {
    return new Promise((resolve) => {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        confirmCallback = resolve;
        showModal('confirmModal');
    });
}

function handleConfirm(confirmed) {
    closeModal('confirmModal');
    if (confirmCallback) {
        confirmCallback(confirmed);
        confirmCallback = null;
    }
}
