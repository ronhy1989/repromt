// backend/src/core/training/EmotionalAnalyzer.js
import db from '../../config/database.js';

class EmotionalAnalyzer {
    /**
     * Analiza los estados de ánimo del usuario
     */
    async analyze(userId) {
        console.log(`📊 Analizando patrones emocionales para usuario ${userId}...`);
        
        // 1. Obtener datos de los últimos 30 días
        const emotionalData = await this.getEmotionalData(userId);
        
        // ✅ CORREGIDO: Verificar si hay estados (no usar .length en el objeto)
        if (!emotionalData.estados || emotionalData.estados.length === 0) {
            console.log('   ⚠️ No hay datos emocionales');
            return {
                patterns: [],
                insights: [],
                metrics: this.getEmptyMetrics()
            };
        }

        // 2. Detectar patrones
        const patterns = await this.detectPatterns(emotionalData, userId);
        
        // 3. Generar insights
        const insights = await this.generateInsights(patterns, userId);
        
        // 4. Calcular métricas
        const metrics = this.calculateMetrics(emotionalData);
        
        // 5. Guardar patrones detectados
        await this.savePatterns(userId, patterns, insights);
        
        return {
            patterns,
            insights,
            metrics
        };
    }

    /**
     * Obtener datos emocionales de la base de datos
     */
    async getEmotionalData(userId) {
        // Estados de ánimo registrados
        const [estados] = await db.query(`
            SELECT 
                estado,
                intensidad,
                factores,
                DATE(fecha_registro) as fecha,
                HOUR(fecha_registro) as hora,
                DAYOFWEEK(fecha_registro) as dia_semana
            FROM estados_animo 
            WHERE usuario_id = ? 
            AND fecha_registro >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY fecha_registro ASC
        `, [userId]);

        // Eventos conscientes relacionados
        const [eventos] = await db.query(`
            SELECT 
                tipo_evento,
                datos_objetivos,
                timestamp_evento as fecha
            FROM eventos_conscientes 
            WHERE usuario_id = ? 
            AND timestamp_evento >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `, [userId]);

        // Hábitos realizados
        const [habitos] = await db.query(`
            SELECT 
                h.nombre,
                sh.fecha,
                sh.calidad_ejecucion,
                sh.estado_animo_post
            FROM seguimiento_habitos sh
            JOIN habitos_neuronales h ON sh.habito_id = h.id
            WHERE sh.usuario_id = ? 
            AND sh.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `, [userId]);

        return {
            estados: estados || [],
            eventos: eventos || [],
            habitos: habitos || [],
            total: estados?.length || 0
        };
    }

    /**
     * Detectar patrones en los datos emocionales
     */
    async detectPatterns(data, userId) {
        const patterns = [];
        
        if (!data.estados || data.estados.length === 0) return patterns;

        // Patrón 1: Estados más frecuentes
        const estadoFrecuente = this.findMostFrequentState(data.estados);
        if (estadoFrecuente) {
            patterns.push({
                tipo: 'estado_frecuente',
                nombre: estadoFrecuente.estado,
                frecuencia: estadoFrecuente.count,
                porcentaje: (estadoFrecuente.count / data.estados.length * 100).toFixed(1)
            });
        }

        // Patrón 2: Horarios críticos (intensidad baja)
        const horariosCriticos = this.findCriticalHours(data.estados);
        if (horariosCriticos.length > 0) {
            patterns.push({
                tipo: 'horarios_criticos',
                horarios: horariosCriticos
            });
        }

        // Patrón 3: Días de la semana con mejor ánimo
        const mejoresDias = this.findBestDays(data.estados);
        if (mejoresDias.length > 0) {
            patterns.push({
                tipo: 'mejores_dias',
                dias: mejoresDias
            });
        }

        // Patrón 4: Correlación con hábitos
        const correlacionHabitos = await this.findHabitCorrelation(data, userId);
        if (correlacionHabitos.length > 0) {
            patterns.push({
                tipo: 'correlacion_habitos',
                habitos: correlacionHabitos
            });
        }

        // Patrón 5: Tendencias
        const tendencia = this.calculateTrend(data.estados);
        if (Math.abs(tendencia) > 0.1) {
            patterns.push({
                tipo: 'tendencia',
                direccion: tendencia > 0 ? 'mejorando' : 'empeorando',
                intensidad: Math.abs(tendencia)
            });
        }

        return patterns;
    }

    /**
     * Encontrar el estado de ánimo más frecuente
     */
    findMostFrequentState(estados) {
        const counts = {};
        estados.forEach(e => {
            counts[e.estado] = (counts[e.estado] || 0) + 1;
        });

        let maxEstado = null;
        let maxCount = 0;

        Object.entries(counts).forEach(([estado, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxEstado = estado;
            }
        });

        return maxEstado ? { estado: maxEstado, count: maxCount } : null;
    }

