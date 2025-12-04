const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const phraseController = require('../controllers/phraseController');

// Obtener todas las frases
router.get('/', phraseController.list);

// Obtener frases publicadas
router.get('/publicadas', phraseController.listPublished);

// Obtener frases aleatorias
router.get('/aleatorias', phraseController.random);

// Obtener estadísticas globales de frases
router.get('/estadisticas', authenticateToken, phraseController.globalStats);

// Obtener estadísticas de frases por usuario
router.get('/estadisticas/usuario/:id', authenticateToken, phraseController.userStats);

// Obtener una frase por ID
router.get('/:id', phraseController.getById);

// Crear una nueva frase (Protegida)
router.post('/', authenticateToken, phraseController.create);

// Actualizar una frase (Protegida)
router.put('/:id', authenticateToken, phraseController.update);

// Actualizar parcialmente una frase (Protegida)
router.patch('/:id', authenticateToken, phraseController.partialUpdate);

// Publicar una frase (Protegida)
router.patch('/:id/publicar', authenticateToken, phraseController.publish);

// Programar una frase (Protegida)
router.patch('/:id/programar', authenticateToken, phraseController.schedule);

// Cambiar una frase a borrador (Protegida)
router.patch('/:id/borrador', authenticateToken, phraseController.draft);

// Eliminar una frase (Protegida)
router.delete('/:id', authenticateToken, phraseController.remove);

// Verificar estado del scheduler de publicación automática (Protegida, solo admin)
router.get('/scheduler/estado', authenticateToken, phraseController.checkScheduler);

module.exports = router;

