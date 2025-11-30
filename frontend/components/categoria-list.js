/**
 * Componente Categoria List - Lista y gestión de categorías
 */

import { apiService } from '../services/api.js';
import { showToast, showLoading, hideLoading } from '../app.js';

class GratidayCategoriaList extends HTMLElement {
    constructor() {
        super();
        this.categorias = [];
    }

    connectedCallback() {
        this.render();
        // Las categorías son públicas, se pueden cargar siempre
        this.loadCategorias();
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
        this.innerHTML = `
            <div class="entity-container">
                <div class="entity-header">
                    <h2>📂 Gestión de Categorías</h2>
                    <button class="btn btn-primary" id="add-categoria-btn">
                        ➕ Nueva Categoría
                    </button>
                </div>

                <div class="entity-list" id="categorias-list">
                    ${this.renderCategorias()}
                </div>
            </div>

            <gratiday-categoria-form id="categoria-form-modal"></gratiday-categoria-form>
        `;

        this.attachEventListeners();
    }

    renderCategorias() {
        if (this.categorias.length === 0) {
            return '<p class="empty-state">No hay categorías disponibles</p>';
        }

        return this.categorias.map(cat => `
            <div class="entity-card" data-id="${cat.id_category}">
                <div class="entity-card-header">
                    <h3>${this.escapeHtml(cat.nombre)}</h3>
                </div>
                <div class="entity-card-body">
                    <p>${this.escapeHtml(cat.descripcion || 'Sin descripción')}</p>
                    ${cat.frases_count !== undefined ? `<p><strong>Frases:</strong> ${cat.frases_count}</p>` : ''}
                </div>
                <div class="entity-card-actions">
                    <button class="btn btn-sm btn-primary" data-action="edit" data-id="${cat.id_category}">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-sm btn-danger" data-action="delete" data-id="${cat.id_category}">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    attachEventListeners() {
        const addBtn = this.querySelector('#add-categoria-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const modal = this.querySelector('#categoria-form-modal');
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
            });
        });
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

