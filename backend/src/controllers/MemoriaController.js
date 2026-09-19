import MemoriaModel from '../models/MemoriaModel.js';
import MemoriaService from '../services/MemoriaService.js';

class MemoriaController {
    async crearMemoria(req, res) {
        try {
            const usuario_id = req.user?.id || req.body.usuario_id;
            const { tipo_origen, origen_id, contenido, emocion } = req.body;
            if (!usuario_id) return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
            if (!tipo_origen || !contenido) return res.status(400).json({ success: false, error: 'Faltan campos: tipo_origen, contenido' });
            const memoriaId = await MemoriaModel.crearMemoria(usuario_id, tipo_origen, origen_id || 0, contenido, emocion || null);
            res.status(201).json({ success: true, message: 'Memoria creada exitosamente', data: { memoria_id: memoriaId } });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Error al crear memoria' });
        }
    }

    async listarMemorias(req, res) {
        try {
            const usuarioId = req.user?.id;
            const limite = parseInt(req.query.limite) || 10;
            if (!usuarioId) return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
            const memorias = await MemoriaModel.getMemoriasConContexto(usuarioId, limite);
            res.json({ success: true, data: memorias, total: memorias.length, limite });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Error al listar memorias' });
        }
    }

    async preguntarAMem(req, res) {
        try {
            const usuarioId = req.user?.id;
            const { pregunta } = req.body;
            if (!usuarioId) return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
            if (!pregunta) return res.status(400).json({ success: false, error: 'Se requiere una pregunta' });
            const respuesta = await MemoriaService.preguntarMemAvanzado(usuarioId, pregunta);
            res.json({ success: true, data: { pregunta, respuesta, timestamp: new Date().toISOString() } });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Error al procesar pregunta' });
        }
    }

    async getContextoRelacionado(req, res) {
        try {
            const { memoriaId } = req.params;
            const usuarioId = req.user?.id;
            if (!usuarioId) return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
            if (!memoriaId) return res.status(400).json({ success: false, error: 'Se requiere memoria_id' });
            const contexto = await MemoriaModel.getContextoRelacionado(parseInt(memoriaId));
            res.json({ success: true, data: contexto, total: contexto.length });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Error al obtener contexto' });
        }
    }

    async getColecciones(req, res) {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
            const colecciones = await MemoriaModel.getColecciones(usuarioId);
            res.json({ success: true, data: colecciones, total: colecciones.length });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Error al obtener colecciones' });
        }
    }

    async crearColeccion(req, res) {
        try {
            const usuarioId = req.user?.id;
            const { nombre, tema, color, icono } = req.body;
            if (!usuarioId) return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
            if (!nombre) return res.status(400).json({ success: false, error: 'Se requiere un nombre para la colección' });
            const coleccionId = await MemoriaModel.crearColeccion(usuarioId, nombre, tema || null, color || '#4A90D9', icono || '📚');
            res.status(201).json({ success: true, message: 'Colección creada exitosamente', data: { coleccion_id: coleccionId } });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Error al crear colección' });
        }
    }

    async asignarAColeccion(req, res) {
        try {
            const usuarioId = req.user?.id;
            const { memoria_id, coleccion_id } = req.body;
            if (!usuarioId) return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
            if (!memoria_id || !coleccion_id) return res.status(400).json({ success: false, error: 'Faltan: memoria_id, coleccion_id' });
            await MemoriaModel.asignarAColeccion(memoria_id, coleccion_id);
            res.json({ success: true, message: 'Memoria asignada a colección exitosamente' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Error al asignar a colección' });
        }
    }

    async getPatronesEmocionales(req, res) {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
            const patrones = await MemoriaModel.getPatronesEmocionales(usuarioId);
            res.json({ success: true, data: patrones, total: patrones.length });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Error al obtener patrones' });
        }
    }

    async headsUp(req, res) {
        try {
            const usuarioId = req.user?.id;
            const memoriaId = req.query.memoria_id || null;
            if (!usuarioId) return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
            const contexto = await MemoriaService.headsUp(usuarioId, memoriaId);
            res.json({ success: true, data: contexto, mensaje: 'Contexto relacionado (Heads Up)' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Error al obtener contexto rápido' });
        }
    }

    async getMemoriaById(req, res) {
        try {
            const { id } = req.params;
            const usuarioId = req.user?.id;
            if (!usuarioId) return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
            if (!id) return res.status(400).json({ success: false, error: 'Se requiere ID de memoria' });
            const memoria = await MemoriaModel.getMemoriaById(parseInt(id));
            if (!memoria) return res.status(404).json({ success: false, error: 'Memoria no encontrada' });
            if (memoria.usuario_id !== parseInt(usuarioId)) return res.status(403).json({ success: false, error: 'No tienes permiso' });
            res.json({ success: true, data: memoria });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Error al obtener memoria' });
        }
    }

    async getEstadisticas(req, res) {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
            const estadisticas = await MemoriaModel.getEstadisticas(usuarioId);
            res.json({ success: true, data: estadisticas });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Error al obtener estadísticas' });
        }
    }

    async eliminarMemoria(req, res) {
        try {
            const { id } = req.params;
            const usuarioId = req.user?.id;
            if (!usuarioId) return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
            if (!id) return res.status(400).json({ success: false, error: 'Se requiere ID de memoria' });
            await MemoriaModel.eliminarMemoria(parseInt(id), parseInt(usuarioId));
            res.json({ success: true, message: 'Memoria eliminada exitosamente' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Error al eliminar memoria' });
        }
    }
}

export default new MemoriaController();
