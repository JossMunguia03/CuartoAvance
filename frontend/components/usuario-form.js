/**
 * Componente Usuario Form - Formulario para crear/editar usuarios
 */

import { apiService } from '../services/api.js';
import { showToast, showLoading, hideLoading } from '../app.js';

class GratidayUsuarioForm extends HTMLElement {
    constructor() {
        super();
        this.usuario = null;
    }

    connectedCallback() {
        this.render();
    }

    open(usuario = null) {
        this.usuario = usuario;
        this.render();
        const modal = this.querySelector(`#usuario-modal-${this.uniqueId}`);
        if (modal) modal.classList.add('active');
    }

    close() {
        const modal = this.querySelector(`#usuario-modal-${this.uniqueId}`);
        if (modal) modal.classList.remove('active');
        this.usuario = null;
    }

    render() {
        const uniqueId = `usuario-${Date.now()}`;
        this.innerHTML = `
            <div class="modal" id="usuario-modal-${uniqueId}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${this.usuario ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                        <button class="modal-close" id="close-modal-${uniqueId}">&times;</button>
                    </div>
                    <form id="usuario-form-${uniqueId}">
                        <div class="form-group">
                            <label for="nombre-${uniqueId}">Nombre *</label>
                            <input type="text" id="nombre-${uniqueId}" name="nombre" required 
                                   minlength="2" maxlength="100" 
                                   value="${this.usuario?.nombre || ''}">
                        </div>

                        <div class="form-group">
                            <label for="correo_electronico-${uniqueId}">Correo Electrónico *</label>
                            <input type="email" id="correo_electronico-${uniqueId}" name="correo_electronico" required 
                                   value="${this.usuario?.correo_electronico || ''}">
                        </div>

                        <div class="form-group" id="password-group-${uniqueId}" style="display: ${this.usuario ? 'none' : 'block'};">
                            <label for="password-${uniqueId}">Contraseña *</label>
                            <input type="password" id="password-${uniqueId}" name="password" 
                                   ${this.usuario ? '' : 'required'} minlength="6">
                            ${this.usuario ? '<small>Dejar vacío para mantener la contraseña actual</small>' : ''}
                        </div>

                        <div class="form-group">
                            <label for="rol-${uniqueId}">Rol *</label>
                            <select id="rol-${uniqueId}" name="rol" required>
                                <option value="user" ${this.usuario?.rol === 'user' ? 'selected' : ''}>
                                    Usuario
                                </option>
                                <option value="admin" ${this.usuario?.rol === 'admin' ? 'selected' : ''}>
                                    Administrador
                                </option>
                            </select>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancel-btn-${uniqueId}">Cancelar</button>
                            <button type="submit" class="btn btn-primary">${this.usuario ? 'Actualizar' : 'Crear'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.uniqueId = uniqueId;
        this.attachEventListeners();
    }

    attachEventListeners() {
        if (!this.uniqueId) return;
        
        const form = this.querySelector(`#usuario-form-${this.uniqueId}`);
        const closeBtn = this.querySelector(`#close-modal-${this.uniqueId}`);
        const cancelBtn = this.querySelector(`#cancel-btn-${this.uniqueId}`);
        const modal = this.querySelector(`#usuario-modal-${this.uniqueId}`);

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    this.close();
                }
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveUsuario();
            });
        }
    }

    async saveUsuario() {
        try {
            showLoading();

            const form = this.querySelector(`#usuario-form-${this.uniqueId}`);
            if (!form) return;
            
            const formData = new FormData(form);
            const usuarioData = {
                nombre: formData.get('nombre'),
                correo_electronico: formData.get('correo_electronico'),
                rol: formData.get('rol'),
            };

            if (this.usuario) {
                // Actualizar usuario
                const password = formData.get('password');
                if (password) {
                    await apiService.patchUsuario(this.usuario.id_user, { ...usuarioData, password });
                } else {
                    await apiService.updateUsuario(this.usuario.id_user, usuarioData);
                }
                showToast('Usuario actualizado exitosamente', 'success');
            } else {
                // Crear usuario
                const password = formData.get('password');
                if (!password) {
                    throw new Error('La contraseña es requerida para nuevos usuarios');
                }
                await apiService.createUsuario({ ...usuarioData, password });
                showToast('Usuario creado exitosamente', 'success');
            }

            this.close();
            window.dispatchEvent(new CustomEvent('usuario-updated'));

        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    }
}

customElements.define('gratiday-usuario-form', GratidayUsuarioForm);

