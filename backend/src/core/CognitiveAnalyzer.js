// src/core/CognitiveAnalyzer.js
import db from '../config/database.js';

class CognitiveAnalyzer {
    constructor() {
        this.domainPatterns = {
            usuario: { icon: 'fa-user', color: '#6366F1', category: 'core' },
            cerebro: { icon: 'fa-brain', color: '#8B5CF6', category: 'cognitive' },
            motor: { icon: 'fa-rocket', color: '#10b981', category: 'growth' },
            habito: { icon: 'fa-repeat', color: '#f59e0b', category: 'habits' },
            evento: { icon: 'fa-star', color: '#ec4899', category: 'conscious' },
            recomendacion: { icon: 'fa-lightbulb', color: '#00FFFF', category: 'ai' },
            plugin: { icon: 'fa-puzzle-piece', color: '#a855f7', category: 'system' },
            emocional: { icon: 'fa-heart', color: '#ec4899', category: 'emotional' },
            meta: { icon: 'fa-bullseye', color: '#f59e0b', category: 'goals' },
            comunidad: { icon: 'fa-users', color: '#3b82f6', category: 'social' },
            crisis: { icon: 'fa-life-ring', color: '#ef4444', category: 'emergency' },
            recurso: { icon: 'fa-book', color: '#6366f1', category: 'content' },
            proyecto: { icon: 'fa-lightbulb', color: '#fbbf24', category: 'projects' },
            asistente: { icon: 'fa-robot', color: '#8b5cf6', category: 'ai' },
            logro: { icon: 'fa-trophy', color: '#f59e0b', category: 'achievements' }
        };
    }

    async analyze() {
        console.log('🔍 Analizando base de datos cognitiva...');
        
        const tables = await this.getTables();
        const schema = {};

        for (const table of tables) {
            const columns = await this.getColumns(table);
            const relations = await this.getRelations(table);
            const domainType = this.detectDomainType(table, columns);
            
            schema[table] = {
                name: table,
                displayName: this.formatDisplayName(table),
                domainType,
                icon: this.domainPatterns[domainType]?.icon || 'fa-table',
                color: this.domainPatterns[domainType]?.color || '#64748b',
                category: this.domainPatterns[domainType]?.category || 'generic',
                columns,
                relations,
                primaryKey: this.getPrimaryKey(columns),
                timestamps: this.getTimestamps(columns),
                hasJSON: columns.some(c => c.type === 'json'),
                endpoints: this.generateEndpoints(table, domainType),
                apps: this.getCompatibleApps(table, domainType)
            };
        }

        // Detectar tablas faltantes basado en el frontend
        const missingTables = await this.detectMissingTables(schema);
        
        return {
            existing: schema,
            missing: missingTables,
            total: Object.keys(schema).length,
            apps: this.mapTablesToApps(schema)
        };
    }

