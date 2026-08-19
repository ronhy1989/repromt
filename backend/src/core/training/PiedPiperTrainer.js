// backend/src/core/training/PiedPiperTrainer.js
import db from '../../config/database.js';
import EmotionalAnalyzer from './EmotionalAnalyzer.js';

class PiedPiperTrainer {
    constructor() {
        this.version = '1.0.0';
        this.analyzers = {
            emotional: EmotionalAnalyzer
            // Aquí agregaremos más analizadores después:
            // goals: GoalsAnalyzer,
            // social: SocialAnalyzer,
            // crisis: CrisisAnalyzer,
            // tests: TestsAnalyzer
        };
    }

    /**
     * Entrenar Pied Piper para un usuario específico
     */
    async trainUser(userId, options = { deep: true }) {
        console.log(`\n🧠 INICIANDO ENTRENAMIENTO PIED PIPER v${this.version}`);
        console.log(`👤 Usuario: ${userId}`);
        console.log('='.repeat(50));

        const startTime = Date.now();
        const resultados = {
            emocional: null,
            patrones: [],
            insights: [],
            recomendaciones: [],
            metricas: {},
            errores: []
        };

        try {
            // 1. Registrar inicio del entrenamiento
            const logId = await this.startTrainingLog(userId);

            // 2. Ejecutar analizadores en paralelo
            await this.runAnalyzers(userId, resultados);

            // 3. Procesar resultados y generar insights cruzados
            const patronesCruzados = await this.findCrossPatterns(resultados);
            
            // 4. Generar nuevas recomendaciones
            const nuevasRecomendaciones = await this.generateRecommendations(
                userId, 
                resultados,
                patronesCruzados
            );

            // 5. Actualizar modelos del usuario
            await this.updateUserModels(userId, resultados, nuevasRecomendaciones);

            // 6. Actualizar motores de crecimiento
            await this.updateGrowthEngines(userId, resultados);

            // 7. Registrar finalización exitosa
            const endTime = Date.now();
            await this.completeTrainingLog(logId, {
                resultados,
                nuevasRecomendaciones,
                tiempo_ms: endTime - startTime
            });

            console.log('\n✅ ENTRENAMIENTO COMPLETADO');
            console.log(`📊 Recomendaciones generadas: ${nuevasRecomendaciones.length}`);
            console.log(`🎯 Patrones detectados: ${resultados.patrones.length}`);
            console.log(`💡 Insights generados: ${resultados.insights.length}`);
            console.log(`⏱️  Tiempo: ${((endTime - startTime)/1000).toFixed(1)}s`);
            console.log('='.repeat(50));

            return {
                success: true,
                data: {
                    userId,
                    version: this.version,
                    timestamp: new Date(),
                    resultados,
                    recomendaciones: nuevasRecomendaciones,
                    tiempo_ms: endTime - startTime
                }
            };

        } catch (error) {
            console.error('❌ Error en entrenamiento:', error);
            
            // Registrar error
            await this.logError(userId, error);
            
            return {
                success: false,
                error: error.message,
                resultados: resultados
            };
        }
    }

    /**
     * Ejecutar todos los analizadores
     */
    async runAnalyzers(userId, resultados) {
        const analyzerPromises = [];

        // Analizador emocional
        if (this.analyzers.emotional) {
            analyzerPromises.push(
                this.analyzers.emotional.analyze(userId)
                    .then(result => {
                        resultados.emocional = result;
                        // ✅ Asegurar que patrones e insights sean arrays
                        resultados.patrones.push(...(result.patrones || []));
                        resultados.insights.push(...(result.insights || []));
                        console.log(`✅ Análisis emocional: ${result.patrones?.length || 0} patrones`);
                    })
                    .catch(err => {
                        console.error('❌ Error en análisis emocional:', err);
                        resultados.errores.push({ analyzer: 'emotional', error: err.message });
                    })
            );
        }

        // Esperar a que todos los analizadores terminen
        await Promise.all(analyzerPromises);
    }

