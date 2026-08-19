import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware de autenticación JWT profesional
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido en formato Bearer'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar y decodificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario en base de datos
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      });
    }

    // Agregar usuario al request
    req.user = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      nivel_autoconocimiento: user.nivel_autoconocimiento
    };

    next();
  } catch (error) {
    console.error('🔐 Error de autenticación:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Token JWT inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Token JWT expirado'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno de autenticación'
    });
  }
};

// Generar token JWT seguro
export const generateToken = (userId) => {
  return jwt.sign(
    { 
      userId,
      timestamp: Date.now() // Para evitar replay attacks
    }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: process.env.JWT_EXPIRES_IN,
      issuer: 'repromt-backend',
      audience: 'repromt-app'
    }
  );
};

// Middleware para logs de auditoría
export const auditAuthentication = (req, res, next) => {
  console.log(`🔐 Auditoría: ${req.method} ${req.path} - User: ${req.user?.id || 'No autenticado'}`);
  next();
};