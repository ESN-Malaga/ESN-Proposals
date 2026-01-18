// ===== MATCHES =====

async function loadMatches() {
    try {
        const [matchesRes, proposalsRes, problemsRes] = await Promise.all([
            fetch('api-complete.php?action=load_matches'),
            fetch('api-complete.php?action=load_proposals'),
            fetch('api-complete.php?action=load_problems')
        ]);

        const matches = await matchesRes.json();
        const proposals = await proposalsRes.json();
        const problems = await problemsRes.json();

        displayMatches(matches, proposals, problems);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function displayMatches(matches, proposals, problems) {
    const container = document.getElementById('contentArea');

    let html = `
        <div class="bg-white rounded-2xl p-6 mb-6">
            <h3 class="text-2xl font-bold mb-4">Crear Nuevo Match</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-semibold mb-2">Problema:</label>
                    <select id="matchProblem" class="w-full px-4 py-2 border rounded-lg">
                        <option value="">Selecciona un problema</option>
                        ${problems.map(p => `<option value="${p.id}">${escapeHtml(p.title)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-2">Propuesta:</label>
                    <select id="matchProposal" class="w-full px-4 py-2 border rounded-lg">
                        <option value="">Selecciona una propuesta</option>
                        ${proposals.map(p => `<option value="${p.id}">${escapeHtml(p.title)}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="mt-4">
                <label class="block text-sm font-semibold mb-2">Notas (opcional):</label>
                <textarea id="matchNotes" class="w-full px-4 py-2 border rounded-lg" rows="3"></textarea>
            </div>
            <button onclick="createMatch()" class="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Crear Match
            </button>
        </div>
    `;

    if (matches.length > 0) {
        html += '<div class="space-y-4">';
        // Cargar aportaciones para cada match
        const matchesWithContribs = await Promise.all(matches.map(async (m) => {
            try {
                const response = await fetch(`api-complete.php?action=load_contributions&item_type=match&item_id=${m.id}`);
                if (response.ok) {
                    m.contributions = await response.json();
                } else {
                    m.contributions = [];
                }
            } catch (e) {
                m.contributions = [];
            }
            return m;
        }));

        matchesWithContribs.forEach(m => {
            const isOwner = m.moderator_session === userSession;
            
            // HTML de aportaciones
            let contributionsHtml = '';
            if (m.contributions && m.contributions.length > 0) {
                const contribId = `contribs-${m.id}`;
                contributionsHtml = `
                    <div class="mt-4">
                        <button onclick="document.getElementById('${contribId}').classList.toggle('hidden')" 
                                class="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            <span>Ver aportaciones (${m.contributions.length})</span>
                            <span class="text-xs">▼</span>
                        </button>
                        <div id="${contribId}" class="hidden mt-3 space-y-2 p-3 bg-green-50 rounded-lg">
                            ${m.contributions.map(c => {
                                const canDelete = c.user_session === userSession || userRole === 'moderator';
                                return `
                                    <div class="p-2 bg-white rounded border-l-4 border-green-500 relative group">
                                        <div class="text-xs text-gray-500 mb-1 flex justify-between">
                                            <span>
                                                <strong>${escapeHtml(c.username)}</strong> • 
                                                ${new Date(c.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            ${canDelete ? `
                                                <button onclick="deleteContribution(${c.id}, 'match', ${m.id})" class="text-red-500 hover:text-red-700 font-bold px-2">
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

            html += `
                <div class="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="flex items-center gap-4 mb-4">
                                <div class="flex-1">
                                    <span class="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Problema</span>
                                    <p class="font-bold mt-2">${escapeHtml(m.problem_title)}</p>
                                </div>
                                <div class="text-2xl">→</div>
                                <div class="flex-1">
                                    <span class="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Propuesta</span>
                                    <p class="font-bold mt-2">${escapeHtml(m.proposal_title)}</p>
                                </div>
                            </div>
                            ${m.notes ? `<p class="text-gray-600 text-sm mb-3">${escapeHtml(m.notes)}</p>` : ''}
                            <p class="text-xs text-gray-400">Por ${escapeHtml(m.moderator_username)}</p>
                            
                            ${contributionsHtml}
                            
                            ${!isOwner ? `
                                <button onclick="showContributionModal(${m.id}, 'match')" class="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-bold shadow-sm">
                                    Aportar
                                </button>
                            ` : ''}
                        </div>
                        ${userRole === 'moderator' ? `
                            <button onclick="deleteMatch(${m.id})" class="ml-4 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">
                                Borrar Match
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        html += '</div>';
    } else {
        html += '<div class="text-center text-gray-500 mt-8">No hay matches aún</div>';
    }

    container.innerHTML = html;
}

async function createMatch() {
    const problemId = document.getElementById('matchProblem').value;
    const proposalId = document.getElementById('matchProposal').value;
    const notes = document.getElementById('matchNotes').value.trim();

    if (!problemId || !proposalId) {
        showToast('Por favor selecciona un problema y una propuesta', 'error');
        return;
    }

    // Estado de carga
    const submitBtn = document.querySelector('button[onclick="createMatch()"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creando Match...';

    try {
        const response = await fetch('api-complete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'create_match',
                problem_id: parseInt(problemId),
                proposal_id: parseInt(proposalId),
                session: userSession,
                username: username,
                notes: notes
            })
        });

        const result = await response.json();
        if (result.success) {
            showToast('✨ Match creado exitosamente', 'success');
            document.getElementById('matchProblem').value = '';
            document.getElementById('matchProposal').value = '';
            document.getElementById('matchNotes').value = '';
            loadMatches();
        } else {
            showToast(result.error || 'Error al crear match', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al crear match', 'error');
    } finally {
        // Restaurar botón
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function deleteMatch(id) {
    if (!confirm('¿Estás seguro de que quieres borrar este match?')) return;

    try {
        const response = await fetch('api-complete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete_match',
                id: id,
                session: userSession
            })
        });

        const result = await response.json();
        if (result.success) {
            loadMatches();
        } else {
            alert(result.error || 'Error al borrar match');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al borrar match');
    }
}
