import express from 'express';
import { 
  createHabit, 
  getUserHabits, 
  updateHabit, 
  trackHabit, 
  getHabitStats, 
  getDailyTracking 
} from '../controllers/habitController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Crear nuevo hábito
router.post('/', createHabit);

// Obtener hábitos del usuario
router.get('/', getUserHabits);

// Obtener estadísticas de hábitos
router.get('/stats', getHabitStats);

// Obtener seguimiento diario
router.get('/tracking/daily', getDailyTracking);

// Actualizar hábito específico
router.put('/:id', updateHabit);

// Registrar seguimiento de hábito
router.post('/track', trackHabit);

export default router;