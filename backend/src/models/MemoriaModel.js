import { executeQuery, executeProcedure, getLastInsertId } from '../config/database.js';

class MemoriaModel {
    async crearMemoria(usuarioId, tipoOrigen, origenId, contenido, emocion = null, palabrasClave = null) {
        try {
            const result = await executeProcedure('crear_memoria_automatica', [usuarioId, tipoOrigen, origenId, contenido, emocion, palabrasClave]);
            if (result && result.length > 0) return result[0].nueva_memoria_id;
            return null;
        } catch (error) {
            console.error('Error al crear memoria:', error);
            throw error;
        }
    }

    async getMemoriasConContexto(usuarioId, limite = 10) {
        try {
            const sql = `SELECT * FROM vista_memoria_contexto WHERE usuario_id = ? ORDER BY memoria_id DESC LIMIT ?`;
            return await executeQuery(sql, [usuarioId, limite]);
        } catch (error) {
            console.error('Error al obtener memorias:', error);
            throw error;
        }
    }

    async preguntarAMem(usuarioId, pregunta) {
        try {
            const sql = `SELECT preguntar_a_mem(?, ?) AS respuesta`;
            const result = await executeQuery(sql, [usuarioId, pregunta]);
            return result[0]?.respuesta || 'No se pudo procesar la pregunta';
        } catch (error) {
            console.error('Error al preguntar a Mem:', error);
            return 'Hubo un error al procesar tu pregunta';
        }
    }

    async getContextoRelacionado(memoriaId) {
        try {
            const sql = `
                SELECT mp.contenido AS memoria_relacionada, cr.nivel_relacion, cr.factor_comun,
                       DATE_FORMAT(mp.fecha_creacion, '%d/%m/%Y') AS fecha, mp.emocion_principal AS emocion_relacionada
                FROM contexto_relacionado cr
                JOIN memoria_personal mp ON cr.memoria_relacionada_id = mp.id
                WHERE cr.memoria_origen_id = ?
                ORDER BY cr.nivel_relacion DESC, mp.fecha_creacion DESC LIMIT 5
            `;
            return await executeQuery(sql, [memoriaId]);
        } catch (error) {
            console.error('Error al obtener contexto:', error);
            throw error;
        }
    }

    async getColecciones(usuarioId) {
        try {
            const sql = `SELECT * FROM colecciones_memoria WHERE usuario_id = ? ORDER BY es_automatica DESC, nombre ASC`;
            return await executeQuery(sql, [usuarioId]);
        } catch (error) {
            console.error('Error al obtener colecciones:', error);
            throw error;
        }
    }

    async crearColeccion(usuarioId, nombre, tema = null, color = '#4A90D9', icono = '📚') {
        try {
            const sql = `INSERT INTO colecciones_memoria (usuario_id, nombre, tema, color, icono, es_automatica) VALUES (?, ?, ?, ?, ?, FALSE)`;
            await executeQuery(sql, [usuarioId, nombre, tema, color, icono]);
            return await getLastInsertId();
        } catch (error) {
            console.error('Error al crear colección:', error);
            throw error;
        }
    }

    async asignarAColeccion(memoriaId, coleccionId) {
        try {
            const sql = `INSERT IGNORE INTO relacion_memoria_coleccion (memoria_id, coleccion_id) VALUES (?, ?)`;
            await executeQuery(sql, [memoriaId, coleccionId]);
            return true;
        } catch (error) {
            console.error('Error al asignar a colección:', error);
            throw error;
        }
    }

    async getPatronesEmocionales(usuarioId) {
        try {
            const sql = `SELECT * FROM vista_patrones_emocionales WHERE usuario_id = ? ORDER BY total_ocurrencias DESC`;
            return await executeQuery(sql, [usuarioId]);
        } catch (error) {
            console.error('Error al obtener patrones:', error);
            throw error;
        }
    }

    async getMemoriaById(memoriaId) {
        try {
            const sql = `
                SELECT m.*, GROUP_CONCAT(DISTINCT c.nombre SEPARATOR ', ') AS colecciones,
                       GROUP_CONCAT(DISTINCT c.color SEPARATOR ', ') AS colores_colecciones
                FROM memoria_personal m
                LEFT JOIN relacion_memoria_coleccion rmc ON m.id = rmc.memoria_id
                LEFT JOIN colecciones_memoria c ON rmc.coleccion_id = c.id
                WHERE m.id = ? GROUP BY m.id
            `;
            const result = await executeQuery(sql, [memoriaId]);
            return result[0] || null;
        } catch (error) {
            console.error('Error al obtener memoria:', error);
            throw error;
        }
    }

    async getEstadisticas(usuarioId) {
        try {
            const sql = `
                SELECT COUNT(*) as total_memorias, COUNT(DISTINCT emocion_principal) as emociones_distintas,
                       COUNT(DISTINCT tipo_origen) as tipos_origen,
                       DATE_FORMAT(MIN(fecha_creacion), '%d/%m/%Y') as primera_memoria,
                       DATE_FORMAT(MAX(fecha_creacion), '%d/%m/%Y') as ultima_memoria,
                       ROUND(AVG(confianza_analisis), 2) as confianza_promedio
                FROM memoria_personal WHERE usuario_id = ?
            `;
            const result = await executeQuery(sql, [usuarioId]);
            return result[0] || null;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    }

    async eliminarMemoria(memoriaId, usuarioId) {
        try {
            const checkSql = `SELECT id FROM memoria_personal WHERE id = ? AND usuario_id = ?`;
            const check = await executeQuery(checkSql, [memoriaId, usuarioId]);
            if (check.length === 0) throw new Error('Memoria no encontrada o no pertenece al usuario');
            await executeQuery(`DELETE FROM memoria_personal WHERE id = ?`, [memoriaId]);
            return true;
        } catch (error) {
            console.error('Error al eliminar memoria:', error);
            throw error;
        }
    }
}

export default new MemoriaModel();
