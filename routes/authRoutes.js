const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Usuario = require('../models/Usuario');

/**
 * @route   POST /api/v1/auth/login
 * @desc    Autentica un usuario y genera un JWT
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
    try {
        const { correo_electronico, password } = req.body;

        // Validación de datos de entrada
        if (!correo_electronico || !password) {
            return res.status(400).json({
                error: 'Correo electrónico y contraseña son requeridos'
            });
        }

        // Buscar y autenticar usuario
        const usuario = await Usuario.authenticate(correo_electronico, password);

        if (!usuario) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Generar JWT
        const secretKey = process.env.SECRET_KEY;
        const token = jwt.sign(
            {
                userId: usuario.id_user,
                email: usuario.correo_electronico,
                rol: usuario.rol
            },
            secretKey,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            mensaje: 'Autenticación exitosa',
            token: token,
            usuario: usuario.toJSON()
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registra un nuevo usuario
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
    try {
        const { nombre, correo_electronico, password, rol } = req.body;

        // Validación de datos de entrada
        if (!nombre || !correo_electronico || !password) {
            return res.status(400).json({
                error: 'Nombre, correo electrónico y contraseña son requeridos'
            });
        }

        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findByEmail(correo_electronico);
        if (usuarioExistente) {
            return res.status(409).json({
                error: 'El correo electrónico ya está registrado'
            });
        }

        // Crear nuevo usuario
        const nuevoUsuario = new Usuario({
            nombre,
            correo_electronico,
            rol: rol || 'user'
        });

        await nuevoUsuario.create(password);

        // Generar JWT
        const secretKey = process.env.SECRET_KEY;
        const token = jwt.sign(
            {
                userId: nuevoUsuario.id_user,
                email: nuevoUsuario.correo_electronico,
                rol: nuevoUsuario.rol
            },
            secretKey,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            token: token,
            usuario: nuevoUsuario.toJSON()
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

