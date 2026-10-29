import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';  // ✅ AGREGADO: Importar CORS
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';

// ================= Swagger =================
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

// ================= Generador Inteligente =================
import endpointGenerator from './core/EndpointGenerator.js';

// ================= Scheduler para tareas automáticas =================
import Scheduler from './core/Scheduler.js';

// Configuración
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// ================= 🛡️ CONFIGURACIÓN CORS COMPLETA =================
// ✅ SOLUCIÓN PARA EL ERROR DE CORS
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://repromt-api-856844207258.us-central1.run.app',
    'http://127.0.0.1:8000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'file://',
    'https://storage.googleapis.com',
    'https://repromt-frontend-gmp-demo-project-100798822.storage.googleapis.com',
    'https://repromt-api-856844207258.us-central1.run.app'
];

app.use(cors({
    origin: function(origin, callback) {
        // Permitir solicitudes sin origen (como Postman o móviles)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost')) {
            callback(null, true);
        } else {
            console.log('⚠️ CORS bloqueado para:', origin);
            callback(null, true); // En desarrollo, permitir todos
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// ✅ Middleware para logging de CORS (debug)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// Middleware de seguridad
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    skipSuccessfulRequests: true
});
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ================= 📋 LOG DE TODAS LAS RUTAS =================
console.log('\n' + '='.repeat(70));
console.log('🔧 CARGANDO RUTAS DEL SISTEMA...');
console.log('='.repeat(70));

// 🔹 MODIFICADO: AÑADIR memoriaRoutes
let authRoutes, habitRoutes, piedpiperRoutes, syncRoutes, memoriaRoutes;  // 🆕 AGREGADO memoriaRoutes

try {
    authRoutes = (await import('./routes/authRoutes.js')).default;
    console.log('✅ authRoutes cargado correctamente');
} catch (error) {
    console.error('❌ ERROR CARGANDO authRoutes:', error.message);
    authRoutes = express.Router();
}

try {
    habitRoutes = (await import('./routes/habitRoutes.js')).default;
    console.log('✅ habitRoutes cargado correctamente');
} catch (error) {
    console.error('❌ ERROR CARGANDO habitRoutes:', error.message);
    habitRoutes = express.Router();
}

try {
    piedpiperRoutes = (await import('./routes/piedpiperRoutes.js')).default;
    console.log('✅ piedpiperRoutes cargado correctamente');
} catch (error) {
    console.error('❌ ERROR CARGANDO piedpiperRoutes:', error.message);
    piedpiperRoutes = express.Router();
}

// 🆕 AGREGAR: Cargar syncRoutes
try {
    syncRoutes = (await import('./routes/syncRoutes.js')).default;
    console.log('✅ syncRoutes cargado correctamente');
} catch (error) {
    console.error('❌ ERROR CARGANDO syncRoutes:', error.message);
    syncRoutes = express.Router();
}

// 🆕 AGREGAR: Cargar memoriaRoutes
try {
    memoriaRoutes = (await import('./routes/memoriaRoutes.js')).default;
    console.log('✅ memoriaRoutes cargado correctamente');
} catch (error) {
    console.error('❌ ERROR CARGANDO memoriaRoutes:', error.message);
    memoriaRoutes = express.Router();
}

// ================= 📍 RUTAS MANUALES =================
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/piedpiper', piedpiperRoutes);
app.use('/api/sync', syncRoutes);  // 🆕 AGREGADO
app.use('/api/memoria', memoriaRoutes);  // 🆕 AGREGADO

// ================= 🤖 GENERADOR INTELIGENTE DE ENDPOINTS =================
app.use('/api', async (req, res, next) => {
    try {
        if (!global.endpointRouter) {
            console.log('\n🤖 Inicializando generador inteligente de endpoints...');
            console.time('⏱️  Tiempo de generación');
            
            global.endpointRouter = await endpointGenerator.initialize();
            
            console.timeEnd('⏱️  Tiempo de generación');
            console.log('✅ Endpoints inteligentes generados y listos');
            console.log('📌 Descubre todos los endpoints en: https://repromt-api-856844207258.us-central1.run.app/api/system/discover\n');
        }
        
        global.endpointRouter(req, res, next);
    } catch (error) {
        console.error('❌ Error en generador inteligente:', error);
        next(error);
    }
});

// ================= 📚 Swagger UI =================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'REPROMT API Docs - Ronhy Farfán',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
        docExpansion: 'list'
    }
}));

