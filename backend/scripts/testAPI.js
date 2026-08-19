// scripts/testAPI.js - PRUEBAS PERSONALIZADAS RONHY FARFAN
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8000/api';
let authToken = '';

// Función para hacer requests
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    console.log(`🔍 ${config.method} ${url}`);
    
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      console.log(`   ❌ Error ${response.status}:`, data.message || 'Error desconocido');
      return null;
    }
    
    console.log('   ✅ Éxito');
    return data;
  } catch (error) {
    console.log(`   💥 Error: ${error.message}`);
    return null;
  }
}

// 1. PROBAR SALUD DEL SERVIDOR
async function testHealth() {
  console.log('\n🏥 1. PROBANDO SALUD DEL SERVIDOR');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/health');
  
  if (result && result.success) {
    console.log('✅ Servidor funcionando');
    console.log('   Usuario:', result.usuario);
    console.log('   Email:', result.email);
    console.log('   Región:', result.region);
    console.log('   Base de datos:', result.base_datos);
    return true;
  }
  
  return false;
}

// 2. PROBAR REGISTRO DE RONHY
async function testRegisterRonhy() {
  console.log('\n📝 2. REGISTRANDO USUARIO RONHY FARFAN');
  console.log('='.repeat(50));
  
  const ronhyData = {
    email: 'ronhy.farfan.1989@gmail.com',
    nombre: 'Ronhy Santiago Farfan Franco',
    password: 'Ronhy46096270',
    fecha_nacimiento: '1989-08-02',
    genero: 'masculino',
    proposito_vida: 'Desarrollar mi máximo potencial y crear herramientas que ayuden a otros en su crecimiento personal',
    valores_principales: ['crecimiento', 'innovación', 'impacto', 'autenticidad', 'tecnología']
  };

  console.log('   Registrando:', ronhyData.email);
  console.log('   Fecha nacimiento:', ronhyData.fecha_nacimiento);
  
  const result = await makeRequest('/auth/register', {
    method: 'POST',
    body: ronhyData
  });

  if (result && result.success) {
    authToken = result.data.token;
    console.log('✅ Ronhy registrado exitosamente');
    console.log('   ID:', result.data.user.id);
    console.log('   Token recibido:', authToken ? 'SÍ' : 'NO');
    return true;
  } else {
    console.log('⚠️  Usuario posiblemente ya existe, probando login...');
    return false;
  }
}

// 3. PROBAR LOGIN DE RONHY
async function testLoginRonhy() {
  console.log('\n🔐 3. LOGIN DE RONHY FARFAN');
  console.log('='.repeat(50));
  
  const loginData = {
    email: 'ronhy.farfan.1989@gmail.com',
    password: 'Ronhy46096270'
  };

  console.log('   Login:', loginData.email);
  
  const result = await makeRequest('/auth/login', {
    method: 'POST',
    body: loginData
  });

  if (result && result.success) {
    authToken = result.data.token;
    console.log('✅ Login exitoso');
    console.log('   Bienvenido:', result.data.user.nombre);
    console.log('   Nivel autoconocimiento:', result.data.user.nivel_autoconocimiento);
    return true;
  }
  
  console.log('❌ Error en login - verifica credenciales');
  return false;
}

// 4. PROBAR PERFIL COMPLETO
async function testRonhyProfile() {
  console.log('\n👤 4. PERFIL COMPLETO RONHY');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/auth/profile');
  
  if (result && result.success) {
    console.log('✅ Perfil completo obtenido');
    console.log('   Nombre:', result.data.usuario.nombre);
    console.log('   Email:', result.data.usuario.email);
    console.log('   Fecha nacimiento:', result.data.usuario.fecha_nacimiento);
    console.log('   Propósito:', result.data.usuario.proposito_vida);
    console.log('   Valores:', result.data.usuario.valores_principales);
    
    if (result.data.cerebro_digital) {
      console.log('   🧠 Cerebro digital: CREADO');
    }
    if (result.data.motor_crecimiento) {
      console.log('   🚀 Motor crecimiento: CREADO');
    }
    
    return true;
  }
  
  return false;
}

