// ===== GESTIÓN DE ADJUNTOS =====

// Arrays para almacenar adjuntos temporalmente
let proposalAttachments = [];
let problemAttachments = [];

// Añadir adjunto a propuesta
function addProposalAttachment() {
    if (proposalAttachments.length >= 5) {
        showToast('Máximo 5 archivos permitidos', 'error');
        return;
    }
    
    const url = prompt('Introduce la URL del archivo (Google Drive, Dropbox, etc.):');
    if (!url) return;
    
    if (!isValidUrl(url)) {
        showToast('La URL no es válida', 'error');
        return;
    }
    
    const name = prompt('Nombre del archivo (ej: "Documento.pdf"):');
    if (!name) return;
    
    // Detectar tipo de archivo
    const extension = name.split('.').pop().toLowerCase();
    let type = 'document';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        type = 'image';
    } else if (extension === 'pdf') {
        type = 'pdf';
    }
    
    proposalAttachments.push({ url, name, type });
    renderProposalAttachments();
}

// Renderizar lista de adjuntos de propuesta
function renderProposalAttachments() {
    const container = document.getElementById('proposalAttachmentsList');
    if (!container) return;
    
    container.innerHTML = proposalAttachments.map((file, index) => `
        <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span class="flex-1 text-sm truncate">
                ${escapeHtml(file.name)}
            </span>
            <button type="button" onclick="removeProposalAttachment(${index})" 
                    class="text-red-500 hover:text-red-700 font-bold">
                ✕
            </button>
        </div>
    `).join('');
}

// Eliminar adjunto de propuesta
function removeProposalAttachment(index) {
    proposalAttachments.splice(index, 1);
    renderProposalAttachments();
}

// Añadir adjunto a problema
function addProblemAttachment() {
    if (problemAttachments.length >= 5) {
        showToast('Máximo 5 archivos permitidos', 'error');
        return;
    }
    
    const url = prompt('Introduce la URL del archivo (Google Drive, Dropbox, etc.):');
    if (!url) return;
    
    if (!isValidUrl(url)) {
        showToast('La URL no es válida', 'error');
        return;
    }
    
    const name = prompt('Nombre del archivo (ej: "Documento.pdf"):');
    if (!name) return;
    
    // Detectar tipo de archivo
    const extension = name.split('.').pop().toLowerCase();
    let type = 'document';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        type = 'image';
    } else if (extension === 'pdf') {
        type = 'pdf';
    }
    
    problemAttachments.push({ url, name, type });
    renderProblemAttachments();
}

// Renderizar lista de adjuntos de problema
function renderProblemAttachments() {
    const container = document.getElementById('problemAttachmentsList');
    if (!container) return;
    
    container.innerHTML = problemAttachments.map((file, index) => `
        <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span class="flex-1 text-sm truncate">
                ${escapeHtml(file.name)}
            </span>
            <button type="button" onclick="removeProblemAttachment(${index})" 
                    class="text-red-500 hover:text-red-700 font-bold">
                ✕
            </button>
        </div>
    `).join('');
}

// Eliminar adjunto de problema
function removeProblemAttachment(index) {
    problemAttachments.splice(index, 1);
    renderProblemAttachments();
}

// Limpiar adjuntos al cerrar modal
function clearProposalAttachments() {
    proposalAttachments = [];
    renderProposalAttachments();
}

function clearProblemAttachments() {
    problemAttachments = [];
    renderProblemAttachments();
}
