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
<<<<<<< HEAD
        this.actionHandler = null;
=======
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
    }

    connectedCallback() {
        this.render();
        // Las frases públicas se pueden cargar siempre
        this.loadCategorias();
        this.loadFrases();
<<<<<<< HEAD
        
        // Escuchar cambios de autenticación para re-renderizar
        window.addEventListener('auth-state-changed', () => {
            this.render();
            this.loadFrases();
        });
=======
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
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
<<<<<<< HEAD
            
            // Si el usuario es "user", solo mostrar frases publicadas
            const userRole = authService.getUserRole();
            if (userRole === 'user') {
                // Forzar filtro de status a "published" para usuarios normales
                this.filters.status = 'published';
            }
            
=======
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
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
<<<<<<< HEAD
        const userRole = authService.getUserRole();
        const isAdmin = userRole === 'admin';
        
        this.innerHTML = `
            <div class="entity-container">
                <div class="entity-header">
                    <h2>📝 ${isAdmin ? 'Gestión de Frases' : 'Frases Publicadas'}</h2>
                    ${isAdmin ? `
                        <button class="btn btn-primary" id="add-frase-btn">
                            ➕ Nueva Frase
                        </button>
                    ` : ''}
=======
        this.innerHTML = `
            <div class="entity-container">
                <div class="entity-header">
                    <h2>📝 Gestión de Frases</h2>
                    <button class="btn btn-primary" id="add-frase-btn">
                        ➕ Nueva Frase
                    </button>
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
                </div>

                <div class="filters-container">
                    <input type="text" id="search-input" placeholder="🔍 Buscar frases..." 
                           class="filter-input">
<<<<<<< HEAD
                    ${isAdmin ? `
                        <select id="status-filter" class="filter-select">
                            <option value="">Todos los estados</option>
                            <option value="published" ${this.filters.status === 'published' ? 'selected' : ''}>Publicadas</option>
                            <option value="draft">Borrador</option>
                            <option value="scheduled">Programadas</option>
                        </select>
                    ` : `
                        <select id="status-filter" class="filter-select" disabled>
                            <option value="published" selected>Publicadas</option>
                        </select>
                    `}
=======
                    <select id="status-filter" class="filter-select">
                        <option value="">Todos los estados</option>
                        <option value="published">Publicadas</option>
                        <option value="draft">Borrador</option>
                        <option value="scheduled">Programadas</option>
                    </select>
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
                    <select id="categoria-filter" class="filter-select">
                        <option value="">Todas las categorías</option>
                    </select>
                    <button class="btn btn-secondary" id="apply-filters-btn">Aplicar Filtros</button>
                </div>

                <div class="entity-list" id="frases-list">
                    ${this.renderFrases()}
                </div>
            </div>

<<<<<<< HEAD
            ${isAdmin ? '<gratiday-frase-form id="frase-form-modal"></gratiday-frase-form>' : ''}
            <gratiday-share-frase-modal id="share-frase-modal"></gratiday-share-frase-modal>
=======
            <gratiday-frase-form id="frase-form-modal"></gratiday-frase-form>
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
        `;

        this.attachEventListeners();
        this.updateCategoriaFilter();
    }

    renderFrases() {
        if (this.frases.length === 0) {
            return '<p class="empty-state">No hay frases disponibles</p>';
        }

<<<<<<< HEAD
        const isAdmin = authService.isAdmin();
        const colorClasses = ['frase-card-1', 'frase-card-2', 'frase-card-3', 'frase-card-4', 'frase-card-5'];

        return this.frases
            .map((frase, index) => {
                // Asignar un color \"aleatorio\" pero estable según el índice
                const colorClass = colorClasses[index % colorClasses.length];

                return `
                    <div class="entity-card ${colorClass}" data-id="${frase.id_quote}">
                        <div class="entity-card-header">
                            <h3>${this.escapeHtml(frase.texto)}</h3>
                            ${isAdmin ? `<span class="badge badge-${frase.status}">${frase.status}</span>` : ''}
                        </div>
                        <div class="entity-card-body">
                            <p><strong>Autor:</strong> ${this.escapeHtml(frase.autor || 'Anónimo')}</p>
                            <p><strong>Categoría:</strong> ${frase.categoria_nombre || 'Sin categoría'}</p>
                            ${isAdmin ? `
                                <p><strong>Creado por:</strong> ${frase.creado_por_nombre || 'Usuario'}</p>
                            ` : ''}
                            <p><strong>Fecha:</strong> ${new Date(frase.fecha_creacion).toLocaleDateString()}</p>
                        </div>
                        ${frase.status === 'published' ? `
                            <div class="entity-card-actions">
                                <button class="btn btn-sm btn-info" data-action="share" data-id="${frase.id_quote}">
                                    📤 Compartir
                                </button>
                            </div>
                        ` : ''}
                        ${isAdmin ? `
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
                        ` : ''}
                    </div>
                `;
            })
            .join('');
    }

    attachEventListeners() {
        // Botón agregar (solo para admin)
        const addBtn = this.querySelector('#add-frase-btn');
        if (addBtn && authService.isAdmin()) {
            // Remover listener anterior si existe
            addBtn.replaceWith(addBtn.cloneNode(true));
            const newAddBtn = this.querySelector('#add-frase-btn');
            newAddBtn.addEventListener('click', () => {
=======
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
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
                const modal = this.querySelector('#frase-form-modal');
                if (modal) modal.open();
            });
        }

        // Filtros
        const applyFiltersBtn = this.querySelector('#apply-filters-btn');
        if (applyFiltersBtn) {
<<<<<<< HEAD
            // Remover listener anterior si existe
            applyFiltersBtn.replaceWith(applyFiltersBtn.cloneNode(true));
            const newFiltersBtn = this.querySelector('#apply-filters-btn');
            newFiltersBtn.addEventListener('click', () => {
                this.filters.search = this.querySelector('#search-input').value;
                
                // Si el usuario es "user", forzar status a "published"
                const userRole = authService.getUserRole();
                if (userRole === 'user') {
                    this.filters.status = 'published';
                } else {
                    this.filters.status = this.querySelector('#status-filter')?.value || '';
                }
                
                this.filters.categoria_id = this.querySelector('#categoria-filter')?.value || '';
=======
            applyFiltersBtn.addEventListener('click', () => {
                this.filters.search = this.querySelector('#search-input').value;
                this.filters.status = this.querySelector('#status-filter').value;
                this.filters.categoria_id = this.querySelector('#categoria-filter').value;
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
                this.loadFrases();
            });
        }

<<<<<<< HEAD
        // Event delegation para acciones de las tarjetas
        const frasesList = this.querySelector('#frases-list');
        if (frasesList) {
            // Remover listener anterior si existe
            if (this.actionHandler) {
                frasesList.removeEventListener('click', this.actionHandler);
            }
            
            // Crear nuevo handler
            this.actionHandler = async (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;

                const action = btn.dataset.action;
                const id = parseInt(btn.dataset.id);
=======
        // Acciones de las tarjetas
        this.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const action = e.target.dataset.action;
                const id = parseInt(e.target.dataset.id);
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489

                try {
                    showLoading();
                    switch (action) {
<<<<<<< HEAD
                        case 'share':
                            await this.shareFrase(id);
                            break;
                        case 'edit':
                            if (authService.isAdmin()) {
                                await this.editFrase(id);
                            }
                            break;
                        case 'publish':
                            if (authService.isAdmin()) {
                                await apiService.publishFrase(id);
                                showToast('Frase publicada exitosamente', 'success');
                                this.loadFrases();
                            }
                            break;
                        case 'draft':
                            if (authService.isAdmin()) {
                                await apiService.draftFrase(id);
                                showToast('Frase cambiada a borrador', 'success');
                                this.loadFrases();
                            }
                            break;
                        case 'delete':
                            if (authService.isAdmin() && confirm('¿Estás seguro de eliminar esta frase?')) {
=======
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
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
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
<<<<<<< HEAD
            };
            
            frasesList.addEventListener('click', this.actionHandler);
        }
    }

    async shareFrase(id) {
        try {
            const frase = await apiService.getFrase(id);
            const modal = this.querySelector('#share-frase-modal');
            if (modal) {
                modal.open(frase.data);
            }
        } catch (error) {
            showToast('Error al cargar frase: ' + error.message, 'error');
            throw error;
        }
=======
            });
        });
>>>>>>> 7187062503d90affb6088570f8edb85756c7e489
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

