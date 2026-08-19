// ============================================
// 🚀 INIT - Punto de entrada principal
// ============================================

(function() {
    console.log('🔧 Reprompt OS - Inicializando módulos...');
    
    // Verificar que todos los módulos están cargados
    const requiredModules = ['api', 'auth', 'ui', 'app'];
    const missingModules = requiredModules.filter(module => !window[module]);
    
    if (missingModules.length > 0) {
        console.error('❌ Módulos faltantes:', missingModules);
        document.getElementById('loading-status').innerText = 
            `Error: Módulos faltantes: ${missingModules.join(', ')}`;
    } else {
        console.log('✅ Todos los módulos cargados correctamente');
    }
})();