    /**
     * Encontrar patrones cruzados entre diferentes analizadores
     * ✅ VERSIÓN CORREGIDA - Maneja casos donde no hay datos
     */
    async findCrossPatterns(resultados) {
        const cruzados = [];

        // ✅ Validar que resultados exista
        if (!resultados) {
            console.log('   ℹ️ No hay resultados para patrones cruzados');
            return cruzados;
        }

        // ✅ Validar que emocional exista
        if (!resultados.emocional) {
            console.log('   ℹ️ No hay datos emocionales para patrones cruzados');
            return cruzados;
        }

        const emocional = resultados.emocional;

        // ✅ Buscar patrones en métricas (si existen)
        if (emocional.metrics) {
            if (emocional.metrics.variabilidad > 0.5) {
                cruzados.push({
                    tipo: 'alta_variabilidad_emocional',
                    descripcion: 'Tus emociones son muy variables',
                    sugerencia: 'Considera actividades que estabilicen tu estado de ánimo como meditación o ejercicio regular',
                    confianza: 0.8
                });
            }

            if (emocional.metrics.intensidad_promedio < 4) {
                cruzados.push({
                    tipo: 'bajo_animo_general',
                    descripcion: 'Tu estado de ánimo general es bajo',
                    sugerencia: 'Considera buscar apoyo profesional o aumentar actividades placenteras',
                    confianza: 0.85
                });
            }
        }

        // ✅ Verificar que patrones exista y sea un array antes de usar .some()
        if (emocional.patterns && Array.isArray(emocional.patterns) && emocional.patterns.length > 0) {
            
            // Buscar patrón de horarios críticos
            if (emocional.patterns.some(p => p && p.tipo === 'horarios_criticos')) {
                cruzados.push({
                    tipo: 'horarios_vulnerables_detectados',
                    descripcion: 'Se detectaron horarios de bajo ánimo recurrentes',
                    sugerencia: 'Programa actividades placenteras en esos horarios',
                    confianza: 0.9
                });
            }

            // Buscar patrón de tendencia negativa
            if (emocional.patterns.some(p => p && p.tipo === 'tendencia' && p.direccion === 'empeorando')) {
                cruzados.push({
                    tipo: 'tendencia_negativa',
                    descripcion: 'Tu estado de ánimo está empeorando con el tiempo',
                    sugerencia: 'Revisa qué cambios recientes podrían estar afectándote',
                    confianza: 0.88
                });
            }
        }

        // ✅ Verificar que insights exista y sea un array
        if (emocional.insights && Array.isArray(emocional.insights) && emocional.insights.length > 0) {
            
            // Buscar insights de tipo crisis o urgente
            const insightsUrgentes = emocional.insights.filter(i => 
                i && i.tipo && (i.tipo.includes('crisis') || i.tipo.includes('urgente') || i.tipo.includes('vulnerable'))
            );
            
            if (insightsUrgentes.length > 0) {
                cruzados.push({
                    tipo: 'insights_urgentes_detectados',
                    descripcion: 'Se detectaron patrones que requieren atención inmediata',
                    sugerencia: 'Revisa los insights urgentes en tu panel y considera buscar apoyo',
                    confianza: 0.95
                });
            }
        }

        return cruzados;
    }

