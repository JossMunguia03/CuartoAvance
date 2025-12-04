/**
 * Componente Categoria List - Lista y gestión de categorías
 */

import { apiService } from '../services/api.js';
<<<<<<< HEAD
import { authService } from '../services/auth.js';
=======
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
import { showToast, showLoading, hideLoading } from '../app.js';

class GratidayCategoriaList extends HTMLElement {
    constructor() {
        super();
        this.categorias = [];
<<<<<<< HEAD
        this.actionHandler = null;
=======
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
    }

    connectedCallback() {
        this.render();
        // Las categorías son públicas, se pueden cargar siempre
        this.loadCategorias();
<<<<<<< HEAD
        
        // Escuchar cambios de autenticación para re-renderizar
        window.addEventListener('auth-state-changed', () => {
            this.render();
            if (authService.isAdmin()) {
                this.loadCategorias();
            }
        });
=======
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
    }

    async loadCategorias() {
        try {
            showLoading();
            const response = await apiService.getCategorias();
            this.categorias = response.data || [];
            this.render();
        } catch (error) {
            showToast('Error al cargar categorías: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    }

    render() {
<<<<<<< HEAD
        const isAdmin = authService.isAdmin();
        
        this.innerHTML = `
            <div class="entity-container">
                <div class="entity-header">
                    <h2>📂 ${isAdmin ? 'Gestión de Categorías' : 'Categorías'}</h2>
                    ${isAdmin ? `
                        <button class="btn btn-primary" id="add-categoria-btn">
                            ➕ Nueva Categoría
                        </button>
                    ` : ''}
=======
        this.innerHTML = `
            <div class="entity-container">
                <div class="entity-header">
                    <h2>📂 Gestión de Categorías</h2>
                    <button class="btn btn-primary" id="add-categoria-btn">
                        ➕ Nueva Categoría
                    </button>
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
                </div>

                <div class="entity-list" id="categorias-list">
                    ${this.renderCategorias()}
                </div>
            </div>

<<<<<<< HEAD
            ${isAdmin ? '<gratiday-categoria-form id="categoria-form-modal"></gratiday-categoria-form>' : ''}
=======
            <gratiday-categoria-form id="categoria-form-modal"></gratiday-categoria-form>
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
        `;

        this.attachEventListeners();
    }

    renderCategorias() {
        if (this.categorias.length === 0) {
            return '<p class="empty-state">No hay categorías disponibles</p>';
        }

<<<<<<< HEAD
        const isAdmin = authService.isAdmin();

=======
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
        return this.categorias.map(cat => `
            <div class="entity-card" data-id="${cat.id_category}">
                <div class="entity-card-header">
                    <h3>${this.escapeHtml(cat.nombre)}</h3>
                </div>
                <div class="entity-card-body">
                    <p>${this.escapeHtml(cat.descripcion || 'Sin descripción')}</p>
                    ${cat.frases_count !== undefined ? `<p><strong>Frases:</strong> ${cat.frases_count}</p>` : ''}
                </div>
<<<<<<< HEAD
                ${isAdmin ? `
                    <div class="entity-card-actions">
                        <button class="btn btn-sm btn-primary" data-action="edit" data-id="${cat.id_category}">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-sm btn-danger" data-action="delete" data-id="${cat.id_category}">
                            🗑️ Eliminar
                        </button>
                    </div>
                ` : ''}
=======
                <div class="entity-card-actions">
                    <button class="btn btn-sm btn-primary" data-action="edit" data-id="${cat.id_category}">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-sm btn-danger" data-action="delete" data-id="${cat.id_category}">
                        🗑️ Eliminar
                    </button>
                </div>
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
            </div>
        `).join('');
    }

    attachEventListeners() {
<<<<<<< HEAD
        // Solo permitir acciones si el usuario es admin
        if (!authService.isAdmin()) {
            return;
        }

        // Botón agregar
        const addBtn = this.querySelector('#add-categoria-btn');
        if (addBtn) {
            // Remover listener anterior si existe
            addBtn.replaceWith(addBtn.cloneNode(true));
            const newAddBtn = this.querySelector('#add-categoria-btn');
            newAddBtn.addEventListener('click', () => {
=======
        const addBtn = this.querySelector('#add-categoria-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
                const modal = this.querySelector('#categoria-form-modal');
                if (modal) modal.open();
            });
        }

<<<<<<< HEAD
        // Event delegation para acciones de las tarjetas
        const categoriasList = this.querySelector('#categorias-list');
        if (categoriasList) {
            // Remover listener anterior si existe
            if (this.actionHandler) {
                categoriasList.removeEventListener('click', this.actionHandler);
            }
            
            // Crear nuevo handler
            this.actionHandler = async (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;

                const action = btn.dataset.action;
                const id = parseInt(btn.dataset.id);
=======
        this.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const action = e.target.dataset.action;
                const id = parseInt(e.target.dataset.id);
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489

                try {
                    showLoading();
                    switch (action) {
                        case 'edit':
                            await this.editCategoria(id);
                            break;
                        case 'delete':
                            if (confirm('¿Estás seguro de eliminar esta categoría?')) {
                                await apiService.deleteCategoria(id);
                                showToast('Categoría eliminada exitosamente', 'success');
                                this.loadCategorias();
                            }
                            break;
                    }
                } catch (error) {
                    showToast('Error: ' + error.message, 'error');
                } finally {
                    hideLoading();
                }
<<<<<<< HEAD
            };
            
            categoriasList.addEventListener('click', this.actionHandler);
        }
=======
            });
        });
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
    }

    async editCategoria(id) {
        try {
            const categoria = await apiService.getCategoria(id);
            const modal = this.querySelector('#categoria-form-modal');
            if (modal) modal.open(categoria.data);
        } catch (error) {
            showToast('Error al cargar categoría: ' + error.message, 'error');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

customElements.define('gratiday-categoria-list', GratidayCategoriaList);

