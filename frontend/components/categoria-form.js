/**
 * Componente Categoria Form - Formulario para crear/editar categorías
 */

import { apiService } from '../services/api.js';
import { showToast, showLoading, hideLoading } from '../app.js';

class GratidayCategoriaForm extends HTMLElement {
    constructor() {
        super();
        this.categoria = null;
    }

    connectedCallback() {
        this.render();
    }

    open(categoria = null) {
        this.categoria = categoria;
        this.render();
        const modal = this.querySelector(`#categoria-modal-${this.uniqueId}`);
        if (modal) modal.classList.add('active');
    }

    close() {
        const modal = this.querySelector(`#categoria-modal-${this.uniqueId}`);
        if (modal) modal.classList.remove('active');
        this.categoria = null;
    }

    render() {
        const uniqueId = `categoria-${Date.now()}`;
        this.innerHTML = `
            <div class="modal" id="categoria-modal-${uniqueId}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${this.categoria ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                        <button class="modal-close" id="close-modal-${uniqueId}">&times;</button>
                    </div>
                    <form id="categoria-form-${uniqueId}">
                        <div class="form-group">
                            <label for="nombre-${uniqueId}">Nombre *</label>
                            <input type="text" id="nombre-${uniqueId}" name="nombre" required 
                                   minlength="2" maxlength="80" 
                                   value="${this.categoria?.nombre || ''}">
                        </div>

                        <div class="form-group">
                            <label for="descripcion-${uniqueId}">Descripción</label>
                            <textarea id="descripcion-${uniqueId}" name="descripcion" rows="3" 
                                      maxlength="255">${this.categoria?.descripcion || ''}</textarea>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancel-btn-${uniqueId}">Cancelar</button>
                            <button type="submit" class="btn btn-primary">${this.categoria ? 'Actualizar' : 'Crear'}</button>
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
        
        const form = this.querySelector(`#categoria-form-${this.uniqueId}`);
        const closeBtn = this.querySelector(`#close-modal-${this.uniqueId}`);
        const cancelBtn = this.querySelector(`#cancel-btn-${this.uniqueId}`);
        const modal = this.querySelector(`#categoria-modal-${this.uniqueId}`);

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
                await this.saveCategoria();
            });
        }
    }

    async saveCategoria() {
        try {
            showLoading();

            const form = this.querySelector(`#categoria-form-${this.uniqueId}`);
            if (!form) return;
            
            const formData = new FormData(form);
            const categoriaData = {
                nombre: formData.get('nombre'),
                descripcion: formData.get('descripcion') || '',
            };

            if (this.categoria) {
                await apiService.updateCategoria(this.categoria.id_category, categoriaData);
                showToast('Categoría actualizada exitosamente', 'success');
            } else {
                await apiService.createCategoria(categoriaData);
                showToast('Categoría creada exitosamente', 'success');
            }

            this.close();
            window.dispatchEvent(new CustomEvent('categoria-updated'));

        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    }
}

customElements.define('gratiday-categoria-form', GratidayCategoriaForm);

