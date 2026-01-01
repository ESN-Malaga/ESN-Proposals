// ===== CONFIGURACIÓN Y CONSTANTES =====

// Variables globales de usuario
let username = '';
let userSession = '';
let userRole = 'user';

// Variables de estado
let currentTab = 'proposals';
let allProposals = [];
let allProblems = [];
let currentSearchTerm = '';
let currentCategoryFilter = '';

// Colores por categoría (with database compatibility)
const categoryColors = {
    'ET Actividades': '#3B82F6',
    'ET ACTIVIDADES': '#3B82F6',  // DB compatibility
    'ET COMU': '#EC4899',
    'ET Impacto Social': '#10B981',
    'ET IMPACTO SOCIAL': '#10B981',  // DB compatibility
    'GAP': '#F59E0B',
    'GAvi': '#8B5CF6',
    'GAVI': '#8B5CF6',  // DB compatibility
    'GAS': '#EF4444',
    'GAT': '#06B6D4',
    'GAEM': '#14B8A6',
    'GA WeB': '#A855F7',
    'Network Squad': '#F97316',
    'GT proofreading': '#84CC16'
};
