/**
 * Componente Login Form - Formulario de inicio de sesión
 */

import { authService } from '../services/auth.js';
import { showToast, showLoading, hideLoading } from '../app.js';

class GratidayLogin extends HTMLElement {
    constructor() {
        super();
        this.isLoginMode = true;
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        const uniqueId = `login-${Date.now()}`;
        this.innerHTML = `
            <div class="login-container">
                <div class="login-card">
                    <h2>${this.isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}</h2>
                    
                    <form id="auth-form-${uniqueId}">
                        <div class="form-group" id="nombre-group-${uniqueId}" style="display: ${this.isLoginMode ? 'none' : 'block'};">
                            <label for="nombre-${uniqueId}">Nombre</label>
                            <input type="text" id="nombre-${uniqueId}" name="nombre" 
                                   ${this.isLoginMode ? 'disabled' : 'required'}>
                        </div>

                        <div class="form-group">
                            <label for="email-${uniqueId}">Correo Electrónico</label>
                            <input type="email" id="email-${uniqueId}" name="email" required>
                        </div>

                        <div class="form-group">
                            <label for="password-${uniqueId}">Contraseña</label>
                            <input type="password" id="password-${uniqueId}" name="password" required minlength="6">
                        </div>

                        <button type="submit" class="btn btn-primary btn-block">
                            ${this.isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}
                        </button>
                    </form>

                    <div class="form-footer">
                        <button type="button" class="btn-link" id="toggle-mode-btn-${uniqueId}">
                            ${this.isLoginMode ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </div>

                    <div id="error-message-${uniqueId}" class="error-message" style="display: none;"></div>
                </div>
            </div>
        `;
        
        this.uniqueId = uniqueId;
    }

    attachEventListeners() {
        if (!this.uniqueId) return;
        
        const form = this.querySelector(`#auth-form-${this.uniqueId}`);
        const toggleBtn = this.querySelector(`#toggle-mode-btn-${this.uniqueId}`);
        const errorMsg = this.querySelector(`#error-message-${this.uniqueId}`);

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (errorMsg) errorMsg.style.display = 'none';

                const formData = new FormData(form);
                const email = formData.get('email');
                const password = formData.get('password');
                const nombre = formData.get('nombre');

                try {
                    showLoading();

                    if (this.isLoginMode) {
                        await authService.login(email, password);
                    } else {
                        if (!nombre) {
                            throw new Error('El nombre es requerido');
                        }
                        await authService.register(nombre, email, password);
                    }

                    // Disparar evento de autenticación exitosa
                    window.dispatchEvent(new CustomEvent('auth-success'));
                    showToast('¡Bienvenido!', 'success');

                } catch (error) {
                    if (errorMsg) {
                        errorMsg.textContent = error.message || 'Error al autenticarse';
                        errorMsg.style.display = 'block';
                    }
                    showToast(error.message || 'Error al autenticarse', 'error');
                } finally {
                    hideLoading();
                }
            });
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.isLoginMode = !this.isLoginMode;
                this.render();
                this.attachEventListeners();
            });
        }
    }
}

customElements.define('gratiday-login', GratidayLogin);

