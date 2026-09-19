import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection, usuario, closePool } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Repromt Backend'
  });
});

// Ruta para obtener usuario
app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const user = await usuario.findById(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    // No enviar password_hash
    delete user.password_hash;
    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Iniciar servidor
async function startServer() {
  console.log('🚀 Iniciando servidor Repromt...\n');
  
  // Probar conexión a la base de datos
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ No se pudo iniciar el servidor sin conexión a la base de datos');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log(`\n✨ Servidor iniciado correctamente`);
    console.log(`📡 Servidor escuchando en http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
  
  // Manejar cierre graceful
  process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando servidor...');
    await closePool();
    process.exit(0);
  });
}

startServer();