const Usuario = require('../models/Usuario');

exports.list = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const usuarios = await Usuario.findAll(limit, offset);
        const total = await Usuario.count();
        res.status(200).json({ data: usuarios.map(u => u.toJSON()), total, limit, offset });
    } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'ID de usuario inválido' });
        const usuario = await Usuario.findById(id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.status(200).json({ data: usuario.toJSON() });
    } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
    try {
        const { nombre, correo_electronico, password, rol } = req.body;
        if (!nombre || !correo_electronico || !password) {
            return res.status(400).json({ error: 'Nombre, correo electrónico y contraseña son requeridos' });
        }
        const existente = await Usuario.findByEmail(correo_electronico);
        if (existente) return res.status(409).json({ error: 'El correo electrónico ya está registrado' });
        const nuevo = new Usuario({ nombre, correo_electronico, rol: rol || 'user' });
        await nuevo.create(password);
        res.status(201).json({ mensaje: 'Usuario creado exitosamente', data: nuevo.toJSON() });
    } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'ID de usuario inválido' });
        const usuario = await Usuario.findById(id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        const { nombre, correo_electronico, rol } = req.body;
        if (correo_electronico && correo_electronico !== usuario.correo_electronico) {
            const existente = await Usuario.findByEmail(correo_electronico);
            if (existente) return res.status(409).json({ error: 'El correo electrónico ya está registrado' });
        }
        await usuario.update({ nombre, correo_electronico, rol });
        res.status(200).json({ mensaje: 'Usuario actualizado exitosamente', data: usuario.toJSON() });
    } catch (error) { next(error); }
};

exports.partialUpdate = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'ID de usuario inválido' });
        const usuario = await Usuario.findById(id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        const { nombre, correo_electronico, rol, password } = req.body;
        if (password) await usuario.updatePassword(password);
        if (nombre || correo_electronico || rol) {
            if (correo_electronico && correo_electronico !== usuario.correo_electronico) {
                const existente = await Usuario.findByEmail(correo_electronico);
                if (existente) return res.status(409).json({ error: 'El correo electrónico ya está registrado' });
            }
            await usuario.update({
                nombre: nombre || usuario.nombre,
                correo_electronico: correo_electronico || usuario.correo_electronico,
                rol: rol || usuario.rol
            });
        }
        res.status(200).json({ mensaje: 'Usuario actualizado exitosamente', data: usuario.toJSON() });
    } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'ID de usuario inválido' });
        const usuario = await Usuario.findById(id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        await usuario.delete();
        res.status(200).json({ mensaje: 'Usuario eliminado exitosamente' });
    } catch (error) { next(error); }
};


