// ===== PROBLEMAS =====

async function loadProblems() {
    try {
        const response = await fetch('api-complete.php?action=load_problems');
        const problems = await response.json();
        allProblems = problems;
        
        const filtered = filterItems(problems, currentSearchTerm, currentCategoryFilter);
        displayProblems(filtered);
        updateResultCount(filtered.length, problems.length);
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayProblems(problems) {
    const container = document.getElementById('contentArea');
    
    if (problems.length === 0) {
        const hasFilters = currentSearchTerm || currentCategoryFilter;
        container.innerHTML = `
            <div class="empty-state">

                <h3 class="text-2xl font-bold text-white mb-2">${hasFilters ? 'No se encontraron problemas' : 'No hay problemas reportados'}</h3>
                <p class="text-white/80">${hasFilters ? 'Intenta con otros filtros' : '¡Reporta el primer problema!'}</p>
                ${!hasFilters ? '<button onclick="showModal(\'problemModal\')" class="mt-4 px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-100 transition">Reportar Primer Problema</button>' : ''}
            </div>
        `;
        return;
    }

    container.innerHTML = problems.map(p => {
        // Force size 1.1 for uniformity as requested
        const size = 1.1; // p.is_highlighted ? 1.3 : 1;
        const color = categoryColors[p.category] || '#999';
        const isOwner = p.username === username;
        
        return `
            <div class="word-bubble cursor-pointer text-white font-bold text-center p-4 ${isOwner ? 'relative' : ''}" 
                 style="background: ${color}; --base-scale: ${size};"
                 onclick="showProblemDetail(${p.id})">
                ${escapeHtml(p.title)}
                ${isOwner ? '<span class="absolute bottom-1 right-2 text-xs bg-white/40 rounded px-2 py-0.5">Tu</span>' : ''}
            </div>
        `;
    }).join('');
}

async function showProblemDetail(id) {
    try {
        const response = await fetch('api-complete.php?action=load_problems');
        const problems = await response.json();
        const problem = problems.find(p => p.id == id);

        if (!problem) return;

        const checkResponse = await fetch(`api-complete.php?action=check_support&problem_id=${id}&session=${userSession}`);
        const checkResult = await checkResponse.json();
        const isSupporting = checkResult.is_supporting;
        const isOwner = problem.username === username;
        const canDelete = isOwner || userRole === 'moderator';

        // Cargar aportaciones (con manejo de errores)
        let contributions = [];
        try {
            const contribResponse = await fetch(`api-complete.php?action=load_contributions&item_type=problem&item_id=${id}`);
            if (contribResponse.ok) {
                contributions = await contribResponse.json();
            }
        } catch (e) {
            console.warn('No se pudieron cargar aportaciones:', e);
        }

        let actions = '';
        if (!isOwner) {
            if (isSupporting) {
                actions += `<button onclick="unsupportProblem(${id})" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Quitar apoyo</button>`;
            } else {
                actions += `<button onclick="supportProblem(${id})" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Apoyar</button>`;
            }
            // Botón de aportar (solo si no es el creador)
            actions += `<button onclick="showContributionModal(${id}, 'problem')" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Aportar</button>`;
        }
        if (canDelete) {
            actions += `<button onclick="deleteProblem(${id})" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Borrar</button>`;
        }
        if (isOwner) {
            actions += `<button onclick="editProblem(${id})" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Editar</button>`;
        }

        // Parsear attachments si existen
        let attachments = [];
        try {
            if (problem.attachments && problem.attachments !== '[]') {
                attachments = JSON.parse(problem.attachments);
            }
        } catch (e) {
            console.error('Error parsing attachments:', e);
        }

        // HTML para Slack y adjuntos
        let linksHtml = '';
        if (problem.slack_url) {
            linksHtml += `
                <div class="mb-4 p-3 bg-blue-50 rounded-lg">
                    <strong class="text-sm text-gray-700">Conversación en Slack:</strong><br>
                    <a href="${escapeHtml(problem.slack_url)}" target="_blank" 
                       class="text-blue-600 hover:underline break-all">
                        ${escapeHtml(problem.slack_url)}
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
                                            <button onclick="deleteContribution(${c.id}, 'problem', ${id})" class="text-red-500 hover:text-red-700 font-bold px-2">
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
            <h2 class="text-3xl font-bold mb-4">${escapeHtml(problem.title)}</h2>
            <div class="mb-4">
                <span class="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">${problem.category}</span>
                <span class="text-gray-600 ml-2">reportado por ${escapeHtml(problem.username)}</span>
            </div>
            ${problem.description ? `<p class="text-gray-700 mb-4">${escapeHtml(problem.description)}</p>` : ''}
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

async function createProblem() {
    const title = document.getElementById('problemTitle').value.trim();
    const description = document.getElementById('problemDesc').value.trim();
    const slack_url = document.getElementById('problemSlackUrl').value.trim();
    const category = document.getElementById('problemCategory').value;

    if (!title || !category) {
        showToast('Por favor completa el título y la categoría', 'error');
        return;
    }

    // Validar URL de Slack si se proporciona
    if (slack_url && !isValidUrl(slack_url)) {
        showToast('La URL de Slack no es válida', 'error');
        return;
    }

    // Estado de carga - buscar el botón de forma más robusta
    const submitBtn = document.querySelector('#problemModal button.bg-orange-600');
    if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';

        try {
            const response = await fetch('api-complete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_problem',
                    username: username,
                    session: userSession,
                    title: title,
                    description: description,
                    slack_url: slack_url,
                    attachments: JSON.stringify(problemAttachments),
                    category: category,
                    color: categoryColors[category] || '#999'
                })
            });

            const result = await response.json();
            if (result.success) {
                showToast('✨ Problema creado exitosamente', 'success');
                closeModal('problemModal');
                document.getElementById('problemTitle').value = '';
                document.getElementById('problemDesc').value = '';
                document.getElementById('problemSlackUrl').value = '';
                document.getElementById('problemCategory').value = '';
                clearProblemAttachments();
                loadProblems();
            } else {
                showToast(result.error || 'Error al crear problema', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al crear problema', 'error');
        } finally {
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } else {
        // Si no encuentra el botón, ejecutar sin loading state
        try {
            const response = await fetch('api-complete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_problem',
                    username: username,
                    session: userSession,
                    title: title,
                    description: description,
                    slack_url: slack_url,
                    attachments: JSON.stringify(problemAttachments),
                    category: category,
                    color: categoryColors[category] || '#999'
                })
            });

            const result = await response.json();
            if (result.success) {
                showToast('✨ Problema creado exitosamente', 'success');
                closeModal('problemModal');
                document.getElementById('problemTitle').value = '';
                document.getElementById('problemDesc').value = '';
                document.getElementById('problemSlackUrl').value = '';
                document.getElementById('problemCategory').value = '';
                clearProblemAttachments();
                loadProblems();
            } else {
                showToast(result.error || 'Error al crear problema', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al crear problema', 'error');
        }
    }
}

async function deleteProblem(id) {
    const confirmed = await showConfirm(
        '¿Borrar problema?',
        '¿Estás seguro de que quieres borrar este problema? Esta acción no se puede deshacer.'
    );
    if (!confirmed) return;

    try {
        const response = await fetch('api-complete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete_problem',
                id: id,
                session: userSession
            })
        });

        const result = await response.json();
        if (result.success) {
            showToast('Problema eliminado', 'success');
            closeModal('detailModal');
            loadProblems();
        } else {
            showToast(result.error || 'Error al borrar el problema', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al borrar el problema', 'error');
    }
}

async function editProblem(id) {
    try {
        const response = await fetch('api-complete.php?action=load_problems');
        const problems = await response.json();
        const problem = problems.find(p => p.id == id);
        
        if (!problem) {
            showToast('Problema no encontrado', 'error');
            return;
        }
        
        document.getElementById('editProblemId').value = id;
        document.getElementById('editProblemTitle').value = problem.title;
        document.getElementById('editProblemDesc').value = problem.description || '';
        document.getElementById('editProblemCategory').value = problem.category;
        
        closeModal('detailModal');
        showModal('editProblemModal');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar problema', 'error');
    }
}

async function updateProblem() {
    const id = document.getElementById('editProblemId').value;
    const title = document.getElementById('editProblemTitle').value.trim();
    const description = document.getElementById('editProblemDesc').value.trim();
    const category = document.getElementById('editProblemCategory').value;
    
    if (!title || !category) {
        showToast('Por favor completa el título y la categoría', 'error');
        return;
    }
    
    try {
        const response = await fetch('api-complete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'edit_problem',
                id: parseInt(id),
                session: userSession,
                title: title,
                description: description,
                category: category
            })
        });
        
        const result = await response.json();
        if (result.success) {
            showToast('✨ Problema actualizado exitosamente', 'success');
            closeModal('editProblemModal');
            loadProblems();
        } else {
            showToast(result.error || 'Error al actualizar', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al actualizar problema', 'error');
    }
}
