/**
 * Componente Usuario List - Lista y gestión de usuarios
 */

import { apiService } from '../services/api.js';
import { authService } from '../services/auth.js';
import { showToast, showLoading, hideLoading } from '../app.js';

class GratidayUsuarioList extends HTMLElement {
    constructor() {
        super();
        this.usuarios = [];
    }

    connectedCallback() {
        // Solo cargar si el usuario está autenticado Y es admin
        if (this.isAuthenticated() && authService.isAdmin()) {
            this.render();
            this.loadUsuarios();
        } else {
            this.render();
        }
        
        // Escuchar cambios de autenticación para re-renderizar
        window.addEventListener('auth-state-changed', () => {
            this.render();
            if (authService.isAdmin()) {
                this.loadUsuarios();
            }
        });
    }

    isAuthenticated() {
        return authService.isAuthenticated();
    }

    async loadUsuarios() {
        if (!this.isAuthenticated() || !authService.isAdmin()) {
            return;
        }
        try {
            showLoading();
            const response = await apiService.getUsuarios();
            this.usuarios = response.data || [];
            this.render();
        } catch (error) {
            showToast('Error al cargar usuarios: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    }

    render() {
        const isAdmin = authService.isAdmin();
        
        // Si no es admin, mostrar mensaje de acceso denegado
        if (!isAdmin) {
            this.innerHTML = `
                <div class="entity-container">
                    <div class="empty-state">
                        <h2>🔒 Acceso Restringido</h2>
                        <p>No tienes permisos para acceder a la gestión de usuarios.</p>
                        <p>Solo los administradores pueden ver y gestionar usuarios.</p>
                    </div>
                </div>
            `;
            return;
        }

        this.innerHTML = `
            <div class="entity-container">
                <div class="entity-header">
                    <h2>👥 Gestión de Usuarios</h2>
                    <button class="btn btn-primary" id="add-usuario-btn">
                        ➕ Nuevo Usuario
                    </button>
                </div>

                <div class="entity-list" id="usuarios-list">
                    ${this.renderUsuarios()}
                </div>
            </div>

            <gratiday-usuario-form id="usuario-form-modal"></gratiday-usuario-form>
        `;

        this.attachEventListeners();
    }

    renderUsuarios() {
        if (this.usuarios.length === 0) {
            return '<p class="empty-state">No hay usuarios disponibles</p>';
        }

        return this.usuarios.map(user => `
            <div class="entity-card" data-id="${user.id_user}">
                <div class="entity-card-header">
                    <h3>${this.escapeHtml(user.nombre)}</h3>
                    <span class="badge badge-${user.rol}">${user.rol}</span>
                </div>
                <div class="entity-card-body">
                    <p><strong>Email:</strong> ${this.escapeHtml(user.correo_electronico)}</p>
                    <p><strong>Rol:</strong> ${user.rol}</p>
                    <p><strong>Fecha de registro:</strong> ${new Date(user.fecha_creacion).toLocaleDateString()}</p>
                </div>
                <div class="entity-card-actions">
                    <button class="btn btn-sm btn-primary" data-action="edit" data-id="${user.id_user}">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-sm btn-danger" data-action="delete" data-id="${user.id_user}">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    attachEventListeners() {
        // Solo permitir acciones si el usuario es admin
        if (!authService.isAdmin()) {
            return;
        }

        const addBtn = this.querySelector('#add-usuario-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const modal = this.querySelector('#usuario-form-modal');
                if (modal) modal.open();
            });
        }

        this.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const action = e.target.dataset.action;
                const id = parseInt(e.target.dataset.id);

                try {
                    showLoading();
                    switch (action) {
                        case 'edit':
                            await this.editUsuario(id);
                            break;
                        case 'delete':
                            if (confirm('¿Estás seguro de eliminar este usuario?')) {
                                await apiService.deleteUsuario(id);
                                showToast('Usuario eliminado exitosamente', 'success');
                                this.loadUsuarios();
                            }
                            break;
                    }
                } catch (error) {
                    showToast('Error: ' + error.message, 'error');
                } finally {
                    hideLoading();
                }
            });
        });
    }

    async editUsuario(id) {
        try {
            const usuario = await apiService.getUsuario(id);
            const modal = this.querySelector('#usuario-form-modal');
            if (modal) modal.open(usuario.data);
        } catch (error) {
            showToast('Error al cargar usuario: ' + error.message, 'error');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

customElements.define('gratiday-usuario-list', GratidayUsuarioList);

