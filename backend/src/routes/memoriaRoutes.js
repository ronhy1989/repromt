import express from 'express';
import MemoriaController from '../controllers/MemoriaController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/crear', authenticateToken, MemoriaController.crearMemoria);
router.post('/preguntar', authenticateToken, MemoriaController.preguntarAMem);
router.post('/asignar-coleccion', authenticateToken, MemoriaController.asignarAColeccion);
router.post('/coleccion', authenticateToken, MemoriaController.crearColeccion);
router.get('/listar', authenticateToken, MemoriaController.listarMemorias);
router.get('/heads-up', authenticateToken, MemoriaController.headsUp);
router.get('/colecciones', authenticateToken, MemoriaController.getColecciones);
router.get('/patrones', authenticateToken, MemoriaController.getPatronesEmocionales);
router.get('/contexto/:memoriaId', authenticateToken, MemoriaController.getContextoRelacionado);
router.get('/estadisticas', authenticateToken, MemoriaController.getEstadisticas);
router.get('/:id', authenticateToken, MemoriaController.getMemoriaById);
router.delete('/:id', authenticateToken, MemoriaController.eliminarMemoria);

export default router;
