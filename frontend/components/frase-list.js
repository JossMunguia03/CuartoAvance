/**
 * Componente Frase List - Lista y gestión de frases
 */

import { apiService } from '../services/api.js';
import { authService } from '../services/auth.js';
import { showToast, showLoading, hideLoading } from '../app.js';

class GratidayFraseList extends HTMLElement {
    constructor() {
        super();
        this.frases = [];
        this.categorias = [];
        this.filters = { status: '', categoria_id: '', search: '' };
    }

    connectedCallback() {
        this.render();
        // Las frases públicas se pueden cargar siempre
        this.loadCategorias();
        this.loadFrases();
    }

    async loadCategorias() {
        try {
            const response = await apiService.getCategorias();
            this.categorias = response.data || [];
            this.updateCategoriaFilter();
        } catch (error) {
            console.error('Error cargando categorías:', error);
        }
    }

    async loadFrases() {
        try {
            showLoading();
            const response = await apiService.getFrases(this.filters);
            this.frases = response.data || [];
            this.render();
        } catch (error) {
            showToast('Error al cargar frases: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    }

    updateCategoriaFilter() {
        const select = this.querySelector('#categoria-filter');
        if (select) {
            select.innerHTML = '<option value="">Todas las categorías</option>';
            this.categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id_category;
                option.textContent = cat.nombre;
                select.appendChild(option);
            });
        }
    }

    render() {
        this.innerHTML = `
            <div class="entity-container">
                <div class="entity-header">
                    <h2>📝 Gestión de Frases</h2>
                    <button class="btn btn-primary" id="add-frase-btn">
                        ➕ Nueva Frase
                    </button>
                </div>

                <div class="filters-container">
                    <input type="text" id="search-input" placeholder="🔍 Buscar frases..." 
                           class="filter-input">
                    <select id="status-filter" class="filter-select">
                        <option value="">Todos los estados</option>
                        <option value="published">Publicadas</option>
                        <option value="draft">Borrador</option>
                        <option value="scheduled">Programadas</option>
                    </select>
                    <select id="categoria-filter" class="filter-select">
                        <option value="">Todas las categorías</option>
                    </select>
                    <button class="btn btn-secondary" id="apply-filters-btn">Aplicar Filtros</button>
                </div>

                <div class="entity-list" id="frases-list">
                    ${this.renderFrases()}
                </div>
            </div>

            <gratiday-frase-form id="frase-form-modal"></gratiday-frase-form>
        `;

        this.attachEventListeners();
        this.updateCategoriaFilter();
    }

    renderFrases() {
        if (this.frases.length === 0) {
            return '<p class="empty-state">No hay frases disponibles</p>';
        }

        return this.frases.map(frase => `
            <div class="entity-card" data-id="${frase.id_quote}">
                <div class="entity-card-header">
                    <h3>${this.escapeHtml(frase.texto)}</h3>
                    <span class="badge badge-${frase.status}">${frase.status}</span>
                </div>
                <div class="entity-card-body">
                    <p><strong>Autor:</strong> ${this.escapeHtml(frase.autor || 'Anónimo')}</p>
                    <p><strong>Categoría:</strong> ${frase.categoria_nombre || 'Sin categoría'}</p>
                    <p><strong>Creado por:</strong> ${frase.creado_por_nombre || 'Usuario'}</p>
                    <p><strong>Fecha:</strong> ${new Date(frase.fecha_creacion).toLocaleDateString()}</p>
                </div>
                <div class="entity-card-actions">
                    <button class="btn btn-sm btn-primary" data-action="edit" data-id="${frase.id_quote}">
                        ✏️ Editar
                    </button>
                    ${frase.status === 'draft' ? `
                        <button class="btn btn-sm btn-success" data-action="publish" data-id="${frase.id_quote}">
                            📢 Publicar
                        </button>
                    ` : ''}
                    ${frase.status === 'published' ? `
                        <button class="btn btn-sm btn-warning" data-action="draft" data-id="${frase.id_quote}">
                            📝 Borrador
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-danger" data-action="delete" data-id="${frase.id_quote}">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    attachEventListeners() {
        // Botón agregar
        const addBtn = this.querySelector('#add-frase-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const modal = this.querySelector('#frase-form-modal');
                if (modal) modal.open();
            });
        }

        // Filtros
        const applyFiltersBtn = this.querySelector('#apply-filters-btn');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.filters.search = this.querySelector('#search-input').value;
                this.filters.status = this.querySelector('#status-filter').value;
                this.filters.categoria_id = this.querySelector('#categoria-filter').value;
                this.loadFrases();
            });
        }

        // Acciones de las tarjetas
        this.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const action = e.target.dataset.action;
                const id = parseInt(e.target.dataset.id);

                try {
                    showLoading();
                    switch (action) {
                        case 'edit':
                            await this.editFrase(id);
                            break;
                        case 'publish':
                            await apiService.publishFrase(id);
                            showToast('Frase publicada exitosamente', 'success');
                            this.loadFrases();
                            break;
                        case 'draft':
                            await apiService.draftFrase(id);
                            showToast('Frase cambiada a borrador', 'success');
                            this.loadFrases();
                            break;
                        case 'delete':
                            if (confirm('¿Estás seguro de eliminar esta frase?')) {
                                await apiService.deleteFrase(id);
                                showToast('Frase eliminada exitosamente', 'success');
                                this.loadFrases();
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

    async editFrase(id) {
        try {
            const frase = await apiService.getFrase(id);
            const modal = this.querySelector('#frase-form-modal');
            if (modal) modal.open(frase.data);
        } catch (error) {
            showToast('Error al cargar frase: ' + error.message, 'error');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

customElements.define('gratiday-frase-list', GratidayFraseList);

