import pool from '../config/database.js';

// Obtener recomendaciones del usuario
export const getRecommendations = async (req, res) => {
    try {
        console.log(`📊 Obteniendo recomendaciones para usuario ID: ${req.user.id}`);
        
        const [rows] = await pool.query(
            `SELECT * FROM recomendaciones_inteligentes 
             WHERE usuario_id = ? 
             AND (fecha_aplicada IS NULL OR fecha_aplicada > DATE_SUB(NOW(), INTERVAL 7 DAY))
             ORDER BY 
                FIELD(prioridad, 'urgente', 'alta', 'media', 'baja'),
                confianza_prediccion DESC
             LIMIT 20`,
            [req.user.id]
        );
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('❌ Error en getRecommendations:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Ejecutar análisis completo Pied Piper
export const runAnalysis = async (req, res) => {
    try {
        console.log(`🚀 Ejecutando análisis Pied Piper para usuario ID: ${req.user.id}`);
        
        await pool.query('CALL pied_piper_full_analysis(?, ?)', [req.user.id, true]);
        
        const [recommendations] = await pool.query(
            'SELECT * FROM recomendaciones_inteligentes WHERE usuario_id = ? ORDER BY fecha_generacion DESC LIMIT 10',
            [req.user.id]
        );
        
        res.json({
            success: true,
            message: '✅ Análisis Pied Piper completado',
            recommendations_generated: recommendations.length,
            data: recommendations
        });
    } catch (error) {
        console.error('❌ Error en runAnalysis:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Obtener dashboard de recomendaciones
export const getDashboard = async (req, res) => {
    try {
        console.log(`📈 Obteniendo dashboard para usuario: ${req.user.nombre}`);
        
        const [userRows] = await pool.query(
            'SELECT nombre FROM usuarios WHERE id = ?',
            [req.user.id]
        );
        
        if (userRows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }
        
        const nombreUsuario = userRows[0].nombre;
        
        const [dashboardRows] = await pool.query(
            'SELECT * FROM vista_dashboard_recomendaciones WHERE usuario = ?',
            [nombreUsuario]
        );
        
        const [statsRows] = await pool.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN prioridad = 'urgente' THEN 1 ELSE 0 END) as urgentes,
                SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                AVG(confianza_prediccion) as confianza_promedio
             FROM vista_dashboard_recomendaciones 
             WHERE usuario = ?`,
            [nombreUsuario]
        );
        
        res.json({
            success: true,
            stats: statsRows[0],
            data: dashboardRows
        });
    } catch (error) {
        console.error('❌ Error en getDashboard:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Marcar recomendación como vista
export const markAsViewed = async (req, res) => {
    try {
        const { recommendationId } = req.params;
        
        await pool.query(
            'UPDATE recomendaciones_inteligentes SET fecha_vista = NOW() WHERE id = ? AND usuario_id = ?',
            [recommendationId, req.user.id]
        );
        
        res.json({
            success: true,
            message: '✅ Recomendación marcada como vista'
        });
    } catch (error) {
        console.error('❌ Error en markAsViewed:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Aplicar recomendación (feedback)
export const applyRecommendation = async (req, res) => {
    try {
        const { recommendationId } = req.params;
        const { utilidad, efectividad, feedback } = req.body;
        
        await pool.query(
            `UPDATE recomendaciones_inteligentes 
             SET 
                fecha_aplicada = NOW(),
                utilidad_percibida = ?,
                efectividad_medida = ?,
                feedback_usuario = ?
             WHERE id = ? AND usuario_id = ?`,
            [utilidad, efectividad, feedback, recommendationId, req.user.id]
        );
        
        res.json({
            success: true,
            message: '✅ Feedback registrado correctamente'
        });
    } catch (error) {
        console.error('❌ Error en applyRecommendation:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Obtener estadísticas de efectividad
export const getStats = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                tipo_recomendacion,
                COUNT(*) as cantidad,
                AVG(confianza_prediccion) as confianza_promedio,
                AVG(utilidad_percibida) as utilidad_promedio,
                AVG(efectividad_medida) as efectividad_promedio
             FROM recomendaciones_inteligentes
             WHERE usuario_id = ?
             GROUP BY tipo_recomendacion
             ORDER BY cantidad DESC`,
            [req.user.id]
        );
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('❌ Error en getStats:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};