    async getTables() {
        const [rows] = await db.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'repromt_cognitive'
        `);
        return rows.map(r => r.TABLE_NAME);
    }

    async getColumns(table) {
        const [rows] = await db.query(`
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                IS_NULLABLE,
                COLUMN_KEY,
                EXTRA,
                CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'repromt_cognitive' 
            AND TABLE_NAME = ?
        `, [table]);
        
        return rows.map(col => ({
            name: col.COLUMN_NAME,
            type: this.mapDataType(col.DATA_TYPE),
            required: col.IS_NULLABLE === 'NO',
            primary: col.COLUMN_KEY === 'PRI',
            autoIncrement: col.EXTRA.includes('auto_increment'),
            maxLength: col.CHARACTER_MAXIMUM_LENGTH
        }));
    }

    async getRelations(table) {
        const [rows] = await db.query(`
            SELECT 
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = 'repromt_cognitive'
            AND TABLE_NAME = ?
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `, [table]);
        
        return rows;
    }

    mapDataType(mysqlType) {
        const map = {
            'int': 'number',
            'bigint': 'number',
            'varchar': 'string',
            'text': 'text',
            'longtext': 'text',
            'datetime': 'date',
            'date': 'date',
            'time': 'time',
            'timestamp': 'date',
            'decimal': 'number',
            'float': 'number',
            'boolean': 'boolean',
            'tinyint': 'boolean',
            'json': 'json'
        };
        return map[mysqlType] || 'string';
    }

    detectDomainType(table, columns) {
        const tableLower = table.toLowerCase();
        
        // Patrones específicos basados en tu frontend
        if (tableLower.includes('estado') && tableLower.includes('animo')) return 'emocional';
        if (tableLower.includes('meta')) return 'meta';
        if (tableLower.includes('comunidad')) return 'comunidad';
        if (tableLower.includes('crisis') || tableLower.includes('urgencia')) return 'crisis';
        if (tableLower.includes('recurso')) return 'recurso';
        if (tableLower.includes('proyecto')) return 'proyecto';
        if (tableLower.includes('asistente') || tableLower.includes('conversacion')) return 'asistente';
        if (tableLower.includes('logro') || tableLower.includes('badge')) return 'logro';
        if (tableLower.includes('profesional')) return 'profesional';
        if (tableLower.includes('cuestionario') || tableLower.includes('test')) return 'cuestionario';
        
        // Patrones existentes
        if (tableLower.includes('usuario')) return 'usuario';
        if (tableLower.includes('cerebro')) return 'cerebro';
        if (tableLower.includes('motor')) return 'motor';
        if (tableLower.includes('habito')) return 'habito';
        if (tableLower.includes('evento')) return 'evento';
        if (tableLower.includes('recomendacion')) return 'recomendacion';
        if (tableLower.includes('plugin')) return 'plugin';
        
        return 'generic';
    }

    getPrimaryKey(columns) {
        const pk = columns.find(c => c.primary);
        return pk ? pk.name : 'id';
    }

    getTimestamps(columns) {
        return {
            created: columns.find(c => c.name.includes('fecha_creacion') || c.name.includes('created')),
            updated: columns.find(c => c.name.includes('timestamp_actualizacion') || c.name.includes('updated'))
        };
    }

    formatDisplayName(table) {
        return table
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    generateEndpoints(table, domainType) {
        const base = {
            list: `GET /api/${table}`,
            get: `GET /api/${table}/:id`,
            create: `POST /api/${table}`,
            update: `PUT /api/${table}/:id`,
            delete: `DELETE /api/${table}/:id`
        };

        const domainEndpoints = {
            emocional: {
                registrar: `POST /api/${table}/registrar`,
                historial: `GET /api/${table}/historial`,
                tendencias: `GET /api/${table}/tendencias`
            },
            meta: {
                progreso: `GET /api/${table}/progreso`,
                completar: `POST /api/${table}/completar`
            },
            comunidad: {
                posts: `GET /api/${table}/posts`,
                comentar: `POST /api/${table}/comentar`,
                like: `POST /api/${table}/like`
            },
            crisis: {
                sos: `POST /api/${table}/sos`,
                contactos: `GET /api/${table}/contactos`
            },
            recurso: {
                recomendar: `GET /api/${table}/recomendar`,
                favorito: `POST /api/${table}/favorito`
            },
            proyecto: {
                ideas: `GET /api/${table}/ideas`,
                tareas: `GET /api/${table}/tareas`
            },
            asistente: {
                chat: `POST /api/${table}/chat`,
                contexto: `GET /api/${table}/contexto`
            },
            logro: {
                obtener: `POST /api/${table}/obtener`,
                compartir: `POST /api/${table}/compartir`
            }
        };

        return {
            ...base,
            ...(domainEndpoints[domainType] || {})
        };
    }

    getCompatibleApps(table, domainType) {
        // Mapear tabla a apps del frontend
        const appMap = {
            emocional: ['emocional', 'dashboard'],
            meta: ['metas', 'dashboard'],
            comunidad: ['comunidad'],
            crisis: ['crisis'],
            recurso: ['recursos', 'audiolibros'],
            proyecto: ['proyectos'],
            asistente: ['asistente'],
            logro: ['logros', 'motivacion'],
            profesional: ['profesionales'],
            cuestionario: ['cuestionarios'],
            habito: ['habitos', 'dashboard'],
            evento: ['dashboard', 'reflexiones'],
            recomendacion: ['dashboard', 'asistente']
        };

        return appMap[domainType] || [table];
    }

    async detectMissingTables(existingSchema) {
        // Apps que requieren tablas específicas
        const requiredTables = {
            emocional: ['estados_animo', 'diarios_emocionales', 'emociones', 'patrones_animo'],
            profesionales: ['profesionales_salud', 'sesiones_terapia', 'citas'],
            metas: ['metas_salud', 'metas_emocionales', 'progreso_metas'],
            comunidad: ['comunidad_experiencias', 'comunidad_comentarios', 'comunidad_likes'],
            crisis: ['recursos_urgencia', 'contactos_apoyo', 'plan_seguridad'],
            cuestionarios: ['cuestionario_apgar', 'cuestionario_bai', 'cuestionario_rosenberg'],
            recursos: ['contenido_educativo', 'audiolibros', 'paisajes_sonoros'],
            proyectos: ['proyectos', 'ideas', 'tareas_proyecto'],
            asistente: ['conversaciones', 'mensajes', 'contexto_asistente'],
            logros: ['logros', 'logros_obtenidos', 'badges']
        };

        const missing = {};

        for (const [app, tables] of Object.entries(requiredTables)) {
            const missingTables = tables.filter(t => !existingSchema[t]);
            if (missingTables.length > 0) {
                missing[app] = {
                    appName: this.getAppDisplayName(app),
                    tables: missingTables,
                    sql: this.generateCreateSQL(app, missingTables)
                };
            }
        }

        return missing;
    }

    getAppDisplayName(app) {
        const names = {
            emocional: 'Sistema Emocional',
            profesionales: 'Profesionales de Salud',
            metas: 'Gestión de Metas',
            comunidad: 'Comunidad',
            crisis: 'Gestión de Crisis',
            cuestionarios: 'Cuestionarios',
            recursos: 'Recursos Educativos',
            proyectos: 'Proyectos e Ideas',
            asistente: 'Asistente IA',
            logros: 'Logros y Motivación'
        };
        return names[app] || app;
    }

    generateCreateSQL(app, tables) {
        const sqlTemplates = {
            emocional: `
                CREATE TABLE estados_animo (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    usuario_id BIGINT NOT NULL,
                    estado VARCHAR(50) NOT NULL,
                    intensidad INT CHECK (intensidad BETWEEN 1 AND 10),
                    notas TEXT,
                    factores JSON,
                    fecha_registro DATETIME DEFAULT NOW(),
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                    INDEX idx_usuario_fecha (usuario_id, fecha_registro)
                );
            `,
            comunidad: `
                CREATE TABLE comunidad_experiencias (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    usuario_id BIGINT NOT NULL,
                    titulo VARCHAR(200) NOT NULL,
                    contenido TEXT NOT NULL,
                    categoria VARCHAR(50),
                    likes INT DEFAULT 0,
                    fecha_publicacion DATETIME DEFAULT NOW(),
                    activo BOOLEAN DEFAULT true,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                    FULLTEXT idx_busqueda (titulo, contenido)
                );
            `,
            crisis: `
                CREATE TABLE recursos_urgencia (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    titulo VARCHAR(200) NOT NULL,
                    descripcion TEXT,
                    telefono VARCHAR(20),
                    horario_atencion VARCHAR(100),
                    url_recurso VARCHAR(500),
                    prioridad ENUM('alta', 'media', 'baja') DEFAULT 'alta',
                    activo BOOLEAN DEFAULT true
                );
            `
            // Más templates según necesidad
        };

        return tables.map(t => sqlTemplates[t] || `-- TODO: Crear tabla ${t}`).join('\n\n');
    }

    mapTablesToApps(schema) {
        const apps = {};
        
        for (const [table, config] of Object.entries(schema)) {
            const compatibleApps = config.apps || [];
            for (const app of compatibleApps) {
                if (!apps[app]) apps[app] = [];
                apps[app].push(table);
            }
        }

        return apps;
    }
}

export default new CognitiveAnalyzer();
