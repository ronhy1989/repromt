// backend/src/core/Scheduler.js
import cron from 'node-cron';
import PiedPiperTrainer from './training/PiedPiperTrainer.js';
import db from '../config/database.js';

class Scheduler {
    constructor() {
        this.jobs = [];
        this.isRunning = false;
    }

    /**
     * Iniciar todos los jobs programados
     */
    start() {
        if (this.isRunning) {
            console.log('⚠️ Scheduler ya está corriendo');
            return;
        }

        console.log('\n⏰ INICIANDO SCHEDULER DE TAREAS AUTOMÁTICAS');
        console.log('='.repeat(50));

        // 1. Entrenamiento profundo diario (2:00 AM)
        this.scheduleJob('0 2 * * *', '🌙 Entrenamiento profundo diario', async () => {
            console.log('\n🌙 EJECUTANDO ENTRENAMIENTO PROFUNDO NOCTURNO');
            console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
            
            try {
                const result = await PiedPiperTrainer.trainAllUsers({ deep: true });
                
                console.log('\n📊 RESULTADOS ENTRENAMIENTO NOCTURNO:');
                console.log(`✅ Usuarios exitosos: ${result.exitosos || 0}`);
                console.log(`❌ Usuarios fallidos: ${result.fallidos || 0}`);
                console.log(`📈 Total procesados: ${result.total || 0}`);
                
                // Guardar métrica diaria
                await this.saveDailyMetric(result);
                
            } catch (error) {
                console.error('❌ Error en entrenamiento nocturno:', error);
            }
        });

        // 2. Entrenamiento rápido cada 6 horas (para datos recientes)
        this.scheduleJob('0 */6 * * *', '⚡ Entrenamiento rápido', async () => {
            console.log('\n⚡ EJECUTANDO ENTRENAMIENTO RÁPIDO');
            
            try {
                // Solo usuarios con actividad reciente
                const [users] = await db.query(`
                    SELECT DISTINCT usuario_id 
                    FROM seguimiento_habitos 
                    WHERE fecha > DATE_SUB(NOW(), INTERVAL 24 HOUR)
                    UNION
                    SELECT DISTINCT usuario_id 
                    FROM estados_animo 
                    WHERE fecha_registro > DATE_SUB(NOW(), INTERVAL 24 HOUR)
                `);

                if (users.length === 0) {
                    console.log('   ℹ️ No hay usuarios con actividad reciente');
                    return;
                }

                console.log(`   📊 Procesando ${users.length} usuarios con actividad reciente...`);
                
                let exitosos = 0;
                for (const user of users) {
                    try {
                        await PiedPiperTrainer.trainUser(user.usuario_id, { deep: false });
                        exitosos++;
                    } catch (error) {
                        console.error(`   ❌ Error con usuario ${user.usuario_id}:`, error.message);
                    }
                }
                
                console.log(`   ✅ ${exitosos}/${users.length} usuarios actualizados`);
                
            } catch (error) {
                console.error('❌ Error en entrenamiento rápido:', error);
            }
        });

        // 3. Limpieza de logs antiguos (cada domingo a las 3:00 AM)
        this.scheduleJob('0 3 * * 0', '🧹 Limpieza de logs', async () => {
            console.log('\n🧹 EJECUTANDO LIMPIEZA DE LOGS ANTIGUOS');
            
            try {
                // Eliminar logs de más de 30 días
                const [result] = await db.query(
                    `DELETE FROM log_entrenamiento 
                     WHERE fecha_inicio < DATE_SUB(NOW(), INTERVAL 30 DAY)`
                );
                
                console.log(`   ✅ ${result.affectedRows} logs antiguos eliminados`);
                
            } catch (error) {
                console.error('❌ Error en limpieza de logs:', error);
            }
        });

        // 4. Actualización de badges (cada lunes a las 4:00 AM)
        this.scheduleJob('0 4 * * 1', '🏆 Actualización de badges', async () => {
            console.log('\n🏆 ACTUALIZANDO BADGES DE USUARIOS');
            
            try {
                // Verificar logros pendientes
                const [usuarios] = await db.query('SELECT id FROM usuarios WHERE estado = "activo"');
                
                let actualizados = 0;
                for (const user of usuarios) {
                    // Verificar badge de emociones (10 registros)
                    const [emociones] = await db.query(
                        'SELECT COUNT(*) as total FROM estados_animo WHERE usuario_id = ?',
                        [user.id]
                    );
                    
                    if (emociones[0].total >= 10) {
                        await db.query(
                            `INSERT IGNORE INTO logros_obtenidos (usuario_id, logro_id, completado, fecha_obtencion)
                             VALUES (?, 2, true, NOW())`,
                            [user.id]
                        );
                        actualizados++;
                    }
                    
                    // Verificar badge de hábitos (30 completados)
                    const [habitos] = await db.query(
                        'SELECT COUNT(*) as total FROM seguimiento_habitos WHERE usuario_id = ? AND completado = true',
                        [user.id]
                    );
                    
                    if (habitos[0].total >= 30) {
                        await db.query(
                            `INSERT IGNORE INTO logros_obtenidos (usuario_id, logro_id, completado, fecha_obtencion)
                             VALUES (?, 3, true, NOW())`,
                            [user.id]
                        );
                        actualizados++;
                    }
                }
                
                console.log(`   ✅ ${actualizados} badges actualizados`);
                
            } catch (error) {
                console.error('❌ Error actualizando badges:', error);
            }
        });

        // 5. Heartbeat cada hora (solo para verificar que el scheduler funciona)
        this.scheduleJob('0 * * * *', '💓 Heartbeat', () => {
            console.log(`💓 Scheduler activo - ${new Date().toLocaleString()}`);
        });

        this.isRunning = true;
        console.log('✅ Scheduler iniciado correctamente');
        console.log('='.repeat(50));
    }

