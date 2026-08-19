import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

// POST /api/sync/global - Sincronizar datos globales
router.post('/global', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { data, timestamp, version } = req.body;
        const usuarioId = req.user.id;
        
        if (!usuarioId) {
            return res.status(400).json({ success: false, message: 'Usuario no autenticado' });
        }
        
        // Verificar si la tabla existe, si no, crearla
        try {
            await connection.query(`
                CREATE TABLE IF NOT EXISTS sincronizacion_global (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    usuario_id INT NOT NULL UNIQUE,
                    datos_json JSON,
                    version VARCHAR(20) DEFAULT '1.0.0',
                    ultima_sincronizacion DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_usuario (usuario_id),
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
                )
            `);
        } catch (err) {
            console.log('Tabla sincronizacion_global ya existe o error:', err.message);
        }
        
        // Verificar si ya existe un registro
        const [existing] = await connection.query(
            'SELECT id FROM sincronizacion_global WHERE usuario_id = ?',
            [usuarioId]
        );
        
        if (existing.length > 0) {
            await connection.query(
                `UPDATE sincronizacion_global 
                 SET datos_json = ?, version = ?, ultima_sincronizacion = ?
                 WHERE usuario_id = ?`,
                [JSON.stringify(data), version || '1.0.0', new Date(timestamp || Date.now()), usuarioId]
            );
        } else {
            await connection.query(
                `INSERT INTO sincronizacion_global (usuario_id, datos_json, version, ultima_sincronizacion) 
                 VALUES (?, ?, ?, ?)`,
                [usuarioId, JSON.stringify(data), version || '1.0.0', new Date(timestamp || Date.now())]
            );
        }
        
        res.json({
            success: true,
            message: 'Datos sincronizados correctamente',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error en sync/global:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// GET /api/user/:userId/global-data - Obtener datos globales
router.get('/user/:userId/global-data', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { userId } = req.params;
        
        const [rows] = await connection.query(
            'SELECT datos_json, version, ultima_sincronizacion FROM sincronizacion_global WHERE usuario_id = ?',
            [userId]
        );
        
        if (rows.length === 0) {
            return res.json({
                success: true,
                data: null,
                message: 'No hay datos sincronizados para este usuario'
            });
        }
        
        let datosJson = {};
        try {
            datosJson = JSON.parse(rows[0].datos_json);
        } catch(e) {
            datosJson = rows[0].datos_json;
        }
        
        res.json({
            success: true,
            data: datosJson,
            version: rows[0].version,
            ultima_sincronizacion: rows[0].ultima_sincronizacion
        });
        
    } catch (error) {
        console.error('Error en user/global-data:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// POST /api/sync/app - Sincronizar datos de una app específica
router.post('/app', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { appName, appData, timestamp } = req.body;
        const usuarioId = req.user.id;
        
        if (!usuarioId || !appName) {
            return res.status(400).json({ success: false, message: 'userId y appName requeridos' });
        }
        
        // Crear tabla si no existe
        try {
            await connection.query(`
                CREATE TABLE IF NOT EXISTS datos_apps (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    usuario_id INT NOT NULL,
                    app_name VARCHAR(100) NOT NULL,
                    datos_json JSON,
                    ultima_actualizacion DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_usuario_app (usuario_id, app_name),
                    INDEX idx_usuario (usuario_id),
                    INDEX idx_app (app_name),
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
                )
            `);
        } catch (err) {
            console.log('Tabla datos_apps ya existe o error:', err.message);
        }
        
        await connection.query(
            `INSERT INTO datos_apps (usuario_id, app_name, datos_json, ultima_actualizacion) 
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE datos_json = ?, ultima_actualizacion = ?`,
            [usuarioId, appName, JSON.stringify(appData), new Date(timestamp || Date.now()), JSON.stringify(appData), new Date(timestamp || Date.now())]
        );
        
        res.json({
            success: true,
            message: `Datos de ${appName} sincronizados correctamente`
        });
        
    } catch (error) {
        console.error('Error en sync/app:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// POST /api/sync/all - Sincronizar todos los datos (respaldo completo)
router.post('/all', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { data } = req.body;
        const usuarioId = req.user.id;
        
        // Obtener todas las tablas de usuario
        const [tablas] = await connection.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = 'repromt_cognitive' 
            AND TABLE_NAME IN ('metas_salud', 'metas_emocionales', 'habitos', 'estados_animo', 'ejercicios', 'sueno')
        `);
        
        const resultados = {};
        
        for (const tabla of tablas) {
            const nombreTabla = tabla.TABLE_NAME;
            if (data[nombreTabla]) {
                // Limpiar datos existentes del usuario
                await connection.query(`DELETE FROM ${nombreTabla} WHERE usuario_id = ?`, [usuarioId]);
                
                // Insertar nuevos datos
                for (const registro of data[nombreTabla]) {
                    registro.usuario_id = usuarioId;
                    const keys = Object.keys(registro);
                    const values = Object.values(registro);
                    const placeholders = keys.map(() => '?').join(',');
                    await connection.query(
                        `INSERT INTO ${nombreTabla} (${keys.join(',')}) VALUES (${placeholders})`,
                        values
                    );
                }
                resultados[nombreTabla] = data[nombreTabla].length;
            }
        }
        
        res.json({
            success: true,
            message: 'Respaldo completo sincronizado',
            data: resultados
        });
        
    } catch (error) {
        console.error('Error en sync/all:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

export default router;