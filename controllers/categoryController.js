const Categoria = require('../models/Categoria');

exports.list = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const categorias = await Categoria.findAll(limit, offset);
        const total = await Categoria.count();
        res.status(200).json({ data: categorias.map(c => c.toJSON()), total, limit, offset });
    } catch (error) { next(error); }
};

exports.search = async (req, res, next) => {
    try {
        const searchTerm = req.query.q;
        if (!searchTerm) return res.status(400).json({ error: 'Término de búsqueda requerido' });
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const categorias = await Categoria.search(searchTerm, limit, offset);
        res.status(200).json({ data: categorias.map(c => c.toJSON()), total: categorias.length, searchTerm });
    } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'ID de categoría inválido' });
        const categoria = await Categoria.findById(id);
        if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
        const frasesCount = await categoria.getFrasesCount();
        res.status(200).json({ data: { ...categoria.toJSON(), frases_count: frasesCount } });
    } catch (error) { next(error); }
};

exports.getFrases = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'ID de categoría inválido' });
        const categoria = await Categoria.findById(id);
        if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const frases = await categoria.getFrases(limit, offset);
        res.status(200).json({ categoria: categoria.toJSON(), frases, total: frases.length, limit, offset });
    } catch (error) { next(error); }
};

exports.getStats = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'ID de categoría inválido' });
        const categoria = await Categoria.findById(id);
        if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
        const stats = await categoria.getStats();
        res.status(200).json({ categoria: categoria.toJSON(), estadisticas: stats });
    } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
    try {
        const { nombre, descripcion } = req.body;
        if (!nombre) return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
        const existente = await Categoria.findByNombre(nombre);
        if (existente) return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
        const nueva = new Categoria({ nombre, descripcion: descripcion || '' });
        await nueva.create();
        res.status(201).json({ mensaje: 'Categoría creada exitosamente', data: nueva.toJSON() });
    } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'ID de categoría inválido' });
        const categoria = await Categoria.findById(id);
        if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
        const { nombre, descripcion } = req.body;
        if (nombre && nombre !== categoria.nombre) {
            const existente = await Categoria.findByNombre(nombre);
            if (existente) return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
        }
        await categoria.update({ nombre, descripcion });
        res.status(200).json({ mensaje: 'Categoría actualizada exitosamente', data: categoria.toJSON() });
    } catch (error) { next(error); }
};

exports.partialUpdate = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'ID de categoría inválido' });
        const categoria = await Categoria.findById(id);
        if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
        const { nombre, descripcion } = req.body;
        if (nombre && nombre !== categoria.nombre) {
            const existente = await Categoria.findByNombre(nombre);
            if (existente) return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
        }
        await categoria.update({
            nombre: nombre || categoria.nombre,
            descripcion: descripcion !== undefined ? descripcion : categoria.descripcion
        });
        res.status(200).json({ mensaje: 'Categoría actualizada exitosamente', data: categoria.toJSON() });
    } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'ID de categoría inválido' });
        const categoria = await Categoria.findById(id);
        if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
        const forceDelete = req.query.force === 'true';
        await categoria.delete(forceDelete);
        res.status(200).json({ mensaje: 'Categoría eliminada exitosamente' });
    } catch (error) {
        if (error.message && error.message.includes('frases asociadas')) {
            return res.status(400).json({
                error: 'No se puede eliminar la categoría porque tiene frases asociadas',
                suggestion: 'Use ?force=true para eliminar la categoría y sus frases asociadas'
            });
        }
        next(error);
    }
};