console.log('📚 Documentación API: https://repromt-api-856844207258.us-central1.run.app/api-docs');

// ================= 💚 RUTA DE SALUD PERSONALIZADA =================
app.get('/api/health', async (req, res) => {
    const dbStatus = await testConnection();
    
    res.status(200).json({
        success: true,
        message: '🚀 Repromt Backend - Sistema Ronhy Farfán',
        usuario: 'Ronhy Santiago Farfan Franco',
        email: 'ronhy.farfan.1989@gmail.com',
        region: 'Lima, Perú (GMT-5)',
        timestamp: new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' }),
        entorno: 'development',
        base_datos: dbStatus ? 'conectado' : 'desconectado',
        version: '1.0.0',
        puerto: PORT,
        documentacion: 'https://repromt-api-856844207258.us-central1.run.app/api-docs',
        generador_inteligente: 'https://repromt-api-856844207258.us-central1.run.app/api/system/discover',
        scheduler: Scheduler.isRunning ? '✅ activo' : '⏳ iniciando',
        endpoints: {
            auth: '/api/auth',
            habits: '/api/habits',
            piedpiper: '/api/piedpiper',
            sync: '/api/sync',  // 🆕 AGREGADO
            memoria: '/api/memoria',  // 🆕 AGREGADO
            inteligentes: '/api/* (auto-generados)',
            health: '/api/health',
            docs: '/api-docs',
            discover: '/api/system/discover'
        }
    });
});

