// ===== SISTEMA DE APOYO A PROPUESTAS =====

async function supportProposal(id) {
    try {
        const response = await fetch('api-complete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'support_proposal',
                proposal_id: id,
                session: userSession,
                username: username
            })
        });

        const result = await response.json();
        if (result.success) {
            showToast('Apoyo añadido', 'success');
            closeModal('detailModal');
            loadProposals();
        } else {
            showToast(result.error || 'Error al apoyar', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al apoyar propuesta', 'error');
    }
}

async function unsupportProposal(id) {
    try {
        const response = await fetch('api-complete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'unsupport_proposal',
                proposal_id: id,
                session: userSession
            })
        });

        const result = await response.json();
        if (result.success) {
            showToast('Apoyo retirado', 'success');
            closeModal('detailModal');
            loadProposals();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function supportProblem(id) {
    try {
        const response = await fetch('api-complete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'support_problem',
                problem_id: id,
                session: userSession,
                username: username
            })
        });

        const result = await response.json();
        if (result.success) {
            closeModal('detailModal');
            loadProblems();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function unsupportProblem(id) {
    try {
        const response = await fetch('api-complete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'unsupport_problem',
                problem_id: id,
                session: userSession
            })
        });

        const result = await response.json();
        if (result.success) {
            closeModal('detailModal');
            loadProblems();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