    /**
     * Encontrar horas con intensidad baja (posibles crisis)
     */
    findCriticalHours(estados) {
        const horas = {};
        
        estados.forEach(e => {
            if (e.intensidad <= 3) { // Intensidad baja
                const hora = e.hora;
                if (!horas[hora]) {
                    horas[hora] = {
                        hora,
                        frecuencia: 0,
                        intensidad_promedio: 0
                    };
                }
                horas[hora].frecuencia++;
                horas[hora].intensidad_promedio = 
                    (horas[hora].intensidad_promedio * (horas[hora].frecuencia - 1) + e.intensidad) 
                    / horas[hora].frecuencia;
            }
        });

        return Object.values(horas)
            .filter(h => h.frecuencia >= 3) // Al menos 3 veces
            .sort((a, b) => b.frecuencia - a.frecuencia)
            .slice(0, 3); // Top 3 horas críticas
    }

    /**
     * Encontrar mejores días de la semana
     */
    findBestDays(estados) {
        const dias = {};
        
        estados.forEach(e => {
            const dia = e.dia_semana;
            if (!dias[dia]) {
                dias[dia] = {
                    dia,
                    suma_intensidad: 0,
                    count: 0
                };
            }
            dias[dia].suma_intensidad += e.intensidad;
            dias[dia].count++;
        });

        return Object.values(dias)
            .map(d => ({
                dia: this.getDayName(d.dia),
                promedio: d.count > 0 ? (d.suma_intensidad / d.count).toFixed(1) : 0
            }))
            .filter(d => d.promedio >= 7) // Promedio alto
            .sort((a, b) => b.promedio - a.promedio);
    }

    /**
     * Encontrar correlación entre hábitos y estado de ánimo
     */
    async findHabitCorrelation(data, userId) {
        const correlaciones = [];

        if (!data.habitos || data.habitos.length === 0) return correlaciones;

        // Agrupar por hábito
        const habitosMap = {};
        data.habitos.forEach(h => {
            if (!habitosMap[h.nombre]) {
                habitosMap[h.nombre] = {
                    nombre: h.nombre,
                    total: 0,
                    suma_animo: 0
                };
            }
            habitosMap[h.nombre].total++;
            if (h.estado_animo_post) {
                habitosMap[h.nombre].suma_animo += h.estado_animo_post;
            }
        });

        // Calcular promedio de ánimo por hábito
        Object.values(habitosMap).forEach(h => {
            if (h.total >= 5) { // Mínimo 5 veces para ser significativo
                const promedio = h.suma_animo / h.total;
                correlaciones.push({
                    nombre: h.nombre,
                    impacto: promedio > 7 ? 'positivo' : promedio < 4 ? 'negativo' : 'neutral',
                    promedio_animo: promedio.toFixed(1),
                    veces_realizado: h.total
                });
            }
        });

        return correlaciones.sort((a, b) => b.promedio_animo - a.promedio_animo);
    }

    /**
     * Calcular tendencia (mejorando o empeorando)
     */
    calculateTrend(estados) {
        if (!estados || estados.length < 7) return 0;

        // Dividir en dos mitades
        const mitad = Math.floor(estados.length / 2);
        const primeraMitad = estados.slice(0, mitad);
        const segundaMitad = estados.slice(-mitad);

        const promedioPrimera = primeraMitad.reduce((s, e) => s + e.intensidad, 0) / primeraMitad.length;
        const promedioSegunda = segundaMitad.reduce((s, e) => s + e.intensidad, 0) / segundaMitad.length;

        return promedioSegunda - promedioPrimera;
    }

    /**
     * Generar insights basados en los patrones detectados
     */
    async generateInsights(patterns, userId) {
        const insights = [];

        for (const pattern of patterns) {
            if (!pattern) continue;
            
            switch (pattern.tipo) {
                case 'estado_frecuente':
                    insights.push({
                        tipo: 'estado_dominante',
                        mensaje: `Tu estado de ánimo más frecuente es "${pattern.nombre || 'desconocido'}" (${pattern.porcentaje || 0}% del tiempo)`,
                        sugerencia: pattern.nombre === 'ansiedad' || pattern.nombre === 'tristeza'
                            ? 'Considera actividades que mejoren este estado'
                            : 'Aprovecha este estado positivo para metas desafiantes'
                    });
                    break;

                case 'horarios_criticos':
                    if (pattern.horarios && pattern.horarios.length > 0) {
                        insights.push({
                            tipo: 'horario_vulnerable',
                            mensaje: `Horas de menor ánimo: ${pattern.horarios.map(h => `${h.hora}:00`).join(', ')}`,
                            sugerencia: 'Programa actividades placenteras en estos horarios'
                        });
                    }
                    break;

                case 'mejores_dias':
                    if (pattern.dias && pattern.dias.length > 0) {
                        insights.push({
                            tipo: 'dias_optimos',
                            mensaje: `Tus mejores días: ${pattern.dias.map(d => d.dia).join(', ')}`,
                            sugerencia: 'Agenda tareas importantes en estos días'
                        });
                    }
                    break;

                case 'correlacion_habitos':
                    const positivos = pattern.habitos?.filter(h => h.impacto === 'positivo') || [];
                    if (positivos.length > 0) {
                        insights.push({
                            tipo: 'habitos_positivos',
                            mensaje: `Hábitos que mejoran tu ánimo: ${positivos.map(h => h.nombre).join(', ')}`,
                            sugerencia: 'Aumenta la frecuencia de estos hábitos'
                        });
                    }
                    break;

                case 'tendencia':
                    insights.push({
                        tipo: 'tendencia_emocional',
                        mensaje: `Tu estado de ánimo está ${pattern.direccion || 'estable'}`,
                        sugerencia: pattern.direccion === 'empeorando' 
                            ? 'Revisa qué ha cambiado en tu rutina'
                            : 'Sigue haciendo lo que estás haciendo'
                    });
                    break;
            }
        }

        return insights;
    }