    /**
     * Programar un job con cron
     */
    scheduleJob(cronExpression, nombre, callback) {
        try {
            const job = cron.schedule(cronExpression, async () => {
                console.log(`\n⏰ EJECUTANDO: ${nombre}`);
                console.log(`   ⏱️  ${new Date().toLocaleString()}`);
                
                const startTime = Date.now();
                
                try {
                    await callback();
                    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                    console.log(`   ✅ ${nombre} completado en ${duration}s`);
                } catch (error) {
                    console.error(`   ❌ Error en ${nombre}:`, error.message);
                }
            });

            this.jobs.push({ nombre, cron: cronExpression, job });
            console.log(`   📌 Programado: ${nombre} (${cronExpression})`);
            
        } catch (error) {
            console.error(`   ❌ Error programando ${nombre}:`, error.message);
        }
    }

    /**
     * Guardar métrica diaria
     */
    async saveDailyMetric(result) {
        try {
            await db.query(
                `INSERT INTO metricas_entrenamiento 
                (usuario_id, tipo_metrica, valor, fecha_medicion)
                VALUES (NULL, 'entrenamiento_diario', ?, NOW())`,
                [result.exitosos || 0]
            );
        } catch (error) {
            console.error('Error guardando métrica:', error);
        }
    }

    /**
     * Detener todos los jobs
     */
    stop() {
        console.log('\n⏹️ DETENIENDO SCHEDULER...');
        
        this.jobs.forEach(({ nombre, job }) => {
            job.stop();
            console.log(`   ⏹️ ${nombre} detenido`);
        });
        
        this.isRunning = false;
        console.log('✅ Scheduler detenido');
    }

    /**
     * Listar todos los jobs programados
     */
    listJobs() {
        console.log('\n📋 JOBS PROGRAMADOS:');
        this.jobs.forEach(({ nombre, cron }) => {
            console.log(`   • ${nombre} (${cron})`);
        });
    }

    /**
     * Ejecutar un job manualmente (para pruebas)
     */
    async runJobNow(nombre) {
        const job = this.jobs.find(j => j.nombre === nombre);
        if (!job) {
            console.log(`❌ Job "${nombre}" no encontrado`);
            return;
        }

        console.log(`\n▶️ EJECUTANDO JOB MANUAL: ${nombre}`);
        await job.callback();
    }
}

export default new Scheduler();