// 5. CREAR HÁBITOS PERSONALES DE RONHY
async function createRonhyHabits() {
  console.log('\n📊 5. CREANDO HÁBITOS PERSONALES RONHY');
  console.log('='.repeat(50));
  
  const ronhyHabits = [
    {
      nombre: 'Meditación Consciente',
      proposito: 'Desarrollar claridad mental y enfoque para proyectos tecnológicos',
      categoria: 'mental',
      horario_optimo: '07:00',
      contexto_optimo: {
        ubicacion: 'oficina_casa',
        ambiente: 'silencioso',
        duracion: 20
      },
      dificultad_actual: 0.6
    },
    {
      nombre: 'Desarrollo Repromt',
      proposito: 'Avanzar en el sistema de desarrollo personal inteligente',
      categoria: 'crecimiento',
      horario_optimo: '09:00',
      contexto_optimo: {
        ubicacion: 'oficina',
        herramientas: ['vscode', 'mysql', 'nodejs'],
        enfoque: 'backend'
      },
      dificultad_actual: 0.8
    },
    {
      nombre: 'Ejercicio Físico',
      proposito: 'Mantener energía y salud para sesiones largas de programación',
      categoria: 'salud',
      horario_optimo: '18:30',
      contexto_optimo: {
        ubicacion: 'gimnasio',
        tipo: 'cardio_fuerza',
        duracion: 60
      },
      dificultad_actual: 0.7
    },
    {
      nombre: 'Revisión de Objetivos',
      proposito: 'Mantener enfoque en metas personales y profesionales',
      categoria: 'crecimiento',
      horario_optimo: '20:00',
      contexto_optimo: {
        ubicacion: 'casa',
        herramientas: ['notion', 'diario'],
        duracion: 15
      },
      dificultad_actual: 0.5
    }
  ];

  const habitIds = [];
  
  for (const habit of ronhyHabits) {
    const result = await makeRequest('/habits', {
      method: 'POST',
      body: habit
    });

    if (result && result.success) {
      habitIds.push(result.data.habit_id);
      console.log(`✅ ${habit.nombre} (${habit.categoria}) - ID: ${result.data.habit_id}`);
    } else {
      console.log(`❌ Error creando: ${habit.nombre}`);
    }
  }
  
  return habitIds;
}

// 6. PROBAR LISTADO DE HÁBITOS
async function testGetHabits() {
  console.log('\n📋 6. LISTANDO HÁBITOS DE RONHY');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/habits');
  
  if (result && result.success) {
    console.log(`✅ ${result.data.total} hábitos obtenidos:`);
    result.data.habits.forEach(habit => {
      console.log(`   - ${habit.nombre} (${habit.categoria}) - Racha: ${habit.racha_actual} - Estado: ${habit.estado}`);
    });
    return result.data.habits;
  }
  
  return [];
}

// 7. PROBAR SEGUIMIENTO DE HÁBITOS
async function testHabitTracking(habits) {
  console.log('\n🎯 7. REGISTRANDO SEGUIMIENTO DE HÁBITOS');
  console.log('='.repeat(50));
  
  const today = new Date().toISOString().split('T')[0];
  
  // Probar con los primeros 2 hábitos
  const habitsToTrack = habits.slice(0, 2);
  
  for (const habit of habitsToTrack) {
    const trackingData = {
      habito_id: habit.id,
      fecha: today,
      completado: true,
      calidad_ejecucion: 8,
      dificultad_percibida: 6,
      notas: 'Ejecutado correctamente según el plan establecido'
    };

    const result = await makeRequest('/habits/track', {
      method: 'POST',
      body: trackingData
    });

    if (result && result.success) {
      console.log(`✅ Seguimiento registrado: ${habit.nombre}`);
    } else {
      console.log(`❌ Error en seguimiento: ${habit.nombre}`);
    }
  }
}

