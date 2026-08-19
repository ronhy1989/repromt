import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuración para XAMPP
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'repromt_cognitive',
  charset: 'utf8mb4'
};

const pool = mysql.createPool(dbConfig);

// Función para probar conexión
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ CONEXIÓN EXITOSA A MYSQL');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ ERROR DE CONEXIÓN:');
    console.error('   Mensaje:', error.message);
    console.error('   💡 SOLUCIÓN: Abre XAMPP → Start MySQL');
    return false;
  }
};

export default pool;
