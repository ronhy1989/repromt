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
const PORT = 8000;

// ================= 🛡️ CONFIGURACIÓN CORS COMPLETA =================
// ✅ SOLUCIÓN PARA EL ERROR DE CORS
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'file://'  // Para desarrollo local directo
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

let authRoutes, habitRoutes, piedpiperRoutes, syncRoutes;  // 🆕 AGREGADO syncRoutes

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

// ================= 📍 RUTAS MANUALES =================
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/piedpiper', piedpiperRoutes);
app.use('/api/sync', syncRoutes);  // 🆕 AGREGADO

// ================= 🤖 GENERADOR INTELIGENTE DE ENDPOINTS =================
app.use('/api', async (req, res, next) => {
    try {
        if (!global.endpointRouter) {
            console.log('\n🤖 Inicializando generador inteligente de endpoints...');
            console.time('⏱️  Tiempo de generación');
            
            global.endpointRouter = await endpointGenerator.initialize();
            
            console.timeEnd('⏱️  Tiempo de generación');
            console.log('✅ Endpoints inteligentes generados y listos');
            console.log('📌 Descubre todos los endpoints en: http://localhost:8000/api/system/discover\n');
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

console.log('📚 Documentación API: http://localhost:8000/api-docs');

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
        documentacion: 'http://localhost:8000/api-docs',
        generador_inteligente: 'http://localhost:8000/api/system/discover',
        scheduler: Scheduler.isRunning ? '✅ activo' : '⏳ iniciando',
        endpoints: {
            auth: '/api/auth',
            habits: '/api/habits',
            piedpiper: '/api/piedpiper',
            sync: '/api/sync',  // 🆕 AGREGADO
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
            home: 'http://localhost:8000/',
            health: 'http://localhost:8000/api/health',
            documentacion_swagger: 'http://localhost:8000/api-docs',
            descubrir_api: 'http://localhost:8000/api/system/discover'
        },
        
        // ================= 🔐 AUTENTICACIÓN =================
        auth: {
            registrar: {
                metodo: 'POST',
                url: 'http://localhost:8000/api/auth/register',
                body: { nombre: 'string', email: 'string', password: 'string' }
            },
            login: {
                metodo: 'POST',
                url: 'http://localhost:8000/api/auth/login',
                body: { email: 'string', password: 'string' }
            },
            perfil: {
                metodo: 'GET',
                url: 'http://localhost:8000/api/auth/profile',
                auth: 'Bearer token'
            }
        },
        
        // ================= 📊 HÁBITOS =================
        habitos: {
            listar: 'GET http://localhost:8000/api/habits',
            crear: 'POST http://localhost:8000/api/habits',
            estadisticas: 'GET http://localhost:8000/api/habits/stats',
            seguimiento: 'POST http://localhost:8000/api/habits/track',
            seguimiento_diario: 'GET http://localhost:8000/api/habits/tracking/daily'
        },
        
        // ================= 🧠 PIED PIPER IA =================
        piedpiper: {
            recomendaciones: 'GET http://localhost:8000/api/piedpiper/recommendations',
            analisis: 'POST http://localhost:8000/api/piedpiper/analyze',
            dashboard: 'GET http://localhost:8000/api/piedpiper/dashboard',
            estadisticas: 'GET http://localhost:8000/api/piedpiper/stats',
            marcar_vista: 'PUT http://localhost:8000/api/piedpiper/:id/view',
            aplicar_feedback: 'POST http://localhost:8000/api/piedpiper/:id/apply',
            entrenar: 'POST http://localhost:8000/api/piedpiper/train',
            estado_entrenamiento: 'GET http://localhost:8000/api/piedpiper/train/status',
            historial_entrenamiento: 'GET http://localhost:8000/api/piedpiper/train/history'
        },
        
        // ================= 🆕 SINCRONIZACIÓN =================
        sync: {
            global: 'POST http://localhost:8000/api/sync/global',
            usuario: 'GET http://localhost:8000/api/sync/user/:userId',
            app: 'POST http://localhost:8000/api/sync/app',
            all: 'POST http://localhost:8000/api/sync/all'
        },
        
        // ================= 🤖 ENDPOINTS INTELIGENTES (Auto-generados) =================
        inteligentes: {
            descubrir_todas: 'GET http://localhost:8000/api/system/discover',
            listar_tabla: 'GET http://localhost:8000/api/[nombre_tabla]',
            obtener_registro: 'GET http://localhost:8000/api/[nombre_tabla]/:id',
            crear_registro: 'POST http://localhost:8000/api/[nombre_tabla]',
            actualizar_registro: 'PUT http://localhost:8000/api/[nombre_tabla]/:id',
            eliminar_registro: 'DELETE http://localhost:8000/api/[nombre_tabla]/:id'
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
        documentacion: 'http://localhost:8000/api-docs',
        sugerencias: [
            '👉 Usa /api/system/discover para descubrir TODOS los endpoints disponibles',
            '👉 Prueba los endpoints en Swagger: http://localhost:8000/api-docs',
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
            '📚 Verifica la documentación en: http://localhost:8000/api-docs',
            '🔍 Descubre todos los endpoints en: http://localhost:8000/api/system/discover',
            '📋 Lista de endpoints: http://localhost:8000/api/endpoints',
            '💚 Estado del sistema: http://localhost:8000/api/health'
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