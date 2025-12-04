/**
 * Componente Share Frase Modal - Modal para compartir frases como imagen
 */

import { canvasService } from '../services/canvasService.js';
import { showToast, showLoading, hideLoading } from '../app.js';

class GratidayShareFraseModal extends HTMLElement {
    constructor() {
        super();
        this.frase = null;
        this.imagePreviewUrl = null;
    }

    connectedCallback() {
        this.render();
    }

    open(frase) {
        this.frase = frase;
        this.render();
        this.loadPreview();
        const modal = this.querySelector(`#share-modal-${this.uniqueId}`);
        if (modal) modal.classList.add('active');
    }

    close() {
        const modal = this.querySelector(`#share-modal-${this.uniqueId}`);
        if (modal) modal.classList.remove('active');
        this.frase = null;
        if (this.imagePreviewUrl) {
            URL.revokeObjectURL(this.imagePreviewUrl);
            this.imagePreviewUrl = null;
        }
    }

    async loadPreview() {
        if (!this.frase) return;

        try {
            showLoading();
            this.imagePreviewUrl = await canvasService.getImageDataURL(this.frase);
            const previewImg = this.querySelector(`#preview-image-${this.uniqueId}`);
            if (previewImg) {
                previewImg.src = this.imagePreviewUrl;
                previewImg.style.display = 'block';
            }
        } catch (error) {
            showToast('Error al generar vista previa: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    }

    render() {
        const uniqueId = `share-${Date.now()}`;
        this.uniqueId = uniqueId;

        this.innerHTML = `
            <div class="modal" id="share-modal-${uniqueId}">
                <div class="modal-content share-modal-content">
                    <div class="modal-header">
                        <h3>📤 Compartir Frase</h3>
                        <button class="modal-close" id="close-share-modal-${uniqueId}">&times;</button>
                    </div>
                    <div class="share-modal-body">
                        <div class="preview-container">
                            <img id="preview-image-${uniqueId}" 
                                 alt="Vista previa de la frase" 
                                 style="display: none; max-width: 100%; border-radius: var(--border-radius);">
                            <div class="preview-loading" id="preview-loading-${uniqueId}">
                                <div class="spinner"></div>
                                <p>Generando imagen...</p>
                            </div>
                        </div>
                        <div class="share-actions">
                            <button class="btn btn-primary" id="download-btn-${uniqueId}">
                                💾 Descargar Imagen
                            </button>
                            <button class="btn btn-secondary" id="copy-btn-${uniqueId}">
                                📋 Copiar al Portapapeles
                            </button>
                            <button class="btn btn-success" id="share-btn-${uniqueId}">
                                📤 Compartir
                            </button>
                        </div>
                        <div class="share-info">
                            <p>💡 <strong>Tip:</strong> Puedes descargar la imagen y compartirla en tus redes sociales favoritas.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        if (!this.uniqueId) return;

        const closeBtn = this.querySelector(`#close-share-modal-${this.uniqueId}`);
        const downloadBtn = this.querySelector(`#download-btn-${this.uniqueId}`);
        const copyBtn = this.querySelector(`#copy-btn-${this.uniqueId}`);
        const shareBtn = this.querySelector(`#share-btn-${this.uniqueId}`);
        const modal = this.querySelector(`#share-modal-${this.uniqueId}`);
        const previewImg = this.querySelector(`#preview-image-${this.uniqueId}`);

        // Cerrar modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    this.close();
                }
            });
        }

        // Cuando la imagen se carga, ocultar el loading
        if (previewImg) {
            previewImg.addEventListener('load', () => {
                const loading = this.querySelector(`#preview-loading-${this.uniqueId}`);
                if (loading) loading.style.display = 'none';
            });
        }

        // Descargar imagen
        if (downloadBtn) {
            downloadBtn.addEventListener('click', async () => {
                try {
                    showLoading();
                    await canvasService.downloadImage(this.frase);
                    showToast('Imagen descargada exitosamente', 'success');
                } catch (error) {
                    showToast('Error al descargar: ' + error.message, 'error');
                } finally {
                    hideLoading();
                }
            });
        }

        // Copiar al portapapeles
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                try {
                    showLoading();
                    await canvasService.copyToClipboard(this.frase);
                    showToast('Imagen copiada al portapapeles', 'success');
                } catch (error) {
                    showToast(error.message || 'Error al copiar', 'error');
                } finally {
                    hideLoading();
                }
            });
        }

        // Compartir
        if (shareBtn) {
            shareBtn.addEventListener('click', async () => {
                try {
                    showLoading();
                    const shared = await canvasService.shareImage(this.frase);
                    if (shared) {
                        showToast('Imagen compartida exitosamente', 'success');
                    }
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        showToast('Error al compartir: ' + error.message, 'error');
                    }
                } finally {
                    hideLoading();
                }
            });
        }
    }
}

customElements.define('gratiday-share-frase-modal', GratidayShareFraseModal);

