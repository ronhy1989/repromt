import pool from '../config/database.js';

class Habit {
  // Crear nuevo hábito
  static async create(habitData) {
    const {
      usuario_id,
      nombre,
      proposito,
      categoria = 'mental',
      horario_optimo,
      contexto_optimo,
      dificultad_actual = 0.5
    } = habitData;

    const [result] = await pool.execute(
      `INSERT INTO habitos_neuronales 
       (usuario_id, nombre, proposito, categoria, horario_optimo, contexto_optimo, dificultad_actual) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [usuario_id, nombre, proposito, categoria, horario_optimo, 
       JSON.stringify(contexto_optimo || {}), dificultad_actual]
    );

    return result.insertId;
  }

  // Obtener hábitos por usuario
  static async findByUser(usuario_id, estado = 'activo') {
    const [rows] = await pool.execute(
      `SELECT id, nombre, proposito, categoria, horario_optimo, 
              contexto_optimo, dificultad_actual, tasa_exito, racha_actual,
              racha_maxima, fecha_creacion, estado
       FROM habitos_neuronales 
       WHERE usuario_id = ? AND estado = ?
       ORDER BY fecha_creacion DESC`,
      [usuario_id, estado]
    );
    return rows;
  }

  // Obtener hábito por ID
  static async findById(id, usuario_id = null) {
    let query = `SELECT * FROM habitos_neuronales WHERE id = ?`;
    const params = [id];

    if (usuario_id) {
      query += ` AND usuario_id = ?`;
      params.push(usuario_id);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0];
  }

  // Actualizar hábito
  static async update(id, usuario_id, updateData) {
    const allowedFields = ['nombre', 'proposito', 'categoria', 'horario_optimo', 'contexto_optimo', 'dificultad_actual', 'estado'];
    const updates = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(key === 'contexto_optimo' ? JSON.stringify(updateData[key]) : updateData[key]);
      }
    });

    if (updates.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    values.push(id, usuario_id);

    const [result] = await pool.execute(
      `UPDATE habitos_neuronales 
       SET ${updates.join(', ')} 
       WHERE id = ? AND usuario_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Registrar seguimiento de hábito
  static async trackHabit(trackingData) {
    const {
      habito_id,
      usuario_id,
      fecha,
      completado = false,
      calidad_ejecucion = 5,
      dificultad_percibida,
      notas
    } = trackingData;

    const [result] = await pool.execute(
      `INSERT INTO seguimiento_habitos 
       (habito_id, usuario_id, fecha, completado, calidad_ejecucion, dificultad_percibida, notas) 
       VALUES (?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       completado = VALUES(completado), 
       calidad_ejecucion = VALUES(calidad_ejecucion),
       dificultad_percibida = VALUES(dificultad_percibida),
       notas = VALUES(notas)`,
      [habito_id, usuario_id, fecha, completado, calidad_ejecucion, dificultad_percibida, notas]
    );

    return result.insertId;
  }

  // Obtener seguimiento de hábitos por usuario y fecha
  static async getTrackingByUserAndDate(usuario_id, fecha) {
    const [rows] = await pool.execute(
      `SELECT sh.*, hn.nombre as habito_nombre, hn.categoria
       FROM seguimiento_habitos sh
       JOIN habitos_neuronales hn ON sh.habito_id = hn.id
       WHERE sh.usuario_id = ? AND sh.fecha = ?
       ORDER BY hn.categoria, hn.nombre`,
      [usuario_id, fecha]
    );
    return rows;
  }

  // Obtener estadísticas de hábitos
  static async getHabitStats(usuario_id, days = 30) {
    const [rows] = await pool.execute(
      `SELECT 
         hn.id,
         hn.nombre,
         hn.categoria,
         hn.tasa_exito,
         hn.racha_actual,
         hn.racha_maxima,
         COUNT(sh.id) as total_seguimientos,
         SUM(CASE WHEN sh.completado = 1 THEN 1 ELSE 0 END) as completados,
         AVG(sh.calidad_ejecucion) as calidad_promedio
       FROM habitos_neuronales hn
       LEFT JOIN seguimiento_habitos sh ON hn.id = sh.habito_id 
         AND sh.fecha >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       WHERE hn.usuario_id = ? AND hn.estado = 'activo'
       GROUP BY hn.id, hn.nombre, hn.categoria, hn.tasa_exito, hn.racha_actual, hn.racha_maxima
       ORDER BY hn.categoria, hn.racha_actual DESC`,
      [days, usuario_id]
    );
    return rows;
  }
}

export default Habit;