// ===== SISTEMA DE FILTRADO =====

function filterItems(items, searchTerm, category) {
    return items.filter(item => {
        const matchesSearch = !searchTerm || 
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = !category || item.category === category;
        return matchesSearch && matchesCategory;
    });
}

function applyFilters() {
    if (currentTab === 'proposals') {
        const filtered = filterItems(allProposals, currentSearchTerm, currentCategoryFilter);
        displayProposals(filtered);
        updateResultCount(filtered.length, allProposals.length);
    } else if (currentTab === 'problems') {
        const filtered = filterItems(allProblems, currentSearchTerm, currentCategoryFilter);
        displayProblems(filtered);
        updateResultCount(filtered.length, allProblems.length);
    }
}

function clearFilters() {
    currentSearchTerm = '';
    currentCategoryFilter = '';
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    applyFilters();
}

function updateResultCount(filtered, total) {
    const countEl = document.getElementById('resultCount');
    if (countEl) {
        if (filtered === total) {
            countEl.textContent = `${total} resultados`;
        } else {
            countEl.textContent = `${filtered} de ${total} resultados`;
        }
    }
}

function initializeFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (searchInput) {
        // Debounce de 300ms para optimizar búsqueda
        const debouncedSearch = debounce((value) => {
            currentSearchTerm = value;
            applyFilters();
        }, 300);
        
        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentCategoryFilter = e.target.value;
            applyFilters();
        });
    }
}
