const Database = require('../database/Database');

class Frase {
    constructor(data = {}) {
        this.id_quote = data.id_quote || null;
        this.texto = data.texto || '';
        this.autor = data.autor || '';
        this.fecha_creacion = data.fecha_creacion || null;
        this.scheduled_at = data.scheduled_at || null;
        this.status = data.status || 'draft';
        this.creado_por = data.creado_por || null;
        this.categoria_id = data.categoria_id || null;
        this.creado_por_nombre = data.creado_por_nombre || '';
        this.categoria_nombre = data.categoria_nombre || '';
    }

    validate() {
        const errors = [];
        if (!this.texto || this.texto.trim().length < 10) errors.push('El texto debe tener al menos 10 caracteres');
        if (this.texto && this.texto.length > 1000) errors.push('El texto no puede exceder 1000 caracteres');
        if (this.autor && this.autor.length > 120) errors.push('El nombre del autor no puede exceder 120 caracteres');
        if (!this.creado_por || this.creado_por <= 0) errors.push('Debe especificar el ID del usuario creador');
        if (!this.categoria_id || this.categoria_id <= 0) errors.push('Debe especificar el ID de la categoría');
        if (!['draft', 'scheduled', 'published'].includes(this.status)) errors.push('El estado debe ser draft, scheduled o published');
        if (this.status === 'scheduled' && !this.scheduled_at) errors.push('Las frases programadas deben tener una fecha de publicación');
        if (this.scheduled_at && new Date(this.scheduled_at) <= new Date()) errors.push('La fecha de publicación programada debe ser futura');
        return { isValid: errors.length === 0, errors };
    }

    async create() {
        const validation = this.validate();
        if (!validation.isValid) throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
        const db = new Database();
        const query = `
            INSERT INTO frase (texto, autor, scheduled_at, status, creado_por, categoria_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        try {
            await db.query(query, [this.texto, this.autor, this.scheduled_at, this.status, this.creado_por, this.categoria_id]);
            this.id_quote = await db.getLastInsertId();
            this.fecha_creacion = new Date();
            return this;
        } catch (error) {
            if (error.code === 'ER_NO_REFERENCED_ROW_2') throw new Error('El usuario o categoría especificados no existen');
            throw error;
        }
    }

    static async findById(id, includeDetails = true) {
        const db = new Database();
        let query, params;
        if (includeDetails) {
            query = `
                SELECT f.*, u.nombre as creado_por_nombre, c.nombre as categoria_nombre
                FROM frase f
                JOIN usuario u ON f.creado_por = u.id_user
                JOIN categoria c ON f.categoria_id = c.id_category
                WHERE f.id_quote = ?
            `;
            params = [id];
        } else {
            query = 'SELECT * FROM frase WHERE id_quote = ?';
            params = [id];
        }
        const results = await db.query(query, params);
        if (results.length === 0) return null;
        return new Frase(results[0]);
    }

    static async findAll(filters = {}, limit = 50, offset = 0) {
        const db = new Database();
        let whereConditions = [];
        let params = [];
        if (filters.status) { whereConditions.push('f.status = ?'); params.push(filters.status); }
        if (filters.categoria_id) { whereConditions.push('f.categoria_id = ?'); params.push(filters.categoria_id); }
        if (filters.creado_por) { whereConditions.push('f.creado_por = ?'); params.push(filters.creado_por); }
        if (filters.search) { whereConditions.push('(f.texto LIKE ? OR f.autor LIKE ?)'); const s = `%${filters.search}%`; params.push(s, s); }
        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
        // MySQL no acepta placeholders para LIMIT y OFFSET
        const query = `
            SELECT f.*, u.nombre as creado_por_nombre, c.nombre as categoria_nombre
            FROM frase f
            JOIN usuario u ON f.creado_por = u.id_user
            JOIN categoria c ON f.categoria_id = c.id_category
            ${whereClause}
            ORDER BY f.fecha_creacion DESC
            LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;
        const results = await db.query(query, params);
        return results.map(row => new Frase(row));
    }

    static async findPublished(limit = 50, offset = 0) {
        return Frase.findAll({ status: 'published' }, limit, offset);
    }

    static async findScheduled() {
        const db = new Database();
        const query = `
            SELECT f.*, u.nombre as creado_por_nombre, c.nombre as categoria_nombre
            FROM frase f
            JOIN usuario u ON f.creado_por = u.id_user
            JOIN categoria c ON f.categoria_id = c.id_category
            WHERE f.status = 'scheduled' AND f.scheduled_at <= NOW()
            ORDER BY f.scheduled_at ASC
        `;
        const results = await db.query(query);
        return results.map(row => new Frase(row));
    }

