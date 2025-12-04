/**
 * Servicio Scheduler - Publicación automática de frases programadas
 * 
 * Este servicio verifica periódicamente las frases con estado "scheduled"
 * cuya fecha de publicación ya haya llegado y las publica automáticamente.
 */

const Frase = require('../models/Frase');

class Scheduler {
    constructor(intervalMinutes = 5) {
        this.intervalMinutes = intervalMinutes;
        this.intervalId = null;
        this.isRunning = false;
    }

    /**
     * Inicia el scheduler
     */
    start() {
        if (this.isRunning) {
            console.log('⚠️  El scheduler ya está en ejecución');
            return;
        }

        console.log(`🕐 Iniciando scheduler de publicación automática (verificación cada ${this.intervalMinutes} minutos)`);
        
        // Ejecutar inmediatamente al iniciar
        this.checkAndPublishScheduled();

        // Ejecutar periódicamente
        this.intervalId = setInterval(() => {
            this.checkAndPublishScheduled();
        }, this.intervalMinutes * 60 * 1000);

        this.isRunning = true;
    }

    /**
     * Detiene el scheduler
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.isRunning = false;
            console.log('🛑 Scheduler detenido');
        }
    }

    /**
     * Verifica y publica frases programadas cuya fecha ya haya llegado
     */
    async checkAndPublishScheduled() {
        try {
            console.log('🔍 Verificando frases programadas para publicar...');
            
            // Buscar frases programadas cuya fecha ya haya pasado
            const scheduledFrases = await Frase.findScheduled();
            
            if (scheduledFrases.length === 0) {
                console.log('✅ No hay frases programadas listas para publicar');
                return;
            }

            console.log(`📝 Encontradas ${scheduledFrases.length} frase(s) programada(s) para publicar`);

            // Publicar cada frase
            let publishedCount = 0;
            let errorCount = 0;

            for (const frase of scheduledFrases) {
                try {
                    await frase.publish();
                    publishedCount++;
                    console.log(`✅ Frase #${frase.id_quote} publicada automáticamente: "${frase.texto.substring(0, 50)}..."`);
                } catch (error) {
                    errorCount++;
                    console.error(`❌ Error al publicar frase #${frase.id_quote}:`, error.message);
                }
            }

            console.log(`📊 Resumen: ${publishedCount} publicada(s), ${errorCount} error(es)`);

        } catch (error) {
            console.error('❌ Error en el scheduler de publicación automática:', error.message);
        }
    }

    /**
     * Obtiene el estado del scheduler
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            intervalMinutes: this.intervalMinutes,
            nextCheckIn: this.isRunning ? `${this.intervalMinutes} minutos` : 'N/A'
        };
    }
}

// Crear instancia singleton
const scheduler = new Scheduler(5); // Verificar cada 5 minutos

module.exports = scheduler;

