import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { authenticateToken, auditAuthentication } from '../middleware/auth.js';

const router = express.Router();

// Aplicar auditoría a todas las rutas de auth
router.use(auditAuthentication);

// Ruta de registro
router.post('/register', register);

// Ruta de login
router.post('/login', login);

// Ruta para obtener perfil (protegida)
router.get('/profile', authenticateToken, getProfile);

export default router;