// ================= 🏠 RUTA PRINCIPAL (CON TODAS LAS URLS) =================
app.get('/', (req, res) => {
    res.json({
        mensaje: '🎯 Bienvenido a Repromt - Sistema de Desarrollo Personal Inteligente',
        desarrollador: 'Ronhy Santiago Farfan Franco',
        email: 'ronhy.farfan.1989@gmail.com',
        version: '1.0.0',
        
        // ================= 📍 TODAS LAS URLS DISPONIBLES =================
        urls_principales: {
            home: 'https://repromt-api-856844207258.us-central1.run.app/',
            health: 'https://repromt-api-856844207258.us-central1.run.app/api/health',
            documentacion_swagger: 'https://repromt-api-856844207258.us-central1.run.app/api-docs',
            descubrir_api: 'https://repromt-api-856844207258.us-central1.run.app/api/system/discover'
        },
        
        // ================= 🔐 AUTENTICACIÓN =================
        auth: {
            registrar: {
                metodo: 'POST',
                url: 'https://repromt-api-856844207258.us-central1.run.app/api/auth/register',
                body: { nombre: 'string', email: 'string', password: 'string' }
            },
            login: {
                metodo: 'POST',
                url: 'https://repromt-api-856844207258.us-central1.run.app/api/auth/login',
                body: { email: 'string', password: 'string' }
            },
            perfil: {
                metodo: 'GET',
                url: 'https://repromt-api-856844207258.us-central1.run.app/api/auth/profile',
                auth: 'Bearer token'
            }
        },
        
        // ================= 📊 HÁBITOS =================
        habitos: {
            listar: 'GET https://repromt-api-856844207258.us-central1.run.app/api/habits',
            crear: 'POST https://repromt-api-856844207258.us-central1.run.app/api/habits',
            estadisticas: 'GET https://repromt-api-856844207258.us-central1.run.app/api/habits/stats',
            seguimiento: 'POST https://repromt-api-856844207258.us-central1.run.app/api/habits/track',
            seguimiento_diario: 'GET https://repromt-api-856844207258.us-central1.run.app/api/habits/tracking/daily'
        },
        
        // ================= 🧠 PIED PIPER IA =================
        piedpiper: {
            recomendaciones: 'GET https://repromt-api-856844207258.us-central1.run.app/api/piedpiper/recommendations',
            analisis: 'POST https://repromt-api-856844207258.us-central1.run.app/api/piedpiper/analyze',
            dashboard: 'GET https://repromt-api-856844207258.us-central1.run.app/api/piedpiper/dashboard',
            estadisticas: 'GET https://repromt-api-856844207258.us-central1.run.app/api/piedpiper/stats',
            marcar_vista: 'PUT https://repromt-api-856844207258.us-central1.run.app/api/piedpiper/:id/view',
            aplicar_feedback: 'POST https://repromt-api-856844207258.us-central1.run.app/api/piedpiper/:id/apply',
            entrenar: 'POST https://repromt-api-856844207258.us-central1.run.app/api/piedpiper/train',
            estado_entrenamiento: 'GET https://repromt-api-856844207258.us-central1.run.app/api/piedpiper/train/status',
            historial_entrenamiento: 'GET https://repromt-api-856844207258.us-central1.run.app/api/piedpiper/train/history'
        },
        
        // ================= 🆕 SINCRONIZACIÓN =================
        sync: {
            global: 'POST https://repromt-api-856844207258.us-central1.run.app/api/sync/global',
            usuario: 'GET https://repromt-api-856844207258.us-central1.run.app/api/sync/user/:userId',
            app: 'POST https://repromt-api-856844207258.us-central1.run.app/api/sync/app',
            all: 'POST https://repromt-api-856844207258.us-central1.run.app/api/sync/all'
        },
        
        // ================= 🧠 MEMORIA (NUEVO) =================
        memoria: {  // 🆕 AGREGADO
            crear: 'POST https://repromt-api-856844207258.us-central1.run.app/api/memoria/crear',
            preguntar: 'POST https://repromt-api-856844207258.us-central1.run.app/api/memoria/preguntar',
            listar: 'GET https://repromt-api-856844207258.us-central1.run.app/api/memoria/listar',
            heads_up: 'GET https://repromt-api-856844207258.us-central1.run.app/api/memoria/heads-up',
            colecciones: 'GET https://repromt-api-856844207258.us-central1.run.app/api/memoria/colecciones',
            patrones: 'GET https://repromt-api-856844207258.us-central1.run.app/api/memoria/patrones',
            contexto: 'GET https://repromt-api-856844207258.us-central1.run.app/api/memoria/contexto/:memoriaId',
            estadisticas: 'GET https://repromt-api-856844207258.us-central1.run.app/api/memoria/estadisticas',
            detalle: 'GET https://repromt-api-856844207258.us-central1.run.app/api/memoria/:id',
            eliminar: 'DELETE https://repromt-api-856844207258.us-central1.run.app/api/memoria/:id',
            crear_coleccion: 'POST https://repromt-api-856844207258.us-central1.run.app/api/memoria/coleccion',
            asignar_coleccion: 'POST https://repromt-api-856844207258.us-central1.run.app/api/memoria/asignar-coleccion'
        },
        
        // ================= 🤖 ENDPOINTS INTELIGENTES (Auto-generados) =================
        inteligentes: {
            descubrir_todas: 'GET https://repromt-api-856844207258.us-central1.run.app/api/system/discover',
            listar_tabla: 'GET https://repromt-api-856844207258.us-central1.run.app/api/[nombre_tabla]',
            obtener_registro: 'GET https://repromt-api-856844207258.us-central1.run.app/api/[nombre_tabla]/:id',
            crear_registro: 'POST https://repromt-api-856844207258.us-central1.run.app/api/[nombre_tabla]',
            actualizar_registro: 'PUT https://repromt-api-856844207258.us-central1.run.app/api/[nombre_tabla]/:id',
            eliminar_registro: 'DELETE https://repromt-api-856844207258.us-central1.run.app/api/[nombre_tabla]/:id'
        },
        
        // ================= ⏰ TAREAS AUTOMÁTICAS =================
        tareas_automaticas: {
            entrenamiento_nocturno: '🕑 2:00 AM - Entrenamiento profundo diario',
            entrenamiento_rapido: '🕕 Cada 6 horas - Análisis de patrones',
            limpieza_logs: '🕒 Domingos 3:00 AM - Limpieza de logs antiguos',
            actualizar_badges: '🕓 Lunes 4:00 AM - Actualización de logros'
        },
        
        // ================= 📋 TABLAS DISPONIBLES =================
        tablas_disponibles: [
            'usuarios', 'cerebros_digitales', 'motores_crecimiento',
            'estados_animo', 'diarios_emocionales', 'emociones', 'patrones_animo',
            'habitos_neuronales', 'seguimiento_habitos',
            'metas_salud', 'metas_emocionales', 'progreso_metas', 'logros',
            'comunidad_experiencias', 'comunidad_comentarios', 'comunidad_likes',
            'profesionales_salud', 'sesiones_terapia', 'citas',
            'recursos_urgencia', 'contactos_apoyo', 'plan_seguridad', 'registros_crisis',
            'contenido_educativo', 'audiolibros', 'paisajes_sonoros',
            'proyectos', 'ideas', 'tareas_proyecto',
            'conversaciones', 'mensajes', 'contexto_asistente',
            'logros_obtenidos', 'badges',
            'plugins', 'user_plugins', 'plugin_permissions'
        ],
        
        // ================= 📖 DOCUMENTACIÓN =================
        documentacion: 'https://repromt-api-856844207258.us-central1.run.app/api-docs',
        sugerencias: [
            '👉 Usa /api/system/discover para descubrir TODOS los endpoints disponibles',
            '👉 Prueba los endpoints en Swagger: https://repromt-api-856844207258.us-central1.run.app/api-docs',
            '👉 Los endpoints inteligentes se generan automáticamente desde la BD',
            '👉 Pied Piper genera recomendaciones basadas en tus datos'
        ]
    });
});

