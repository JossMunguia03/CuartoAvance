/**
 * Componente Navbar - Barra de navegación principal
 */

import { authService } from '../services/auth.js';

class GratidayNavbar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.updateAuthState();
    }

    render() {
        this.innerHTML = `
            <nav class="navbar">
                <div class="navbar-brand">
                    <h1>🌟 GratiDay</h1>
                    <p class="navbar-subtitle">Frases de Gratitud y Motivación</p>
                </div>
                <div class="navbar-actions" id="navbar-actions">
                    <span class="user-info" id="user-info"></span>
                    <button class="btn btn-secondary" id="logout-btn" style="display: none;">
                        Cerrar Sesión
                    </button>
                </div>
            </nav>
        `;

        // Event listeners
        const logoutBtn = this.querySelector('#logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                authService.logout();
            });
        }

        // Actualizar cuando cambie el estado de autenticación
        window.addEventListener('auth-state-changed', () => {
            this.updateAuthState();
        });
    }

    updateAuthState() {
        const userInfo = this.querySelector('#user-info');
        const logoutBtn = this.querySelector('#logout-btn');

        if (authService.isAuthenticated()) {
            const user = authService.getCurrentUser();
            if (userInfo) {
                userInfo.textContent = `👤 ${user?.nombre || 'Usuario'}`;
                userInfo.style.display = 'inline-block';
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'inline-block';
            }
        } else {
            if (userInfo) {
                userInfo.style.display = 'none';
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
            }
        }
    }
}

customElements.define('gratiday-navbar', GratidayNavbar);