    /**
     * Generar recomendaciones basadas en los análisis
     */
    async generateRecommendations(userId, resultados, patronesCruzados) {
        const recomendaciones = [];

        // Recomendaciones de analizador emocional
        if (resultados.emocional?.insights && Array.isArray(resultados.emocional.insights)) {
            for (const insight of resultados.emocional.insights) {
                if (!insight) continue;
                
                recomendaciones.push({
                    usuario_id: userId,
                    tipo_recomendacion: 'insight_emocional',
                    contenido: insight.mensaje || 'Insight emocional detectado',
                    prioridad: this.getPriorityFromInsight(insight),
                    patron_origen: insight.tipo || 'emocional',
                    eventos_relacionados: JSON.stringify({ insight }),
                    confianza_prediccion: 0.85,
                    fecha_generacion: new Date()
                });
            }
        }

        // Recomendaciones de patrones cruzados
        for (const patron of patronesCruzados) {
            if (!patron) continue;
            
            recomendaciones.push({
                usuario_id: userId,
                tipo_recomendacion: 'patron_cruzado',
                contenido: (patron.descripcion || 'Patrón detectado') + ' ' + (patron.sugerencia || ''),
                prioridad: patron.confianza > 0.8 ? 'alta' : 'media',
                patron_origen: patron.tipo || 'cruzado',
                eventos_relacionados: JSON.stringify({ patron }),
                confianza_prediccion: patron.confianza || 0.7,
                fecha_generacion: new Date()
            });
        }

        // Guardar recomendaciones en la base de datos
        for (const rec of recomendaciones) {
            try {
                await db.query(
                    `INSERT INTO recomendaciones_inteligentes 
                    (usuario_id, tipo_recomendacion, contenido, prioridad, patron_origen, eventos_relacionados, confianza_prediccion)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [rec.usuario_id, rec.tipo_recomendacion, rec.contenido, rec.prioridad, 
                     rec.patron_origen, rec.eventos_relacionados, rec.confianza_prediccion]
                );
            } catch (dbError) {
                console.error('Error guardando recomendación:', dbError);
            }
        }

        return recomendaciones;
    }

    /**
     * Determinar prioridad basada en el tipo de insight
     */
    getPriorityFromInsight(insight) {
        const urgentKeywords = ['crisis', 'urgente', 'alerta', 'bajo', 'empeorando', 'vulnerable'];
        const altaKeywords = ['importante', 'significativo', 'frecuente', 'mejores', 'óptimos'];
        
        const mensaje = insight.mensaje?.toLowerCase() || '';
        const tipo = insight.tipo?.toLowerCase() || '';
        
        if (urgentKeywords.some(k => mensaje.includes(k) || tipo.includes(k))) return 'urgente';
        if (altaKeywords.some(k => mensaje.includes(k) || tipo.includes(k))) return 'alta';
        return 'media';
    }

    /**
     * Actualizar modelos del usuario con los nuevos aprendizajes
     */
    async updateUserModels(userId, resultados, recomendaciones) {
        try {
            // Actualizar versión del modelo en usuarios
            await db.query(
                `UPDATE usuarios 
                 SET ultimo_entrenamiento_ia = NOW(),
                     version_modelo_actual = version_modelo_actual + 1,
                     metricas_ia = JSON_MERGE_PATCH(
                         COALESCE(metricas_ia, '{}'),
                         ?
                     )
                 WHERE id = ?`,
                [JSON.stringify({
                    ultimo_entrenamiento: new Date(),
                    patrones_encontrados: resultados.patrones?.length || 0,
                    insights_generados: resultados.insights?.length || 0,
                    recomendaciones_generadas: recomendaciones?.length || 0,
                    metricas_emocionales: resultados.emocional?.metrics || {}
                }), userId]
            );

            // Actualizar pesos del modelo basado en resultados
            if (resultados.emocional?.metrics) {
                const precision = resultados.emocional.metrics.desviacion < 2 ? 0.9 : 0.7;
                
                await db.query(
                    `UPDATE motores_crecimiento 
                     SET pesos_modelo = JSON_MERGE_PATCH(
                         COALESCE(pesos_modelo, '{}'),
                         ?
                     )
                     WHERE usuario_id = ?`,
                    [JSON.stringify({
                        emocional: {
                            precision,
                            ultima_actualizacion: new Date(),
                            metricas: resultados.emocional.metrics
                        }
                    }), userId]
                );
            }
        } catch (error) {
            console.error('Error actualizando modelos:', error);
        }
    }

    /**
     * Actualizar motores de crecimiento
     */
    async updateGrowthEngines(userId, resultados) {
        try {
            // Actualizar nivel de desarrollo basado en patrones
            let nuevoNivel = null;
            const totalPatrones = resultados.patrones?.length || 0;
            
            if (totalPatrones > 10) {
                nuevoNivel = 'arbol';
            } else if (totalPatrones > 5) {
                nuevoNivel = 'brote';
            }

            if (nuevoNivel) {
                await db.query(
                    `UPDATE motores_crecimiento 
                     SET nivel_desarrollo_actual = ?,
                         timestamp_adaptacion = NOW()
                     WHERE usuario_id = ?`,
                    [nuevoNivel, userId]
                );
            }
        } catch (error) {
            console.error('Error actualizando motores:', error);
        }
    }

    /**
     * Registrar inicio del entrenamiento
     */
    async startTrainingLog(userId) {
        try {
            const [result] = await db.query(
                `INSERT INTO log_entrenamiento 
                (usuario_id, tipo_entrenamiento, estado, fecha_inicio)
                VALUES (?, 'completo', 'iniciado', NOW())`,
                [userId]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error iniciando log:', error);
            return null;
        }
    }

    /**
     * Completar log de entrenamiento
     */
    async completeTrainingLog(logId, data) {
        if (!logId) return;
        
        try {
            await db.query(
                `UPDATE log_entrenamiento 
                 SET estado = 'completado',
                     fecha_fin = NOW(),
                     datos_procesados = ?,
                     nuevos_patrones = ?,
                     nuevas_recomendaciones = ?,
                     tiempo_ejecucion_ms = ?
                 WHERE id = ?`,
                [
                    data.resultados?.patrones?.length || 0,
                    data.resultados?.patrones?.length || 0,
                    data.nuevasRecomendaciones?.length || 0,
                    data.tiempo_ms || 0,
                    logId
                ]
            );
        } catch (error) {
            console.error('Error completando log:', error);
        }
    }

    /**
     * Registrar error en entrenamiento
     */
    async logError(userId, error) {
        try {
            await db.query(
                `INSERT INTO log_entrenamiento 
                (usuario_id, tipo_entrenamiento, estado, errores, fecha_inicio, fecha_fin)
                VALUES (?, 'completo', 'error', ?, NOW(), NOW())`,
                [userId, JSON.stringify({ message: error.message, stack: error.stack })]
            );
        } catch (dbError) {
            console.error('Error registrando error:', dbError);
        }
    }

    /**
     * Entrenar todos los usuarios activos
     */
    async trainAllUsers(options = { deep: false }) {
        console.log('🌍 Iniciando entrenamiento masivo...');
        
        try {
            const [users] = await db.query(
                'SELECT id FROM usuarios WHERE estado = "activo"'
            );

            const results = {
                total: users.length,
                exitosos: 0,
                fallidos: 0,
                detalles: []
            };

            for (const user of users) {
                try {
                    console.log(`\n🔄 Procesando usuario ${user.id}...`);
                    const result = await this.trainUser(user.id, options);
                    
                    if (result.success) {
                        results.exitosos++;
                        results.detalles.push({
                            userId: user.id,
                            status: 'exitoso',
                            recomendaciones: result.data?.recomendaciones?.length || 0
                        });
                    } else {
                        results.fallidos++;
                        results.detalles.push({
                            userId: user.id,
                            status: 'fallido',
                            error: result.error
                        });
                    }

                    // Pequeña pausa entre usuarios
                    await this.sleep(1000);
                    
                } catch (error) {
                    console.error(`❌ Error procesando usuario ${user.id}:`, error);
                    results.fallidos++;
                }
            }

            console.log('\n📊 RESULTADOS ENTRENAMIENTO MASIVO');
            console.log(`✅ Exitosos: ${results.exitosos}`);
            console.log(`❌ Fallidos: ${results.fallidos}`);
            console.log(`📈 Total: ${results.total}`);

            return results;
            
        } catch (error) {
            console.error('Error en entrenamiento masivo:', error);
            return { error: error.message };
        }
    }

    /**
     * Utilidad para pausar
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default new PiedPiperTrainer();