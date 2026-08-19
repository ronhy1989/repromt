import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  // Validar datos de usuario
  static validateUserData(userData) {
    const errors = [];
    
    if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
      errors.push('Email válido es requerido');
    }
    
    if (!userData.nombre || userData.nombre.length < 2) {
      errors.push('Nombre debe tener al menos 2 caracteres');
    }
    
    if (!userData.password || userData.password.length < 6) {
      errors.push('Contraseña debe tener al menos 6 caracteres');
    }
    
    return errors;
  }

  // Crear nuevo usuario con validaciones
  static async create(userData) {
    const validationErrors = this.validateUserData(userData);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }

    const {
      email,
      nombre,
      password,
      fecha_nacimiento,
      genero,
      proposito_vida,
      valores_principales
    } = userData;

    // Verificar si el usuario ya existe
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('El usuario ya está registrado');
    }

    // Hash de la contraseña con salt rounds
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Insertar usuario
      const [userResult] = await connection.execute(
        `INSERT INTO usuarios 
         (email, nombre, password_hash, fecha_nacimiento, genero, proposito_vida, valores_principales) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [email, nombre, passwordHash, fecha_nacimiento, genero, proposito_vida, 
         JSON.stringify(valores_principales || ['crecimiento', 'bienestar', 'aprendizaje'])]
      );

      const userId = userResult.insertId;

      // Crear registro en cerebros_digitales
      await connection.execute(
        `INSERT INTO cerebros_digitales 
         (usuario_id, estado_mental, habilidades_desarrolladas, barreras_mentales) 
         VALUES (?, ?, ?, ?)`,
        [userId, '{}', '{}', '{}']
      );

      // Crear registro en motores_crecimiento
      await connection.execute(
        `INSERT INTO motores_crecimiento 
         (usuario_id, nivel_desarrollo_actual, areas_fortaleza, areas_crecimiento) 
         VALUES (?, ?, ?, ?)`,
        [userId, 'semilla', '[]', '[]']
      );

      // Crear registro en configuraciones_sistema
      await connection.execute(
        `INSERT INTO configuraciones_sistema 
         (usuario_id, tema_interfaz, idioma, privacidad_nivel) 
         VALUES (?, ?, ?, ?)`,
        [userId, 'oscuro', 'es', 'balanceado']
      );

      await connection.commit();
      return userId;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Buscar usuario por email (seguro - sin password)
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT id, email, nombre, password_hash, fecha_nacimiento, genero, 
              bio, proposito_vida, valores_principales, nivel_autoconocimiento,
              estilo_aprendizaje, fecha_registro, estado
       FROM usuarios WHERE email = ? AND estado = 'activo'`,
      [email]
    );
    return rows[0];
  }

  // Buscar usuario por ID (seguro)
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, email, nombre, fecha_nacimiento, genero, bio, 
              proposito_vida, valores_principales, nivel_autoconocimiento,
              estilo_aprendizaje, fecha_registro, ultima_conexion, estado
       FROM usuarios WHERE id = ? AND estado = 'activo'`,
      [id]
    );
    return rows[0];
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Actualizar última conexión
  static async updateLastConnection(userId) {
    await pool.execute(
      'UPDATE usuarios SET ultima_conexion = NOW() WHERE id = ?',
      [userId]
    );
  }

  // Obtener perfil completo con datos cognitivos
  static async getCompleteProfile(userId) {
    const [userRows] = await pool.execute(
      `SELECT id, email, nombre, fecha_nacimiento, genero, bio, 
              proposito_vida, valores_principales, nivel_autoconocimiento,
              estilo_aprendizaje, fecha_registro, ultima_conexion
       FROM usuarios WHERE id = ?`,
      [userId]
    );

    const [brainRows] = await pool.execute(
      'SELECT estado_mental, habilidades_desarrolladas FROM cerebros_digitales WHERE usuario_id = ?',
      [userId]
    );

    const [growthRows] = await pool.execute(
      'SELECT nivel_desarrollo_actual, areas_fortaleza FROM motores_crecimiento WHERE usuario_id = ?',
      [userId]
    );

    return {
      usuario: userRows[0],
      cerebro_digital: brainRows[0] || {},
      motor_crecimiento: growthRows[0] || {}
    };
  }
}

export default User;