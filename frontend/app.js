/**
 * Aplicación Principal - Orquesta la lógica de la aplicación
 */

import { authService } from './services/auth.js';

// Variables globales de utilidad
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;

/**
 * Muestra el overlay de carga
 */
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

/**
 * Oculta el overlay de carga
 */
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('hidden');
}

/**
 * Muestra un mensaje toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'info'
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Animar entrada
    setTimeout(() => toast.classList.add('show'), 10);

    // Remover después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Inicializa la aplicación
 */
function initApp() {
    // Verificar autenticación
    if (authService.isAuthenticated()) {
        showDashboard();
    } else {
        showLogin();
    }

    // Configurar navegación por tabs
    setupTabs();

    // Escuchar eventos de actualización
    window.addEventListener('auth-success', () => {
        showDashboard();
        window.dispatchEvent(new CustomEvent('auth-state-changed'));
    });

    window.addEventListener('frase-updated', () => {
        const fraseList = document.querySelector('gratiday-frase-list');
        if (fraseList) fraseList.loadFrases();
    });

    window.addEventListener('categoria-updated', () => {
        const categoriaList = document.querySelector('gratiday-categoria-list');
        if (categoriaList) categoriaList.loadCategorias();
    });

    window.addEventListener('usuario-updated', () => {
        const usuarioList = document.querySelector('gratiday-usuario-list');
        if (usuarioList && authService.isAuthenticated()) {
            usuarioList.loadUsuarios();
        }
    });

    // Escuchar cambios de autenticación para recargar componentes
    window.addEventListener('auth-state-changed', () => {
        if (authService.isAuthenticated()) {
            // Recargar componentes cuando se autentica
            const usuarioList = document.querySelector('gratiday-usuario-list');
            if (usuarioList) {
                usuarioList.render();
                usuarioList.loadUsuarios();
            }
        }
    });
}

/**
 * Muestra la vista de login
 */
function showLogin() {
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');

    if (loginView) loginView.classList.remove('hidden');
    if (dashboardView) dashboardView.classList.add('hidden');
}

/**
 * Muestra el dashboard
 */
function showDashboard() {
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');

    if (loginView) loginView.classList.add('hidden');
    if (dashboardView) dashboardView.classList.remove('hidden');
}

/**
 * Configura la navegación por tabs
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const views = document.querySelectorAll('.view');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetView = btn.dataset.view;

            // Actualizar botones activos
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Mostrar/ocultar vistas
            views.forEach(v => {
                if (v.id === `${targetView}-view`) {
                    v.classList.remove('hidden');
                    v.classList.add('active');
                } else {
                    v.classList.add('hidden');
                    v.classList.remove('active');
                }
            });
        });
    });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Exportar funciones para uso global
export { showLoading, hideLoading, showToast };