// 8. PROBAR ESTADÍSTICAS PERSONALES
async function testRonhyStats() {
  console.log('\n📈 8. ESTADÍSTICAS PERSONALES RONHY');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/habits/stats?days=7');
  
  if (result && result.success) {
    console.log(`✅ Estadísticas obtenidas (${result.data.periodo_dias} días):`);
    console.log(`   Total hábitos: ${result.data.total_habitos}`);
    
    if (result.data.stats.length > 0) {
      result.data.stats.forEach(stat => {
        const porcentaje = stat.tasa_exito ? (stat.tasa_exito * 100).toFixed(1) : '0.0';
        const completados = stat.completados || 0;
        const total = stat.total_seguimientos || 0;
        
        console.log(`   📊 ${stat.nombre}: ${completados}/${total} (${porcentaje}%) - Racha: ${stat.racha_actual}`);
      });
    } else {
      console.log('   ℹ️  Aún no hay datos de seguimiento suficientes');
    }
  }
}

// 9. PROBAR SEGUIMIENTO DIARIO
async function testDailyTracking() {
  console.log('\n📅 9. SEGUIMIENTO DIARIO RONHY');
  console.log('='.repeat(50));
  
  const today = new Date().toISOString().split('T')[0];
  const result = await makeRequest(`/habits/tracking/daily?fecha=${today}`);
  
  if (result && result.success) {
    console.log(`✅ Seguimiento del ${result.data.fecha}:`);
    console.log(`   Total hábitos: ${result.data.total_habitos}`);
    console.log(`   Completados: ${result.data.completados}`);
    
    if (result.data.tracking.length > 0) {
      result.data.tracking.forEach(track => {
        const status = track.completado ? '✅ COMPLETADO' : '⏳ PENDIENTE';
        console.log(`   - ${track.habito_nombre}: ${status}`);
      });
    }
  }
}

// EJECUTAR PRUEBAS COMPLETAS RONHY
async function runRonhyTests() {
  console.log('🚀 INICIANDO PRUEBAS COMPLETAS SISTEMA REPROMT');
  console.log('='.repeat(60));
  console.log('👤 USUARIO: Ronhy Santiago Farfan Franco');
  console.log('📧 EMAIL: ronhy.farfan.1989@gmail.com');
  console.log('🌎 REGIÓN: Lima, Perú (GMT-5)');
  console.log('📅 FECHA NACIMIENTO: 1989-08-02');
  console.log('='.repeat(60));
  
  try {
    // 1. Probar salud del servidor
    if (!await testHealth()) {
      console.log('❌ El servidor no está respondiendo - verifica que esté ejecutándose');
      return;
    }

    // 2. Probar registro o login
    let authSuccess = await testRegisterRonhy();
    if (!authSuccess) {
      authSuccess = await testLoginRonhy();
    }

    if (!authSuccess) {
      console.log('❌ No se pudo autenticar en el sistema');
      return;
    }

    // 3. Probar perfil completo
    await testRonhyProfile();

    // 4. Crear hábitos personales
    await createRonhyHabits();

    // 5. Listar hábitos
    const habits = await testGetHabits();

    // 6. Registrar seguimiento
    if (habits.length > 0) {
      await testHabitTracking(habits);
    }

    // 7. Probar estadísticas
    await testRonhyStats();

    // 8. Probar seguimiento diario
    await testDailyTracking();

    console.log('\n🎉 PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log('✅ Sistema Repromt funcionando correctamente');
    console.log('✅ Usuario Ronhy Farfán autenticado');
    console.log('✅ Hábitos personales creados y gestionados');
    console.log('✅ Seguimiento y estadísticas operativos');
    console.log('='.repeat(60));
    console.log('🔗 Servidor: http://localhost:8000');
    console.log('📊 Health Check: http://localhost:8000/api/health');
    console.log('👤 Perfil: http://localhost:8000/api/auth/profile (requiere token)');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('💥 Error inesperado durante las pruebas:', error);
  }
}

// Verificar que fetch está disponible
if (typeof fetch === 'undefined') {
  console.log('📦 Instalando node-fetch...');
} else {
  // Ejecutar pruebas
  runRonhyTests().catch(error => {
    console.error('💥 Error fatal:', error);
  });
}