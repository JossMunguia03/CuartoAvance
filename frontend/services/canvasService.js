/**
 * Servicio Canvas - Genera imágenes de frases usando Canvas API
 */

class CanvasService {
    /**
     * Genera una imagen de una frase usando Canvas API
     * @param {Object} frase - Objeto con los datos de la frase
     * @param {Object} options - Opciones de personalización
     * @returns {Promise<Blob>} - Blob de la imagen generada
     */
    async generateFraseImage(frase, options = {}) {
        const {
            width = 1200,
            height = 630,
            backgroundColor = this.getRandomGradient(),
            textColor = '#1e293b',
            authorColor = '#64748b',
            fontSize = 48,
            authorFontSize = 24,
            padding = 80
        } = options;

        // Crear canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Dibujar fondo con gradiente
        this.drawGradientBackground(ctx, width, height, backgroundColor);

        // Configurar fuente y estilo de texto
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Dibujar texto de la frase
        const maxWidth = width - (padding * 2);
        const textY = height / 2 - 40;
        
        ctx.fillStyle = textColor;
        ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;
        
        // Dividir texto en líneas si es muy largo
        const lines = this.wrapText(ctx, frase.texto, maxWidth, fontSize);
        const lineHeight = fontSize * 1.4;
        const totalTextHeight = lines.length * lineHeight;
        let currentY = textY - (totalTextHeight / 2) + (lineHeight / 2);

        lines.forEach((line, index) => {
            ctx.fillText(line, width / 2, currentY + (index * lineHeight));
        });

        // Dibujar autor si existe
        if (frase.autor) {
            ctx.fillStyle = authorColor;
            ctx.font = `italic ${authorFontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;
            ctx.fillText(`— ${frase.autor}`, width / 2, textY + totalTextHeight / 2 + 50);
        }

        // Dibujar marca de agua (opcional)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.textAlign = 'right';
        ctx.fillText('GratiDay', width - padding, height - padding);

        // Convertir canvas a blob
        return new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/png', 0.95);
        });
    }

    /**
     * Dibuja un fondo con gradiente
     */
    drawGradientBackground(ctx, width, height, gradientConfig) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        
        if (Array.isArray(gradientConfig)) {
            // Si es un array de colores, crear gradiente
            gradientConfig.forEach((color, index) => {
                gradient.addColorStop(index / (gradientConfig.length - 1), color);
            });
        } else if (typeof gradientConfig === 'string') {
            // Si es un color sólido
            gradient.addColorStop(0, gradientConfig);
            gradient.addColorStop(1, gradientConfig);
        } else {
            // Gradiente por defecto
            gradient.addColorStop(0, '#6366f1');
            gradient.addColorStop(1, '#8b5cf6');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    /**
     * Divide el texto en líneas que caben en el ancho máximo
     */
    wrapText(ctx, text, maxWidth, fontSize) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    /**
     * Obtiene un gradiente aleatorio de colores atractivos
     */
    getRandomGradient() {
        const gradients = [
            ['#6366f1', '#8b5cf6'], // Índigo a púrpura
            ['#ec4899', '#f472b6'], // Rosa
            ['#10b981', '#34d399'], // Verde
            ['#f59e0b', '#fbbf24'], // Amarillo/Naranja
            ['#3b82f6', '#60a5fa'], // Azul
            ['#8b5cf6', '#a78bfa'], // Púrpura claro
            ['#06b6d4', '#22d3ee'], // Cyan
            ['#f97316', '#fb923c'], // Naranja
            ['#14b8a6', '#2dd4bf'], // Teal
            ['#a855f7', '#c084fc'], // Violeta
        ];

        return gradients[Math.floor(Math.random() * gradients.length)];
    }

    /**
     * Descarga la imagen generada
     */
    async downloadImage(frase) {
        try {
            const blob = await this.generateFraseImage(frase);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gratiday-frase-${frase.id_quote || Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Error al descargar imagen:', error);
            throw error;
        }
    }

    /**
     * Copia la imagen al portapapeles
     */
    async copyToClipboard(frase) {
        try {
            const blob = await this.generateFraseImage(frase);
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            return true;
        } catch (error) {
            console.error('Error al copiar al portapapeles:', error);
            // Fallback: descargar si no se puede copiar
            await this.downloadImage(frase);
            throw new Error('No se pudo copiar al portapapeles. Se descargó la imagen en su lugar.');
        }
    }

    /**
     * Comparte la imagen usando Web Share API
     */
    async shareImage(frase) {
        try {
            const blob = await this.generateFraseImage(frase);
            const file = new File([blob], `gratiday-frase-${frase.id_quote || Date.now()}.png`, { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Frase de GratiDay',
                    text: frase.texto,
                    files: [file]
                });
                return true;
            } else {
                // Fallback: descargar si Web Share API no está disponible
                await this.downloadImage(frase);
                return false;
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error al compartir:', error);
                // Fallback: descargar
                await this.downloadImage(frase);
            }
            throw error;
        }
    }

    /**
     * Genera una URL de datos de la imagen para vista previa
     */
    async getImageDataURL(frase) {
        const blob = await this.generateFraseImage(frase);
        return URL.createObjectURL(blob);
    }
}

// Exportar instancia única
export const canvasService = new CanvasService();