    /**
     * Calcular métricas generales
     */
    calculateMetrics(data) {
        if (!data.estados || data.estados.length === 0) {
            return this.getEmptyMetrics();
        }

        const intensidades = data.estados.map(e => e.intensidad);
        
        return {
            total_registros: data.estados.length,
            intensidad_promedio: intensidades.length > 0 ? (intensidades.reduce((s, i) => s + i, 0) / intensidades.length).toFixed(1) : 0,
            intensidad_max: intensidades.length > 0 ? Math.max(...intensidades) : 0,
            intensidad_min: intensidades.length > 0 ? Math.min(...intensidades) : 0,
            desviacion: this.calculateStdDev(intensidades),
            variabilidad: this.calculateVariability(intensidades),
            dias_con_datos: new Set(data.estados.map(e => e.fecha)).size
        };
    }

    /**
     * Calcular desviación estándar
     */
    calculateStdDev(values) {
        if (!values || values.length === 0) return 0;
        const avg = values.reduce((s, v) => s + v, 0) / values.length;
        const squareDiffs = values.map(v => Math.pow(v - avg, 2));
        const avgSquareDiff = squareDiffs.reduce((s, v) => s + v, 0) / squareDiffs.length;
        return Math.sqrt(avgSquareDiff).toFixed(2);
    }

    /**
     * Calcular variabilidad (rango / promedio)
     */
    calculateVariability(values) {
        if (!values || values.length === 0) return 0;
        const max = Math.max(...values);
        const min = Math.min(...values);
        const avg = values.reduce((s, v) => s + v, 0) / values.length;
        return avg > 0 ? ((max - min) / avg).toFixed(2) : 0;
    }

    /**
     * Guardar patrones detectados en la base de datos
     */
    async savePatterns(userId, patterns, insights) {
        // Actualizar cerebros_digitales con los nuevos patrones
        const [cerebro] = await db.query(
            'SELECT * FROM cerebros_digitales WHERE usuario_id = ?',
            [userId]
        );

        const patronesActuales = cerebro[0]?.patrones_detectados 
            ? JSON.parse(cerebro[0].patrones_detectados) 
            : { historial: [], ultimos_insights: [] };

        // Agregar nuevos patrones
        patronesActuales.historial = [
            ...(patronesActuales.historial || []),
            {
                fecha: new Date(),
                patrones: patterns,
                insights: insights
            }
        ].slice(-20); // Mantener últimos 20

        patronesActuales.ultimos_insights = insights;

        await db.query(
            `UPDATE cerebros_digitales 
             SET patrones_detectados = ?,
                 timestamp_actualizacion = NOW()
             WHERE usuario_id = ?`,
            [JSON.stringify(patronesActuales), userId]
        );

        // Guardar en motores_crecimiento
        await db.query(
            `UPDATE motores_crecimiento 
             SET metricas_entrenamiento = JSON_MERGE_PATCH(
                 COALESCE(metricas_entrenamiento, '{}'),
                 ?
             )
             WHERE usuario_id = ?`,
            [JSON.stringify({ ultimo_analisis_emocional: new Date() }), userId]
        );
    }

    /**
     * Obtener métricas vacías (para cuando no hay datos)
     */
    getEmptyMetrics() {
        return {
            total_registros: 0,
            intensidad_promedio: 0,
            intensidad_max: 0,
            intensidad_min: 0,
            desviacion: 0,
            variabilidad: 0,
            dias_con_datos: 0
        };
    }

    /**
     * Obtener nombre del día en español
     */
    getDayName(dayNumber) {
        const days = {
            1: 'Domingo',
            2: 'Lunes',
            3: 'Martes',
            4: 'Miércoles',
            5: 'Jueves',
            6: 'Viernes',
            7: 'Sábado'
        };
        return days[dayNumber] || 'Desconocido';
    }
}

export default new EmotionalAnalyzer();