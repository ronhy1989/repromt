import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// =============================================
// POOL DE CONEXIONES - repromt_cognitive
// Soporta Cloud Run (socketPath) y local (host/port)
// =============================================

const poolConfig = {
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'repromt_cognitive',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    charset: 'utf8mb4'
};

// En Cloud Run usamos socketPath; en local, host/port
if (process.env.INSTANCE_UNIX_SOCKET) {
    poolConfig.socketPath = process.env.INSTANCE_UNIX_SOCKET;
    console.log('🔌 BD por socketPath (Cloud Run):', process.env.INSTANCE_UNIX_SOCKET);
} else {
    poolConfig.host = process.env.DB_HOST || '127.0.0.1';
    poolConfig.port = process.env.DB_PORT || 3306;
    console.log('🔌 BD por host/port (local):', poolConfig.host, poolConfig.port);
}

const pool = mysql.createPool(poolConfig);

// =============================================
// FUNCIÓN PARA PROBAR CONEXIÓN
// =============================================
export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT 1 as connected, NOW() as timestamp, VERSION() as version, DATABASE() as db_name');
        connection.release();

        console.log('✅ Base de datos conectada');
        console.log(`   📅 Timestamp: ${rows[0].timestamp}`);
        console.log(`   📦 Versión MySQL: ${rows[0].version}`);
        console.log(`   🗄️  Base de datos: ${rows[0].db_name}`);
        return true;
    } catch (error) {
        console.error('❌ Error de conexión a BD:', error.message);
        return false;
    }
}

// =============================================
// FUNCIÓN PARA EJECUTAR QUERIES
// =============================================
export async function executeQuery(sql, params = []) {
    try {
        const [rows] = await pool.query(sql, params);
        return rows;
    } catch (error) {
        console.error('❌ Error en consulta:', error.message);
        console.error('   📝 SQL:', sql);
        throw error;
    }
}

// =============================================
// FUNCIÓN PARA EJECUTAR PROCEDIMIENTOS ALMACENADOS
// =============================================
export async function executeProcedure(procedureName, params = []) {
    try {
        const placeholders = params.map(() => '?').join(',');
        const sql = `CALL ${procedureName}(${placeholders})`;
        const [rows] = await pool.query(sql, params);
        return rows[0];
    } catch (error) {
        console.error(`❌ Error en procedimiento ${procedureName}:`, error.message);
        throw error;
    }
}

// =============================================
// FUNCIÓN PARA OBTENER ÚLTIMO ID INSERTADO
// =============================================
export async function getLastInsertId() {
    const [rows] = await pool.query('SELECT LAST_INSERT_ID() as id');
    return rows[0].id;
}

// =============================================
// FUNCIONES DE TRANSACCIONES
// =============================================
export async function beginTransaction() {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    return connection;
}

export async function commitTransaction(connection) {
    await connection.commit();
    connection.release();
}

export async function rollbackTransaction(connection) {
    await connection.rollback();
    connection.release();
}

// =============================================
// EXPORT DEFAULT - OBLIGATORIO
// =============================================
export default pool;
