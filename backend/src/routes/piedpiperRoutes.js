import express from 'express';
import { 
    getRecommendations, 
    runAnalysis, 
    getDashboard, 
    getStats,
    markAsViewed, 
    applyRecommendation 
} from '../controllers/piedpiperController.js';
import { authenticateToken } from '../middleware/auth.js';

// =====================================================
// NUEVAS IMPORTACIONES PARA ENTRENAMIENTO
// =====================================================
import PiedPiperTrainer from '../core/training/PiedPiperTrainer.js';
import db from '../config/database.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// =====================================================
// RUTAS EXISTENTES (tus rutas originales)
// =====================================================
router.get('/recommendations', getRecommendations);
router.post('/analyze', runAnalysis);
router.get('/dashboard', getDashboard);
router.get('/stats', getStats);
router.put('/:recommendationId/view', markAsViewed);
router.post('/:recommendationId/apply', applyRecommendation);

// =====================================================
// NUEVAS RUTAS DE ENTRENAMIENTO (agregadas sin modificar las tuyas)
// =====================================================

/**
 * @swagger
 * /piedpiper/train:
 *   post:
 *     summary: Entrenar Pied Piper con tus datos
 *     tags: [Pied Piper Training]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deep:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Entrenamiento completado
 */
router.post('/train', async (req, res) => {
    try {
        const { deep = true } = req.body;
        
        console.log(`\n🎯 INICIANDO ENTRENAMIENTO MANUAL PARA USUARIO ${req.user.id}`);
        
        const result = await PiedPiperTrainer.trainUser(req.user.id, { deep });
        
        if (result.success) {
            const [recomendaciones] = await db.query(
                `SELECT * FROM recomendaciones_inteligentes 
                 WHERE usuario_id = ? 
                 AND fecha_generacion > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
                 ORDER BY prioridad DESC, confianza_prediccion DESC`,
                [req.user.id]
            );

            res.json({
                success: true,
                message: '🧠 Pied Piper entrenado exitosamente',
                data: {
                    entrenamiento: result.data,
                    nuevas_recomendaciones: recomendaciones,
                    total_recomendaciones: recomendaciones.length,
                    timestamp: new Date()
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error en entrenamiento',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Error en entrenamiento:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @swagger
 * /piedpiper/train/status:
 *   get:
 *     summary: Ver estado del último entrenamiento
 *     tags: [Pied Piper Training]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado del entrenamiento
 */
router.get('/train/status', async (req, res) => {
    try {
        const [logs] = await db.query(
            `SELECT * FROM log_entrenamiento 
             WHERE usuario_id = ? 
             ORDER BY fecha_inicio DESC 
             LIMIT 5`,
            [req.user.id]
        );

        const [metricas] = await db.query(
            `SELECT 
                u.ultimo_entrenamiento_ia,
                u.version_modelo_actual,
                u.metricas_ia,
                mc.pesos_modelo,
                cd.patrones_detectados,
                cd.precision_actual
             FROM usuarios u
             LEFT JOIN motores_crecimiento mc ON u.id = mc.usuario_id
             LEFT JOIN cerebros_digitales cd ON u.id = cd.usuario_id
             WHERE u.id = ?`,
            [req.user.id]
        );

        const [recomendaciones] = await db.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN prioridad = 'urgente' THEN 1 ELSE 0 END) as urgentes,
                SUM(CASE WHEN fecha_vista IS NULL THEN 1 ELSE 0 END) as pendientes,
                AVG(confianza_prediccion) as confianza_promedio
             FROM recomendaciones_inteligentes
             WHERE usuario_id = ? 
             AND fecha_generacion > DATE_SUB(NOW(), INTERVAL 7 DAY)`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: {
                ultimo_entrenamiento: metricas[0]?.ultimo_entrenamiento_ia,
                version_modelo: metricas[0]?.version_modelo_actual || 1,
                precision_actual: metricas[0]?.precision_actual || 0,
                metricas_usuario: metricas[0]?.metricas_ia ? JSON.parse(metricas[0].metricas_ia) : null,
                pesos_modelo: metricas[0]?.pesos_modelo ? JSON.parse(metricas[0].pesos_modelo) : null,
                patrones_detectados: metricas[0]?.patrones_detectados ? 
                    JSON.parse(metricas[0].patrones_detectados) : { historial: [] },
                recomendaciones: recomendaciones[0] || { total: 0, urgentes: 0, pendientes: 0 },
                historial_entrenamiento: logs
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @swagger
 * /piedpiper/train/history:
 *   get:
 *     summary: Ver historial completo de entrenamientos
 *     tags: [Pied Piper Training]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Historial de entrenamientos
 */
router.get('/train/history', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        
        const [historial] = await db.query(
            `SELECT 
                id,
                tipo_entrenamiento,
                datos_procesados,
                nuevos_patrones,
                nuevas_recomendaciones,
                tiempo_ejecucion_ms,
                estado,
                errores,
                fecha_inicio,
                fecha_fin,
                TIMESTAMPDIFF(SECOND, fecha_inicio, fecha_fin) as duracion_segundos
             FROM log_entrenamiento 
             WHERE usuario_id = ? 
             ORDER BY fecha_inicio DESC 
             LIMIT ?`,
            [req.user.id, limit]
        );

        const stats = {
            total: historial.length,
            exitosos: historial.filter(h => h.estado === 'completado').length,
            fallidos: historial.filter(h => h.estado === 'error').length,
            tiempo_promedio: historial.reduce((s, h) => s + (h.duracion_segundos || 0), 0) / historial.length,
            total_patrones: historial.reduce((s, h) => s + (h.nuevos_patrones || 0), 0),
            total_recomendaciones: historial.reduce((s, h) => s + (h.nuevas_recomendaciones || 0), 0)
        };

        res.json({
            success: true,
            data: {
                historial,
                estadisticas: stats
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @swagger
 * /piedpiper/train/patterns:
 *   get:
 *     summary: Ver patrones detectados
 *     tags: [Pied Piper Training]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patrones detectados
 */
router.get('/train/patterns', async (req, res) => {
    try {
        const [cerebro] = await db.query(
            'SELECT patrones_detectados FROM cerebros_digitales WHERE usuario_id = ?',
            [req.user.id]
        );

        const patrones = cerebro[0]?.patrones_detectados 
            ? JSON.parse(cerebro[0].patrones_detectados) 
            : { historial: [], ultimos_insights: [] };

        const [insights] = await db.query(
            `SELECT id, contenido, prioridad, fecha_generacion
             FROM recomendaciones_inteligentes
             WHERE usuario_id = ? 
             AND tipo_recomendacion IN ('insight_emocional', 'patron_cruzado')
             ORDER BY fecha_generacion DESC
             LIMIT 10`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: {
                patrones_actuales: patrones.ultimos_insights || [],
                historial_patrones: patrones.historial || [],
                insights_recientes: insights,
                total_patrones: patrones.historial?.length || 0
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @swagger
 * /piedpiper/train/weights:
 *   get:
 *     summary: Ver pesos del modelo actual
 *     tags: [Pied Piper Training]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pesos del modelo
 */
router.get('/train/weights', async (req, res) => {
    try {
        const [pesos] = await db.query(
            `SELECT variable, peso_actual, rango_min, rango_max, ultimo_ajuste
             FROM pesos_modelo
             WHERE usuario_id = ?
             ORDER BY peso_actual DESC`,
            [req.user.id]
        );

        const [motor] = await db.query(
            'SELECT pesos_modelo FROM motores_crecimiento WHERE usuario_id = ?',
            [req.user.id]
        );

        res.json({
            success: true,
            data: {
                pesos_individuales: pesos,
                pesos_motor: motor[0]?.pesos_modelo ? JSON.parse(motor[0].pesos_modelo) : null
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @swagger
 * /piedpiper/train/adjust-weights:
 *   post:
 *     summary: Ajustar pesos del modelo manualmente
 *     tags: [Pied Piper Training]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               variable:
 *                 type: string
 *               nuevo_peso:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *     responses:
 *       200:
 *         description: Pesos actualizados
 */
router.post('/train/adjust-weights', async (req, res) => {
    try {
        const { variable, nuevo_peso } = req.body;

        if (!variable || nuevo_peso === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Variable y nuevo_peso son requeridos'
            });
        }

        if (nuevo_peso < 0 || nuevo_peso > 1) {
            return res.status(400).json({
                success: false,
                message: 'El peso debe estar entre 0 y 1'
            });
        }

        const [pesoActual] = await db.query(
            'SELECT peso_actual FROM pesos_modelo WHERE usuario_id = ? AND variable = ?',
            [req.user.id, variable]
        );

        if (pesoActual.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Variable no encontrada'
            });
        }

        await db.query(
            `UPDATE pesos_modelo 
             SET peso_anterior = peso_actual,
                 peso_actual = ?,
                 ultimo_ajuste = NOW(),
                 veces_ajustado = veces_ajustado + 1
             WHERE usuario_id = ? AND variable = ?`,
            [nuevo_peso, req.user.id, variable]
        );

        res.json({
            success: true,
            message: 'Peso actualizado correctamente',
            data: {
                variable,
                peso_anterior: pesoActual[0].peso_actual,
                peso_nuevo: nuevo_peso,
                fecha_ajuste: new Date()
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;