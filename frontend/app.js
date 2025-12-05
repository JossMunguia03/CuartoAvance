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
        // Disparar evento de cambio de estado de autenticación
        window.dispatchEvent(new CustomEvent('auth-state-changed'));
        // Forzar re-renderizado de todos los componentes después de un breve delay
        // para asegurar que el estado de autenticación esté actualizado
        setTimeout(() => {
            reloadAllComponents();
        }, 100);
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
        if (usuarioList && authService.isAuthenticated() && authService.isAdmin()) {
            usuarioList.loadUsuarios();
        }
    });

    // Escuchar cambios de autenticación para recargar componentes
    window.addEventListener('auth-state-changed', () => {
        if (authService.isAuthenticated()) {
            // Recargar todos los componentes cuando cambia el estado de autenticación
            reloadAllComponents();
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
    
    // Asegurar que los componentes se rendericen correctamente cuando se muestra el dashboard
    setTimeout(() => {
        reloadAllComponents();
    }, 50);
}

/**
 * Configura la navegación por tabs
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const views = document.querySelectorAll('.view');

    // Ocultar pestañas según el rol del usuario
    updateTabsVisibility();

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetView = btn.dataset.view;

            // Si el usuario no es admin y trata de acceder a una vista restringida, redirigir a frases
            if (!authService.isAdmin() && (targetView === 'categorias' || targetView === 'usuarios')) {
                const frasesTab = document.querySelector('.tab-btn[data-view="frases"]');
                if (frasesTab) {
                    frasesTab.click();
                    showToast('Acceso restringido para usuarios normales', 'error');
                }
                return;
            }

            // Actualizar botones activos
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Mostrar/ocultar vistas
            views.forEach(v => {
                if (v.id === `${targetView}-view`) {
                    v.classList.remove('hidden');
                    v.classList.add('active');
                    
                    // Asegurar que los componentes dentro de la vista se rendericen correctamente
                    if (targetView === 'frases') {
                        const fraseList = v.querySelector('gratiday-frase-list');
                        if (fraseList) {
                            fraseList.render();
                            fraseList.loadFrases();
                        }
                    } else if (targetView === 'categorias') {
                        const categoriaList = v.querySelector('gratiday-categoria-list');
                        if (categoriaList) {
                            categoriaList.render();
                            if (authService.isAdmin()) {
                                categoriaList.loadCategorias();
                            }
                        }
                    } else if (targetView === 'usuarios') {
                        const usuarioList = v.querySelector('gratiday-usuario-list');
                        if (usuarioList) {
                            usuarioList.render();
                            if (authService.isAdmin()) {
                                usuarioList.loadUsuarios();
                            }
                        }
                    }
                } else {
                    v.classList.add('hidden');
                    v.classList.remove('active');
                }
            });
        });
    });

    // Actualizar visibilidad cuando cambie el estado de autenticación
    window.addEventListener('auth-state-changed', () => {
        updateTabsVisibility();
    });
}

/**
 * Recarga todos los componentes para reflejar el estado actual de autenticación
 */
function reloadAllComponents() {
    // Re-renderizar frase-list
    const fraseList = document.querySelector('gratiday-frase-list');
    if (fraseList) {
        fraseList.render();
        fraseList.loadFrases();
    }

    // Re-renderizar categoria-list
    const categoriaList = document.querySelector('gratiday-categoria-list');
    if (categoriaList) {
        categoriaList.render();
        if (authService.isAdmin()) {
            categoriaList.loadCategorias();
        }
    }

    // Re-renderizar usuario-list
    const usuarioList = document.querySelector('gratiday-usuario-list');
    if (usuarioList) {
        usuarioList.render();
        if (authService.isAdmin()) {
            usuarioList.loadUsuarios();
        }
    }

    // Actualizar navbar
    const navbar = document.querySelector('gratiday-navbar');
    if (navbar) {
        navbar.updateAuthState();
    }

    // Actualizar visibilidad de tabs
    updateTabsVisibility();
}

/**
 * Actualiza la visibilidad de las pestañas según el rol del usuario
 */
function updateTabsVisibility() {
    const isAdmin = authService.isAdmin();
    const categoriaTab = document.querySelector('.tab-btn[data-view="categorias"]');
    const usuarioTab = document.querySelector('.tab-btn[data-view="usuarios"]');
    const categoriaView = document.getElementById('categorias-view');
    const usuarioView = document.getElementById('usuarios-view');

    if (categoriaTab) {
        categoriaTab.style.display = isAdmin ? 'inline-block' : 'none';
    }
    if (usuarioTab) {
        usuarioTab.style.display = isAdmin ? 'inline-block' : 'none';
    }

    // Si el usuario no es admin y está viendo una vista restringida, cambiar a frases
    if (!isAdmin) {
        if (categoriaView && !categoriaView.classList.contains('hidden')) {
            const frasesTab = document.querySelector('.tab-btn[data-view="frases"]');
            const frasesView = document.getElementById('frases-view');
            if (frasesTab) {
                frasesTab.click();
            } else if (frasesView) {
                categoriaView.classList.add('hidden');
                usuarioView?.classList.add('hidden');
                frasesView.classList.remove('hidden');
                frasesView.classList.add('active');
            }
        }
        if (usuarioView && !usuarioView.classList.contains('hidden')) {
            const frasesTab = document.querySelector('.tab-btn[data-view="frases"]');
            const frasesView = document.getElementById('frases-view');
            if (frasesTab) {
                frasesTab.click();
            } else if (frasesView) {
                categoriaView?.classList.add('hidden');
                usuarioView.classList.add('hidden');
                frasesView.classList.remove('hidden');
                frasesView.classList.add('active');
            }
        }
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Exportar funciones para uso global
export { showLoading, hideLoading, showToast };