// ================= 🔍 RUTA PARA LISTAR TODOS LOS ENDPOINTS =================
app.get('/api/endpoints', (req, res) => {
    const endpoints = {
        auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/profile'],
        habits: ['GET /api/habits', 'POST /api/habits', 'GET /api/habits/stats', 'POST /api/habits/track', 'GET /api/habits/tracking/daily'],
        piedpiper: [
            'GET /api/piedpiper/recommendations',
            'POST /api/piedpiper/analyze',
            'GET /api/piedpiper/dashboard',
            'GET /api/piedpiper/stats',
            'PUT /api/piedpiper/:id/view',
            'POST /api/piedpiper/:id/apply',
            'POST /api/piedpiper/train'
        ],
        sync: [  // 🆕 AGREGADO
            'POST /api/sync/global',
            'GET /api/sync/user/:userId',
            'POST /api/sync/app',
            'POST /api/sync/all'
        ],
        memoria: [  // 🆕 AGREGADO
            'POST /api/memoria/crear',
            'POST /api/memoria/preguntar',
            'POST /api/memoria/asignar-coleccion',
            'POST /api/memoria/coleccion',
            'GET /api/memoria/listar',
            'GET /api/memoria/heads-up',
            'GET /api/memoria/colecciones',
            'GET /api/memoria/patrones',
            'GET /api/memoria/contexto/:memoriaId',
            'GET /api/memoria/estadisticas',
            'GET /api/memoria/:id',
            'DELETE /api/memoria/:id'
        ],
        system: [
            'GET /api/health',
            'GET /api/system/discover',
            'GET /api/endpoints'
        ],
        documentacion: ['GET /api-docs'],
        endpoints_inteligentes: 'Usa GET /api/system/discover para ver todas las tablas y sus endpoints'
    };
    
    res.json({
        success: true,
        total_endpoints: Object.values(endpoints).flat().length,
        endpoints: endpoints,
        nota: 'Para endpoints dinámicos de cada tabla, visita /api/system/discover'
    });
});

