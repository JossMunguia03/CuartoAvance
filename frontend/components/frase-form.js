/**
 * Componente Frase Form - Formulario para crear/editar frases
 */

import { apiService } from '../services/api.js';
import { showToast, showLoading, hideLoading } from '../app.js';

class GratidayFraseForm extends HTMLElement {
    constructor() {
        super();
        this.frase = null;
        this.categorias = [];
    }

    connectedCallback() {
        this.loadCategorias();
        this.render();
    }

    async loadCategorias() {
        try {
            const response = await apiService.getCategorias();
            this.categorias = response.data || [];
            this.updateCategoriaSelect();
        } catch (error) {
            console.error('Error cargando categorías:', error);
        }
    }

    updateCategoriaSelect() {
        const select = this.querySelector(`#categoria_id-${this.uniqueId || ''}`);
        if (select) {
            select.innerHTML = '<option value="">Selecciona una categoría</option>';
            this.categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id_category;
                option.textContent = cat.nombre;
                if (this.frase && this.frase.categoria_id === cat.id_category) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        }
    }

    open(frase = null) {
        this.frase = frase;
        this.render();
        this.updateCategoriaSelect();
        const modal = this.querySelector(`#frase-modal-${this.uniqueId}`);
        if (modal) modal.classList.add('active');
    }

    close() {
        const modal = this.querySelector(`#frase-modal-${this.uniqueId}`);
        if (modal) modal.classList.remove('active');
        this.frase = null;
    }

    render() {
        const uniqueId = `frase-${Date.now()}`;
        this.innerHTML = `
            <div class="modal" id="frase-modal-${uniqueId}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${this.frase ? 'Editar Frase' : 'Nueva Frase'}</h3>
                        <button class="modal-close" id="close-modal-${uniqueId}">&times;</button>
                    </div>
                    <form id="frase-form-${uniqueId}">
                        <div class="form-group">
                            <label for="texto-${uniqueId}">Texto de la Frase *</label>
                            <textarea id="texto-${uniqueId}" name="texto" rows="4" required 
                                      minlength="10" maxlength="1000">${this.frase?.texto || ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label for="autor-${uniqueId}">Autor</label>
                            <input type="text" id="autor-${uniqueId}" name="autor" 
                                   value="${this.frase?.autor || ''}" maxlength="120">
                        </div>

                        <div class="form-group">
                            <label for="categoria_id-${uniqueId}">Categoría *</label>
                            <select id="categoria_id-${uniqueId}" name="categoria_id" required>
                                <option value="">Selecciona una categoría</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="status-${uniqueId}">Estado</label>
                            <select id="status-${uniqueId}" name="status">
                                <option value="draft" ${this.frase?.status === 'draft' ? 'selected' : ''}>
                                    Borrador
                                </option>
                                <option value="published" ${this.frase?.status === 'published' ? 'selected' : ''}>
                                    Publicada
                                </option>
                                <option value="scheduled" ${this.frase?.status === 'scheduled' ? 'selected' : ''}>
                                    Programada
                                </option>
                            </select>
                        </div>

                        <div class="form-group" id="scheduled-group-${uniqueId}" style="display: ${this.frase?.status === 'scheduled' ? 'block' : 'none'};">
                            <label for="scheduled_at-${uniqueId}">Fecha de Publicación Programada</label>
                            <input type="datetime-local" id="scheduled_at-${uniqueId}" name="scheduled_at" 
                                   value="${this.frase?.scheduled_at ? this.formatDateTimeLocal(this.frase.scheduled_at) : ''}">
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancel-btn-${uniqueId}">Cancelar</button>
                            <button type="submit" class="btn btn-primary">${this.frase ? 'Actualizar' : 'Crear'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        this.uniqueId = uniqueId;

        this.attachEventListeners();
        this.updateCategoriaSelect();
    }

    attachEventListeners() {
        if (!this.uniqueId) return;
        
        const form = this.querySelector(`#frase-form-${this.uniqueId}`);
        const closeBtn = this.querySelector(`#close-modal-${this.uniqueId}`);
        const cancelBtn = this.querySelector(`#cancel-btn-${this.uniqueId}`);
        const statusSelect = this.querySelector(`#status-${this.uniqueId}`);
        const scheduledGroup = this.querySelector(`#scheduled-group-${this.uniqueId}`);
        const modal = this.querySelector(`#frase-modal-${this.uniqueId}`);

        // Mostrar/ocultar campo de fecha programada
        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                if (scheduledGroup) {
                    scheduledGroup.style.display = e.target.value === 'scheduled' ? 'block' : 'none';
                }
            });
        }

        // Cerrar modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
        }

        // Cerrar al hacer click fuera
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    this.close();
                }
            });
        }

        // Submit del formulario
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveFrase();
            });
        }
    }

    async saveFrase() {
        try {
            showLoading();

            const form = this.querySelector(`#frase-form-${this.uniqueId}`);
            if (!form) return;
            
            const formData = new FormData(form);
            const fraseData = {
                texto: formData.get('texto'),
                autor: formData.get('autor') || '',
                categoria_id: parseInt(formData.get('categoria_id')),
                status: formData.get('status'),
            };

            if (fraseData.status === 'scheduled') {
                const scheduledAt = formData.get('scheduled_at');
                if (scheduledAt) {
                    fraseData.scheduled_at = new Date(scheduledAt).toISOString().slice(0, 19).replace('T', ' ');
                }
            }

            if (this.frase) {
                await apiService.updateFrase(this.frase.id_quote, fraseData);
                showToast('Frase actualizada exitosamente', 'success');
            } else {
                await apiService.createFrase(fraseData);
                showToast('Frase creada exitosamente', 'success');
            }

            this.close();
            window.dispatchEvent(new CustomEvent('frase-updated'));

        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    }

    formatDateTimeLocal(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
}

customElements.define('gratiday-frase-form', GratidayFraseForm);

