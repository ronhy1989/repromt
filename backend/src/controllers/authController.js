import User from '../models/User.js';
import { generateToken, auditAuthentication } from '../middleware/auth.js';

// Validación de datos de entrada
const validateRegistration = (userData) => {
  const errors = [];
  
  if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
    errors.push('Email válido es requerido');
  }
  
  if (!userData.nombre || userData.nombre.trim().length < 2) {
    errors.push('Nombre debe tener al menos 2 caracteres');
  }
  
  if (!userData.password || userData.password.length < 8) {
    errors.push('Contraseña debe tener al menos 8 caracteres');
  }
  
  return errors;
};

export const register = async (req, res) => {
  try {
    const {
      email,
      nombre,
      password,
      fecha_nacimiento,
      genero,
      proposito_vida,
      valores_principales
    } = req.body;

    // Validación de datos
    const validationErrors = validateRegistration(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: validationErrors
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El usuario ya está registrado'
      });
    }

    // Crear usuario en la base de datos
    const userId = await User.create({
      email: email.toLowerCase().trim(),
      nombre: nombre.trim(),
      password,
      fecha_nacimiento,
      genero,
      proposito_vida,
      valores_principales
    });

    // Generar token JWT
    const token = generateToken(userId);

    // Actualizar última conexión
    await User.updateLastConnection(userId);

    // Log de auditoría
    console.log(`👤 Nuevo usuario registrado: ${email} (ID: ${userId})`);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        user: {
          id: userId,
          email,
          nombre: nombre.trim()
        }
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor durante el registro',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const user = await User.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user.id);

    // Actualizar última conexión
    await User.updateLastConnection(user.id);

    // Log de auditoría
    console.log(`🔐 Login exitoso: ${email} (ID: ${user.id})`);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          nivel_autoconocimiento: user.nivel_autoconocimiento
        }
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor durante el login'
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    // El usuario ya está autenticado por el middleware
    const completeProfile = await User.getCompleteProfile(req.user.id);

    res.json({
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: completeProfile,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el perfil'
    });
  }
};