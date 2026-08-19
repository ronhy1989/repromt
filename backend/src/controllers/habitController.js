import Habit from '../models/Habit.js';

export const createHabit = async (req, res) => {
  try {
    const { nombre, proposito, categoria, horario_optimo, contexto_optimo, dificultad_actual } = req.body;
    const usuario_id = req.user.id;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del hábito es requerido'
      });
    }

    const habitId = await Habit.create({
      usuario_id,
      nombre,
      proposito,
      categoria,
      horario_optimo,
      contexto_optimo,
      dificultad_actual
    });

    res.status(201).json({
      success: true,
      message: 'Hábito creado exitosamente',
      data: {
        habit_id: habitId,
        habit: {
          nombre,
          categoria,
          horario_optimo
        }
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error creando hábito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getUserHabits = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { estado } = req.query;

    const habits = await Habit.findByUser(usuario_id, estado || 'activo');

    res.json({
      success: true,
      message: 'Hábitos obtenidos exitosamente',
      data: {
        habits,
        total: habits.length
      },
      meta: {
        timestamp: new Date().toISOString(),
        estado: estado || 'activo'
      }
    });

  } catch (error) {
    console.error('Error obteniendo hábitos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;
    const updateData = req.body;

    // Verificar que el hábito pertenece al usuario
    const existingHabit = await Habit.findById(id, usuario_id);
    if (!existingHabit) {
      return res.status(404).json({
        success: false,
        message: 'Hábito no encontrado'
      });
    }

    const updated = await Habit.update(id, usuario_id, updateData);

    if (updated) {
      res.json({
        success: true,
        message: 'Hábito actualizado exitosamente',
        data: {
          habit_id: parseInt(id)
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Error actualizando el hábito'
      });
    }

  } catch (error) {
    console.error('Error actualizando hábito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const trackHabit = async (req, res) => {
  try {
    const { habito_id, fecha, completado, calidad_ejecucion, dificultad_percibida, notas } = req.body;
    const usuario_id = req.user.id;

    if (!habito_id || !fecha) {
      return res.status(400).json({
        success: false,
        message: 'ID del hábito y fecha son requeridos'
      });
    }

    // Verificar que el hábito pertenece al usuario
    const habit = await Habit.findById(habito_id, usuario_id);
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Hábito no encontrado'
      });
    }

    const trackingId = await Habit.trackHabit({
      habito_id,
      usuario_id,
      fecha,
      completado: completado || false,
      calidad_ejecucion: calidad_ejecucion || 5,
      dificultad_percibida,
      notas
    });

    res.json({
      success: true,
      message: completado ? 'Hábito completado registrado' : 'Seguimiento registrado',
      data: {
        tracking_id: trackingId,
        habito_id,
        fecha,
        completado
      }
    });

  } catch (error) {
    console.error('Error registrando seguimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const getHabitStats = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { days = 30 } = req.query;

    const stats = await Habit.getHabitStats(usuario_id, parseInt(days));

    res.json({
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: {
        stats,
        periodo_dias: parseInt(days),
        total_habitos: stats.length
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const getDailyTracking = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { fecha = new Date().toISOString().split('T')[0] } = req.query;

    const tracking = await Habit.getTrackingByUserAndDate(usuario_id, fecha);

    res.json({
      success: true,
      message: 'Seguimiento diario obtenido',
      data: {
        fecha,
        tracking,
        total_habitos: tracking.length,
        completados: tracking.filter(t => t.completado).length
      }
    });

  } catch (error) {
    console.error('Error obteniendo seguimiento diario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};