// ===== SISTEMA DE APORTACIONES =====

let currentContributionItem = { id: null, type: null };

function showContributionModal(itemId, itemType) {
    currentContributionItem = { id: itemId, type: itemType };
    document.getElementById('contributionText').value = '';
    showModal('contributionModal');
}

async function submitContribution() {
    const text = document.getElementById('contributionText').value.trim();
    
    if (!text) {
        showToast('Por favor escribe tu aportación', 'error');
        return;
    }
    
    // Estado de carga
    const submitBtn = document.querySelector('#contributionModal button.bg-blue-600');
    if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        try {
            const response = await fetch('api-complete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_contribution',
                    item_type: currentContributionItem.type,
                    item_id: currentContributionItem.id,
                    session: userSession,
                    username: username,
                    text: text
                })
            });
            
            const result = await response.json();
            if (result.success) {
                showToast('✨ Aportación enviada', 'success');
                closeModal('contributionModal');
                // Recargar detalle para mostrar nueva aportación
                if (currentContributionItem.type === 'proposal') {
                    showProposalDetail(currentContributionItem.id);
                } else if (currentContributionItem.type === 'problem') {
                    showProblemDetail(currentContributionItem.id);
                } else if (currentContributionItem.type === 'match') {
                    loadMatches();
                }
            } else {
                showToast(result.error || 'Error al enviar aportación', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al enviar aportación', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}

async function deleteContribution(id, itemType, itemId) {
    if (!confirm('¿Seguro que quieres borrar esta aportación?')) return;
    
    try {
        const response = await fetch('api-complete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete_contribution',
                id: id,
                session: userSession
            })
        });
        
        const result = await response.json();
        if (result.success) {
            showToast('Aportación borrada', 'success');
            
            // Recargar vista según tipo
            if (itemType === 'proposal') {
                showProposalDetail(itemId);
            } else if (itemType === 'problem') {
                showProblemDetail(itemId);
            } else if (itemType === 'match') {
                loadMatches(); // Recargar lista de matches
            }
        } else {
            showToast(result.error || 'Error al borrar', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al borrar aportación', 'error');
    }
}
