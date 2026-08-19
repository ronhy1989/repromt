import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

// Tablas permitidas (seguridad)
const TABLAS_PERMITIDAS = [
    'metas_salud', 'metas_emocionales', 'habitos', 'estados_animo',
    'ejercicios', 'sueno', 'libro_vida', 'conversaciones_ia',
    'badges', 'logros', 'reportes', 'mapas_mentales',
    'plugin_store', 'cuestionarios', 'biblioteca'
];

// GET /api/dynamic/:table - Obtener todos los registros
router.get('/:table', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { table } = req.params;
        const { limit = 100, offset = 0, orderBy = 'id', orderDir = 'DESC' } = req.query;
        
        if (!TABLAS_PERMITIDAS.includes(table)) {
            return res.status(403).json({ success: false, message: `Tabla '${table}' no permitida` });
        }
        
        const usuarioId = req.user.id;
        
        const [rows] = await connection.query(
            `SELECT * FROM ${table} WHERE usuario_id = ? OR usuario_id IS NULL 
             ORDER BY ${orderBy} ${orderDir} LIMIT ? OFFSET ?`,
            [usuarioId, parseInt(limit), parseInt(offset)]
        );
        
        const [countResult] = await connection.query(
            `SELECT COUNT(*) as total FROM ${table} WHERE usuario_id = ? OR usuario_id IS NULL`,
            [usuarioId]
        );
        
        res.json({
            success: true,
            data: rows,
            meta: {
                total: countResult[0].total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
        
    } catch (error) {
        console.error(`Error en dynamic GET /${req.params.table}:`, error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// GET /api/dynamic/:table/:id - Obtener un registro por ID
router.get('/:table/:id', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { table, id } = req.params;
        
        if (!TABLAS_PERMITIDAS.includes(table)) {
            return res.status(403).json({ success: false, message: `Tabla '${table}' no permitida` });
        }
        
        const [rows] = await connection.query(
            `SELECT * FROM ${table} WHERE id = ? AND (usuario_id = ? OR usuario_id IS NULL)`,
            [id, req.user.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Registro no encontrado' });
        }
        
        res.json({ success: true, data: rows[0] });
        
    } catch (error) {
        console.error(`Error en dynamic GET /${req.params.table}/${req.params.id}:`, error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// POST /api/dynamic/:table - Crear un registro
router.post('/:table', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { table } = req.params;
        const data = req.body;
        
        if (!TABLAS_PERMITIDAS.includes(table)) {
            return res.status(403).json({ success: false, message: `Tabla '${table}' no permitida` });
        }
        
        // Agregar campos obligatorios
        data.usuario_id = req.user.id;
        
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(',');
        
        const [result] = await connection.query(
            `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`,
            values
        );
        
        res.json({
            success: true,
            message: 'Registro creado exitosamente',
            data: { id: result.insertId }
        });
        
    } catch (error) {
        console.error(`Error en dynamic POST /${req.params.table}:`, error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// PUT /api/dynamic/:table/:id - Actualizar un registro
router.put('/:table/:id', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { table, id } = req.params;
        const data = req.body;
        
        if (!TABLAS_PERMITIDAS.includes(table)) {
            return res.status(403).json({ success: false, message: `Tabla '${table}' no permitida` });
        }
        
        // Eliminar campos que no se deben actualizar
        delete data.id;
        delete data.usuario_id;
        delete data.created_at;
        
        const keys = Object.keys(data);
        const values = Object.values(data);
        
        if (keys.length === 0) {
            return res.status(400).json({ success: false, message: 'No hay datos para actualizar' });
        }
        
        const setClause = keys.map(key => `${key} = ?`).join(',');
        
        const [result] = await connection.query(
            `UPDATE ${table} SET ${setClause} WHERE id = ? AND usuario_id = ?`,
            [...values, id, req.user.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Registro no encontrado o no autorizado' });
        }
        
        res.json({ success: true, message: 'Registro actualizado exitosamente' });
        
    } catch (error) {
        console.error(`Error en dynamic PUT /${req.params.table}/${req.params.id}:`, error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// DELETE /api/dynamic/:table/:id - Eliminar un registro
router.delete('/:table/:id', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { table, id } = req.params;
        
        if (!TABLAS_PERMITIDAS.includes(table)) {
            return res.status(403).json({ success: false, message: `Tabla '${table}' no permitida` });
        }
        
        const [result] = await connection.query(
            `DELETE FROM ${table} WHERE id = ? AND usuario_id = ?`,
            [id, req.user.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Registro no encontrado o no autorizado' });
        }
        
        res.json({ success: true, message: 'Registro eliminado exitosamente' });
        
    } catch (error) {
        console.error(`Error en dynamic DELETE /${req.params.table}/${req.params.id}:`, error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// GET /api/system/tables - Listar todas las tablas disponibles
router.get('/system/tables', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(
            `SELECT TABLE_NAME FROM information_schema.TABLES 
             WHERE TABLE_SCHEMA = 'repromt_cognitive' 
             ORDER BY TABLE_NAME`
        );
        
        res.json({
            success: true,
            data: rows.map(r => r.TABLE_NAME),
            total: rows.length
        });
        
    } catch (error) {
        console.error('Error en system/tables:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// GET /api/system/tables/:table/schema - Obtener esquema de una tabla
router.get('/system/tables/:table/schema', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { table } = req.params;
        
        const [columns] = await connection.query(
            `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY
             FROM information_schema.COLUMNS 
             WHERE TABLE_SCHEMA = 'repromt_cognitive' AND TABLE_NAME = ?
             ORDER BY ORDINAL_POSITION`,
            [table]
        );
        
        if (columns.length === 0) {
            return res.status(404).json({ success: false, message: `Tabla '${table}' no encontrada` });
        }
        
        res.json({
            success: true,
            data: {
                table: table,
                columns: columns
            }
        });
        
    } catch (error) {
        console.error(`Error en system/tables/${req.params.table}/schema:`, error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

export default router;