const Frase = require('../models/Frase');
const Categoria = require('../models/Categoria');

exports.list = async (req, res, next) => {
    try {
        const filters = {};
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        if (req.query.status) filters.status = req.query.status;
        if (req.query.categoria_id) filters.categoria_id = parseInt(req.query.categoria_id);
        if (req.query.creado_por) filters.creado_por = parseInt(req.query.creado_por);
        if (req.query.search) filters.search = req.query.search;
        const frases = await Frase.findAll(filters, limit, offset);
        const total = await Frase.count(filters);
        res.status(200).json({ data: frases.map(f => f.toJSON()), total, limit, offset, filters });
    } catch (error) { next(error); }
};

exports.listPublished = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const frases = await Frase.findPublished(limit, offset);
        const total = await Frase.count({ status: 'published' });
        res.status(200).json({ data: frases.map(f => f.toJSON()), total, limit, offset });
    } catch (error) { next(error); }
};

exports.random = async (req, res, next) => {
    try {
        const count = parseInt(req.query.count) || 1;
        const categoria_id = req.query.categoria_id ? parseInt(req.query.categoria_id) : null;
        const frases = await Frase.findRandom(count, categoria_id);
        res.status(200).json({ data: frases.map(f => f.toJSON()), count: frases.length });
    } catch (error) { next(error); }
};

exports.globalStats = async (req, res, next) => {
    try {
        const stats = await Frase.getGlobalStats();
        res.status(200).json({ estadisticas: stats });
    } catch (error) { next(error); }
};

exports.userStats = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId) || userId <= 0) return res.status(400).json({ error: 'ID de usuario inválido' });
        const stats = await Frase.getUserStats(userId);
        res.status(200).json({ usuario_id: userId, estadisticas: stats });
    } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'ID de frase inválido' });
        const frase = await Frase.findById(id);
        if (!frase) return res.status(404).json({ error: 'Frase no encontrada' });
        res.status(200).json({ data: frase.toJSON() });
    } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
    try {
        const { texto, autor, scheduled_at, status, categoria_id } = req.body;
        const userId = req.userId;
        if (!texto || !categoria_id) return res.status(400).json({ error: 'Texto y categoría son requeridos' });
        const categoria = await Categoria.findById(categoria_id);
        if (!categoria) return res.status(404).json({ error: 'La categoría especificada no existe' });
        const nueva = new Frase({
            texto,
            autor: autor || '',
            scheduled_at,
            status: status || 'draft',
            creado_por: userId,
            categoria_id
        });
        await nueva.create();
        res.status(201).json({ mensaje: 'Frase creada exitosamente', data: nueva.toJSON() });
    } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'ID de frase inválido' });
        const frase = await Frase.findById(id);
        if (!frase) return res.status(404).json({ error: 'Frase no encontrada' });
        const { texto, autor, scheduled_at, status, categoria_id } = req.body;
        if (categoria_id) {
            const categoria = await Categoria.findById(categoria_id);
            if (!categoria) return res.status(404).json({ error: 'La categoría especificada no existe' });
        }
        await frase.update({
            texto: texto || frase.texto,
            autor: autor !== undefined ? autor : frase.autor,
            scheduled_at: scheduled_at !== undefined ? scheduled_at : frase.scheduled_at,
            status: status || frase.status,
            categoria_id: categoria_id || frase.categoria_id
        });
        res.status(200).json({ mensaje: 'Frase actualizada exitosamente', data: frase.toJSON() });
    } catch (error) { next(error); }
};

exports.partialUpdate = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'ID de frase inválido' });
        const frase = await Frase.findById(id);
        if (!frase) return res.status(404).json({ error: 'Frase no encontrada' });
        const { texto, autor, scheduled_at, status, categoria_id } = req.body;
        if (categoria_id) {
            const categoria = await Categoria.findById(categoria_id);
            if (!categoria) return res.status(404).json({ error: 'La categoría especificada no existe' });
        }
        await frase.update({ texto, autor, scheduled_at, status, categoria_id });
        res.status(200).json({ mensaje: 'Frase actualizada exitosamente', data: frase.toJSON() });
    } catch (error) { next(error); }
};

exports.publish = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'ID de frase inválido' });
        const frase = await Frase.findById(id);
        if (!frase) return res.status(404).json({ error: 'Frase no encontrada' });
        await frase.publish();
        res.status(200).json({ mensaje: 'Frase publicada exitosamente', data: frase.toJSON() });
    } catch (error) { next(error); }
};

exports.schedule = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'ID de frase inválido' });
        const frase = await Frase.findById(id);
        if (!frase) return res.status(404).json({ error: 'Frase no encontrada' });
        const { scheduled_at } = req.body;
        if (!scheduled_at) return res.status(400).json({ error: 'Fecha de programación requerida' });
        await frase.schedule(scheduled_at);
        res.status(200).json({ mensaje: 'Frase programada exitosamente', data: frase.toJSON() });
    } catch (error) { next(error); }
};

exports.draft = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'ID de frase inválido' });
        const frase = await Frase.findById(id);
        if (!frase) return res.status(404).json({ error: 'Frase no encontrada' });
        await frase.draft();
        res.status(200).json({ mensaje: 'Frase cambiada a borrador exitosamente', data: frase.toJSON() });
    } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'ID de frase inválido' });
        const frase = await Frase.findById(id);
        if (!frase) return res.status(404).json({ error: 'Frase no encontrada' });
        await frase.delete();
        res.status(200).json({ mensaje: 'Frase eliminada exitosamente' });
    } catch (error) { next(error); }
};


