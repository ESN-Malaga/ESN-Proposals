// ===== ARCHIVO PRINCIPAL =====

// Navegación entre tabs
function switchTab(tab) {
    currentTab = tab;
    
    // Actualizar estilos de tabs
    document.querySelectorAll('[id^="tab"]').forEach(btn => {
        btn.classList.remove('tab-active');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    const activeTab = document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (activeTab) {
        activeTab.classList.add('tab-active');
        activeTab.classList.remove('bg-gray-200', 'text-gray-700');
    }

    // Cargar contenido
    loadCurrentTab();
}

function loadCurrentTab() {
    switch(currentTab) {
        case 'proposals':
            loadProposals();
            break;
        case 'problems':
            loadProblems();
            break;
        case 'matches':
            loadMatches();
            break;
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si hay sesión guardada
    await checkSession();
    
    // Event listener para login con Enter
    document.getElementById('usernameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') login();
    });
});
