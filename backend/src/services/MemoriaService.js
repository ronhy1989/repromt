import MemoriaModel from '../models/MemoriaModel.js';
import { executeQuery } from '../config/database.js';

class MemoriaService {
    async headsUp(usuarioId, memoriaId = null) {
        if (memoriaId) return await MemoriaModel.getContextoRelacionado(memoriaId);
        return await MemoriaModel.getMemoriasConContexto(usuarioId, 5);
    }

    async preguntarMemAvanzado(usuarioId, pregunta) {
        const preguntaLower = pregunta.toLowerCase();
        
        if (preguntaLower.includes('última') || preguntaLower.includes('reciente')) {
            const memorias = await MemoriaModel.getMemoriasConContexto(usuarioId, 1);
            if (memorias.length > 0) return `Tu última memoria: ${memorias[0].contenido}`;
            return 'No tienes memorias aún. ¡Comienza a registrar tus experiencias!';
        }
        
        const emociones = ['triste', 'ansiedad', 'feliz', 'alegre', 'estresado', 'enojado', 'preocupado', 'motivado', 'agradecido'];
        for (const emocion of emociones) {
            if (preguntaLower.includes(emocion)) {
                const result = await executeQuery(
                    `SELECT COUNT(*) as total FROM memoria_personal WHERE usuario_id = ? AND LOWER(emocion_principal) LIKE ?`,
                    [usuarioId, `%${emocion}%`]
                );
                return `Tienes ${result[0]?.total || 0} memorias relacionadas con ${emocion}`;
            }
        }
        
        if (preguntaLower.includes('contexto') || preguntaLower.includes('relacionado')) {
            const result = await executeQuery(
                `SELECT COUNT(DISTINCT cr.memoria_relacionada_id) as total
                 FROM contexto_relacionado cr JOIN memoria_personal m ON cr.memoria_origen_id = m.id
                 WHERE m.usuario_id = ?`,
                [usuarioId]
            );
            return `Encontramos ${result[0]?.total || 0} conexiones entre tus memorias`;
        }
        
        if (preguntaLower.includes('patrón') || preguntaLower.includes('tendencia')) {
            return await this._analizarPatrones(usuarioId);
        }
        
        if (preguntaLower.includes('estadística') || preguntaLower.includes('cuántas') || preguntaLower.includes('total')) {
            const stats = await MemoriaModel.getEstadisticas(usuarioId);
            if (stats) return `Tienes ${stats.total_memorias} memorias en total. La primera fue el ${stats.primera_memoria} y la última el ${stats.ultima_memoria}. Has usado ${stats.emociones_distintas} emociones diferentes.`;
            return 'No hay estadísticas disponibles';
        }
        
        const results = await executeQuery(
            `SELECT contenido, emocion_principal, DATE_FORMAT(fecha_creacion, '%d/%m/%Y') as fecha
             FROM memoria_personal WHERE usuario_id = ? AND contenido LIKE ? LIMIT 3`,
            [usuarioId, `%${pregunta}%`]
        );
        
        if (results.length > 0) {
            let respuesta = '📝 Memorias encontradas:\n';
            results.forEach((r, index) => {
                const preview = r.contenido.length > 100 ? r.contenido.substring(0, 100) + '...' : r.contenido;
                respuesta += `${index + 1}. ${preview} (Emoción: ${r.emocion_principal || 'N/A'}, Fecha: ${r.fecha})\n`;
            });
            return respuesta;
        }
        
        return 'No encontré información sobre eso en tus memorias. ¿Quieres ser más específico?';
    }

    async _analizarPatrones(usuarioId) {
        const results = await executeQuery(
            `SELECT DATE(fecha_creacion) as fecha, emocion_principal, COUNT(*) as total
             FROM memoria_personal WHERE usuario_id = ? AND fecha_creacion >= NOW() - INTERVAL 30 DAY
             GROUP BY DATE(fecha_creacion), emocion_principal ORDER BY fecha DESC`,
            [usuarioId]
        );
        
        if (!results || results.length === 0) return 'No hay suficientes datos para analizar patrones (necesito al menos 7 días de registros)';
        
        const emociones = {};
        results.forEach(r => {
            const emocion = r.emocion_principal || 'NEUTRAL';
            emociones[emocion] = (emociones[emocion] || 0) + r.total;
        });
        
        let masComun = null, maxCount = 0, total = 0, emocionInfo = '';
        for (const [emocion, count] of Object.entries(emociones)) {
            total += count;
            const porcentaje = ((count / results.length) * 100).toFixed(1);
            emocionInfo += `${emocion}: ${count} (${porcentaje}%)\n`;
            if (count > maxCount) { maxCount = count; masComun = emocion; }
        }
        
        const dias = [...new Set(results.map(r => r.fecha))];
        let respuesta = `📊 Análisis de tus patrones emocionales (últimos ${dias.length} días):\n\n`;
        respuesta += `🔹 Emoción más frecuente: ${masComun} (${maxCount} ocurrencias)\n`;
        respuesta += `🔹 Días registrados: ${dias.length}\n🔹 Total de registros: ${total}\n`;
        respuesta += `🔹 Promedio diario: ${(total / Math.max(dias.length, 1)).toFixed(1)}\n\n📋 Distribución de emociones:\n${emocionInfo}`;
        
        if (masComun && (masComun.toLowerCase().includes('triste') || masComun.toLowerCase().includes('ansiedad'))) {
            respuesta += `\n💡 Recomendación: Considera practicar mindfulness o hablar con un profesional.`;
        } else if (masComun && (masComun.toLowerCase().includes('feliz') || masComun.toLowerCase().includes('alegre'))) {
            respuesta += `\n💡 ¡Sigue así! Mantén estas prácticas que te generan bienestar.`;
        }
        return respuesta;
    }
}

export default new MemoriaService();