    static async findRandom(count = 1, categoria_id = null) {
        const db = new Database();
        let query, params;
        // MySQL no acepta placeholders para LIMIT
        if (categoria_id) {
            query = `
                SELECT f.*, u.nombre as creado_por_nombre, c.nombre as categoria_nombre
                FROM frase f
                JOIN usuario u ON f.creado_por = u.id_user
                JOIN categoria c ON f.categoria_id = c.id_category
                WHERE f.status = 'published' AND f.categoria_id = ?
                ORDER BY RAND()
                LIMIT ${parseInt(count)}
            `;
            params = [categoria_id];
        } else {
            query = `
                SELECT f.*, u.nombre as creado_por_nombre, c.nombre as categoria_nombre
                FROM frase f
                JOIN usuario u ON f.creado_por = u.id_user
                JOIN categoria c ON f.categoria_id = c.id_category
                WHERE f.status = 'published'
                ORDER BY RAND()
                LIMIT ${parseInt(count)}
            `;
            params = [];
        }
        const results = await db.query(query, params);
        return results.map(row => new Frase(row));
    }

    async update(updateData = {}) {
        if (this.id_quote === null) throw new Error('No se puede actualizar una frase sin ID');
        Object.keys(updateData).forEach(key => { if (updateData[key] !== undefined && key !== 'id_quote') this[key] = updateData[key]; });
        const validation = this.validate();
        if (!validation.isValid) throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
        const db = new Database();
        const query = `
            UPDATE frase 
            SET texto = ?, autor = ?, scheduled_at = ?, status = ?, categoria_id = ?
            WHERE id_quote = ?
        `;
        await db.query(query, [this.texto, this.autor, this.scheduled_at, this.status, this.categoria_id, this.id_quote]);
        return this;
    }

    async publish() { return this.update({ status: 'published', scheduled_at: null }); }
    async schedule(scheduledDate) { return this.update({ status: 'scheduled', scheduled_at: scheduledDate }); }
    async draft() { return this.update({ status: 'draft', scheduled_at: null }); }

    async delete() {
        if (this.id_quote === null) throw new Error('No se puede eliminar una frase sin ID');
        const db = new Database();
        const query = 'DELETE FROM frase WHERE id_quote = ?';
        const result = await db.query(query, [this.id_quote]);
        return result.affectedRows > 0;
    }

    static async count(filters = {}) {
        const db = new Database();
        let whereConditions = [];
        let params = [];
        if (filters.status) { whereConditions.push('status = ?'); params.push(filters.status); }
        if (filters.categoria_id) { whereConditions.push('categoria_id = ?'); params.push(filters.categoria_id); }
        if (filters.creado_por) { whereConditions.push('creado_por = ?'); params.push(filters.creado_por); }
        if (filters.search) { whereConditions.push('(texto LIKE ? OR autor LIKE ?)'); const s = `%${filters.search}%`; params.push(s, s); }
        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
        const query = `SELECT COUNT(*) as total FROM frase ${whereClause}`;
        const results = await db.query(query, params);
        return results[0].total;
    }

    static async getUserStats(userId) {
        const db = new Database();
        const query = `
            SELECT 
                COUNT(*) as total_frases,
                COUNT(CASE WHEN status = 'published' THEN 1 END) as frases_publicadas,
                COUNT(CASE WHEN status = 'draft' THEN 1 END) as frases_borrador,
                COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as frases_programadas
            FROM frase 
            WHERE creado_por = ?
        `;
        const results = await db.query(query, [userId]);
        return results[0];
    }

    static async getGlobalStats() {
        const db = new Database();
        const query = `
            SELECT 
                COUNT(*) as total_frases,
                COUNT(CASE WHEN status = 'published' THEN 1 END) as frases_publicadas,
                COUNT(CASE WHEN status = 'draft' THEN 1 END) as frases_borrador,
                COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as frases_programadas,
                COUNT(DISTINCT creado_por) as usuarios_activos,
                COUNT(DISTINCT categoria_id) as categorias_usadas
            FROM frase
        `;
        const results = await db.query(query);
        return results[0];
    }

    toJSON() {
        return { id_quote: this.id_quote, texto: this.texto, autor: this.autor, fecha_creacion: this.fecha_creacion, scheduled_at: this.scheduled_at, status: this.status, creado_por: this.creado_por, categoria_id: this.categoria_id, creado_por_nombre: this.creado_por_nombre, categoria_nombre: this.categoria_nombre };
    }
}

module.exports = Frase;