// ================= ❌ MANEJO DE RUTAS NO ENCONTRADAS =================
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `❌ Ruta no encontrada: ${req.originalUrl}`,
        sugerencias: [
            '📚 Verifica la documentación en: https://repromt-api-856844207258.us-central1.run.app/api-docs',
            '🔍 Descubre todos los endpoints en: https://repromt-api-856844207258.us-central1.run.app/api/system/discover',
            '📋 Lista de endpoints: https://repromt-api-856844207258.us-central1.run.app/api/endpoints',
            '💚 Estado del sistema: https://repromt-api-856844207258.us-central1.run.app/api/health'
        ]
    });
});

// ================= 🚀 INICIAR SERVIDOR =================
app.listen(PORT, async () => {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 REPROMT BACKEND - SISTEMA RONHY FARFAN');
    console.log('='.repeat(70));
    console.log(`📍 Puerto: ${PORT}`);
    console.log(`👤 Usuario: Ronhy Santiago Farfan Franco`);
    console.log(`📧 Email: ronhy.farfan.1989@gmail.com`);
    console.log(`🌎 Región: Lima, Perú (GMT-5)`);
    console.log(`🗄️  Base de datos: repromt_cognitive`);
    console.log(`📚 Documentación interactiva: http://localhost:${PORT}/api-docs`);
    console.log(`🔍 Descubrir APIs inteligentes: http://localhost:${PORT}/api/system/discover`);
    console.log(`📋 Lista de endpoints: http://localhost:${PORT}/api/endpoints`);
    
    // ================= 📋 MOSTRAR TODAS LAS URLS =================
    console.log('\n' + '='.repeat(70));
    console.log('📋 TODAS LAS URLS DISPONIBLES:');
    console.log('='.repeat(70));
    console.log(`🏠 HOME:               http://localhost:${PORT}/`);
    console.log(`💚 HEALTH:             http://localhost:${PORT}/api/health`);
    console.log(`📚 SWAGGER:            http://localhost:${PORT}/api-docs`);
    console.log(`🔍 DISCOVER:           http://localhost:${PORT}/api/system/discover`);
    console.log(`📋 ENDPOINTS:          http://localhost:${PORT}/api/endpoints`);
    console.log(`🔐 AUTH LOGIN:         POST http://localhost:${PORT}/api/auth/login`);
    console.log(`📊 HÁBITOS:            GET http://localhost:${PORT}/api/habits`);
    console.log(`🧠 PIED PIPER:         GET http://localhost:${PORT}/api/piedpiper/dashboard`);
    console.log(`🔄 SYNC GLOBAL:        POST http://localhost:${PORT}/api/sync/global`);  // 🆕 AGREGADO
    console.log(`🧠 MEMORIA:            POST http://localhost:${PORT}/api/memoria/crear`);  // 🆕 AGREGADO
    console.log(`🤖 ENDPOINTS DINÁMICOS: GET http://localhost:${PORT}/api/[nombre_tabla]`);
    console.log('='.repeat(70));
    
    // Probar conexión a BD
    await testConnection();
    
    // ================= INICIAR SCHEDULER =================
    console.log('\n⏰ INICIANDO TAREAS AUTOMÁTICAS...');
    setTimeout(() => {
        Scheduler.start();
    }, 2000);
    
    console.log('\n✅ SERVIDOR LISTO - ESPERANDO SOLICITUDES...');
    console.log('='.repeat(70));
});

// ================= 🛑 MANEJO DE CIERRE GRACEFUL =================
process.on('SIGINT', () => {
    console.log('\n\n⚠️  DETENIENDO SERVIDOR...');
    if (Scheduler.isRunning) {
        Scheduler.stop();
    }
    console.log('✅ Servidor detenido correctamente');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n⚠️  DETENIENDO SERVIDOR...');
    if (Scheduler.isRunning) {
        Scheduler.stop();
    }
    console.log('✅ Servidor detenido correctamente');
    process.exit(0);
});