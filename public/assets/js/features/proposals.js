// ===== PROPUESTAS =====

async function loadProposals() {
    try {
        const response = await fetch('api-complete.php?action=load_proposals');
        const proposals = await response.json();
        allProposals = proposals; // Guardar para filtrado
        
        // Aplicar filtros si existen
        const filtered = filterItems(proposals, currentSearchTerm, currentCategoryFilter);
        displayProposals(filtered);
        updateResultCount(filtered.length, proposals.length);
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayProposals(proposals) {
    const container = document.getElementById('contentArea');
    
    if (proposals.length === 0) {
        const hasFilters = currentSearchTerm || currentCategoryFilter;
        container.innerHTML = `
            <div class="empty-state">

                <h3 class="text-2xl font-bold text-white mb-2">${hasFilters ? 'No se encontraron propuestas' : 'No hay propuestas aún'}</h3>
                <p class="text-white/80">${hasFilters ? 'Intenta con otros filtros' : '¡Sé el primero en crear una propuesta!'}</p>
                ${!hasFilters ? '<button onclick="showModal(\'proposalModal\')" class="mt-4 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition">Crear Primera Propuesta</button>' : ''}
            </div>
        `;
        return;
    }

    container.innerHTML = proposals.map(p => {
        // Force size 1.1 for uniformity as requested
        const size = 1.1; // p.is_highlighted ? 1.3 : 1;
        const color = categoryColors[p.category] || '#999';
        const isOwner = p.username === username;
        
        return `
            <div class="word-bubble cursor-pointer text-white font-bold text-center p-4 ${isOwner ? 'relative' : ''}" 
                 style="background: ${color}; --base-scale: ${size};"
                 onclick="showProposalDetail(${p.id})">
                ${escapeHtml(p.title)}
                ${isOwner ? '<span class="absolute bottom-1 right-2 text-xs bg-white/40 rounded px-2 py-0.5">Tu</span>' : ''}
            </div>
        `;
    }).join('');
}

async function showProposalDetail(id) {
    try {
        const response = await fetch('api-complete.php?action=load_proposals');
        const proposals = await response.json();
        const proposal = proposals.find(p => p.id == id);

        if (!proposal) return;

        // Verificar si el usuario apoya esta propuesta
        const checkResponse = await fetch(`api-complete.php?action=check_proposal_support&proposal_id=${id}&session=${userSession}`);
        const checkResult = await checkResponse.json();
        const isSupporting = checkResult.is_supporting;

        const isOwner = proposal.username === username;
        const canDelete = isOwner || userRole === 'moderator';

        // Cargar aportaciones (con manejo de errores)
        let contributions = [];
        try {
            const contribResponse = await fetch(`api-complete.php?action=load_contributions&item_type=proposal&item_id=${id}`);
            if (contribResponse.ok) {
                contributions = await contribResponse.json();
            }
        } catch (e) {
            console.warn('No se pudieron cargar aportaciones:', e);
        }

        let actions = '';
        
        // Botón de apoyo (solo si no es el creador)
        if (!isOwner) {
            if (isSupporting) {
                actions += `<button onclick="unsupportProposal(${id})" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Quitar apoyo</button>`;
            } else {
                actions += `<button onclick="supportProposal(${id})" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Apoyar</button>`;
            }
            // Botón de aportar (solo si no es el creador)
            actions += `<button onclick="showContributionModal(${id}, 'proposal')" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Aportar</button>`;
        }
        
        if (canDelete) {
            actions += `<button onclick="deleteProposal(${id})" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Borrar</button>`;
        }
        if (isOwner && !proposal.is_locked) {
            actions += `<button onclick="editProposal(${id})" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Editar</button>`;
        }

        // Parsear attachments si existen
        let attachments = [];
        try {
            if (proposal.attachments && proposal.attachments !== '[]') {
                attachments = JSON.parse(proposal.attachments);
            }
        } catch (e) {
            console.error('Error parsing attachments:', e);
        }

        // HTML para Slack y adjuntos
        let linksHtml = '';
        if (proposal.slack_url) {
            linksHtml += `
                <div class="mb-4 p-3 bg-blue-50 rounded-lg">
                    <strong class="text-sm text-gray-700">Conversación en Slack:</strong><br>
                    <a href="${escapeHtml(proposal.slack_url)}" target="_blank" 
                       class="text-blue-600 hover:underline break-all">
                        ${escapeHtml(proposal.slack_url)}
                    </a>
                </div>
            `;
        }
        
        if (attachments.length > 0) {
            linksHtml += `
                <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                    <strong class="text-sm text-gray-700">Archivos adjuntos:</strong>
                    <ul class="mt-2 space-y-1">
                        ${attachments.map(file => `
                            <li>
                                <a href="${escapeHtml(file.url)}" target="_blank" 
                                   class="text-blue-600 hover:underline flex items-center gap-2">
                                    <span></span>
                                    <span>${escapeHtml(file.name)}</span>
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        // HTML para aportaciones
        let contributionsHtml = '';
        if (contributions.length > 0) {
            contributionsHtml = `
                <div class="mb-4 p-3 bg-green-50 rounded-lg">
                    <strong class="text-sm text-gray-700">Aportaciones (${contributions.length}):</strong>
                    <div class="mt-2 space-y-2">
                        ${contributions.map(c => {
                            const canDelete = c.user_session === userSession || userRole === 'moderator';
                            return `
                                <div class="p-2 bg-white rounded border-l-4 border-green-500 relative group">
                                    <div class="text-xs text-gray-500 mb-1 flex justify-between">
                                        <span>
                                            <strong>${escapeHtml(c.username)}</strong> • 
                                            ${new Date(c.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        ${canDelete ? `
                                            <button onclick="deleteContribution(${c.id}, 'proposal', ${id})" class="text-red-500 hover:text-red-700 font-bold px-2">
                                                ×
                                            </button>
                                        ` : ''}
                                    </div>
                                    <p class="text-sm text-gray-700">${escapeHtml(c.contribution_text)}</p>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        document.getElementById('detailContent').innerHTML = `
            <h2 class="text-3xl font-bold mb-4">${escapeHtml(proposal.title)}</h2>
            <div class="mb-4">
                <span class="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">${proposal.category}</span>
                <span class="text-gray-600 ml-2">por ${escapeHtml(proposal.username)}</span>
                ${proposal.support_count > 0 ? `<span class="ml-2 text-green-600 font-semibold">${proposal.support_count} ${proposal.support_count === 1 ? 'apoyo' : 'apoyos'}</span>` : ''}
            </div>
            ${proposal.description ? `<p class="text-gray-700 mb-4">${escapeHtml(proposal.description)}</p>` : ''}
            ${linksHtml}
            ${contributionsHtml}
            <div class="flex gap-2 flex-wrap">
                ${actions}
                <button onclick="closeModal('detailModal')" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Cerrar</button>
            </div>
        `;

        showModal('detailModal');
    } catch (error) {
        console.error('Error:', error);
    }
}

async function createProposal() {
    const title = document.getElementById('proposalTitle').value.trim();
    const description = document.getElementById('proposalDesc').value.trim();
    const slack_url = document.getElementById('proposalSlackUrl').value.trim();
    const category = document.getElementById('proposalCategory').value;

    if (!title || !category) {
        showToast('Por favor completa el título y la categoría', 'error');
        return;
    }

    // Validar URL de Slack si se proporciona
    if (slack_url && !isValidUrl(slack_url)) {
        showToast('La URL de Slack no es válida', 'error');
        return;
    }

    // Estado de carga
    const submitBtn = document.querySelector('#proposalModal button.bg-purple-600');
    if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';

        try {
            const response = await fetch('api-complete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_proposal',
                    username: username,
                    session: userSession,
                    title: title,
                    description: description,
                    slack_url: slack_url,
                    attachments: JSON.stringify(proposalAttachments),
                    category: category,
                    color: categoryColors[category] || '#999'
                })
            });

            const result = await response.json();
            if (result.success) {
                showToast('✨ Propuesta creada exitosamente', 'success');
                closeModal('proposalModal');
                document.getElementById('proposalTitle').value = '';
                document.getElementById('proposalDesc').value = '';
                document.getElementById('proposalSlackUrl').value = '';
                document.getElementById('proposalCategory').value = '';
                clearProposalAttachments();
                loadProposals();
            } else {
                showToast(result.error || 'Error al crear propuesta', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al crear propuesta', 'error');
        } finally {
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}

async function deleteProposal(id) {
    const confirmed = await showConfirm(
        '¿Borrar propuesta?',
        '¿Estás seguro de que quieres borrar esta propuesta? Esta acción no se puede deshacer.'
    );
    if (!confirmed) return;

    try {
        const response = await fetch('api-complete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete_proposal',
                id: id,
                session: userSession
            })
        });

        const result = await response.json();
        if (result.success) {
            showToast('Propuesta eliminada', 'success');
            closeModal('detailModal');
            loadProposals();
        } else {
            showToast(result.error || 'Error al borrar la propuesta', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al borrar la propuesta', 'error');
    }
}

async function editProposal(id) {
    try {
        const response = await fetch('api-complete.php?action=load_proposals');
        const proposals = await response.json();
        const proposal = proposals.find(p => p.id == id);
        
        if (!proposal) {
            showToast('Propuesta no encontrada', 'error');
            return;
        }
        
        document.getElementById('editProposalId').value = id;
        document.getElementById('editProposalTitle').value = proposal.title;
        document.getElementById('editProposalDesc').value = proposal.description || '';
        document.getElementById('editProposalImage').value = proposal.image_url || '';
        document.getElementById('editProposalCategory').value = proposal.category;
        
        closeModal('detailModal');
        showModal('editProposalModal');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar propuesta', 'error');
    }
}

async function updateProposal() {
    const id = document.getElementById('editProposalId').value;
    const title = document.getElementById('editProposalTitle').value.trim();
    const description = document.getElementById('editProposalDesc').value.trim();
    const image_url = document.getElementById('editProposalImage').value.trim();
    const category = document.getElementById('editProposalCategory').value;
    
    if (!title || !category) {
        showToast('Por favor completa el título y la categoría', 'error');
        return;
    }
    
    try {
        const response = await fetch('api-complete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'edit_proposal',
                id: parseInt(id),
                session: userSession,
                title: title,
                description: description,
                image_url: image_url,
                category: category
            })
        });
        
        const result = await response.json();
        if (result.success) {
            showToast('✨ Propuesta actualizada exitosamente', 'success');
            closeModal('editProposalModal');
            loadProposals();
        } else {
            showToast(result.error || 'Error al actualizar', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al actualizar propuesta', 'error');
    }
}
