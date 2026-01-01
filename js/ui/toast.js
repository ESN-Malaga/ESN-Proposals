// ===== SISTEMA DE NOTIFICACIONES (TOAST) =====

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
        padding: 16px 24px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-out;
        margin-bottom: 8px;
        min-width: 250px;
    `;
    
    // Set background based on type
    if (type === 'success') {
        toast.style.background = 'linear-gradient(135deg, #10B981, #059669)';
    } else if (type === 'error') {
        toast.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
    } else {
        toast.style.background = 'linear-gradient(135deg, #3B82F6, #2563EB)';
    }
    
    toast.textContent = message;
    container.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}
