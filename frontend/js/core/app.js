// ============================================
// 🚀 REPROMT APP - CLASE PRINCIPAL
// ============================================

let APP_CONFIG = {
    // ========== FILA 1 (6 apps) ==========
    dashboard: { title: 'Dashboard', icon: 'fa-chart-line', color: '#6366F1', premium: false, url: '/apps/dashboard/index.html', description: 'Visión general de tu progreso' },
    emocional: { title: 'Emocional', icon: 'fa-heart', color: '#ec4899', premium: false, url: '/apps/emocional/index.html', description: 'Seguimiento de estados de ánimo' },
    profesionales: { title: 'Profesionales', icon: 'fa-user-md', color: '#10b981', premium: true, price: 5.99, url: '/apps/profesionales/index.html', description: 'Conecta con profesionales de salud' },
    metas: { title: 'Metas y Proyectos', icon: 'fa-bullseye', color: '#f59e0b', premium: false, url: '/apps/metas/index.html', description: 'Gestiona tus objetivos' },
    habitos: { title: 'Hábitos', icon: 'fa-repeat', color: '#8b5cf6', premium: false, url: '/apps/habitos/index.html', description: 'Seguimiento de hábitos diarios' },
    ejercicios: { title: 'Ejercicios', icon: 'fa-dumbbell', color: '#06b6d4', premium: false, url: '/apps/ejercicios/index.html', description: 'Rutinas de ejercicio' },
    
    // ========== FILA 2 (6 apps - Asistente IA en posición 3, ocupa 2 columnas) ==========
    sueno: { title: 'Sueño', icon: 'fa-bed', color: '#a855f7', premium: false, url: '/apps/sueno/index.html', description: 'Registro de calidad de sueño' },
    musica: { title: 'Música', icon: 'fa-music', color: '#1DB954', premium: true, price: 4.99, url: '/apps/musica/index.html', description: 'Música para concentración y relajación' },
    asistente: { title: 'Asistente IA', icon: 'fa-robot', color: '#8b5cf6', premium: false, url: '/apps/asistente/index.html', description: 'Tu asistente virtual', isCenter: true },
    comunidad: { title: 'Comunidad', icon: 'fa-users', color: '#3b82f6', premium: true, price: 2.99, url: '/apps/comunidad/index.html', description: 'Conecta con otros usuarios' },
    crisis: { title: 'Crisis', icon: 'fa-life-ring', color: '#ef4444', premium: true, price: 5.99, url: '/apps/crisis/index.html', description: 'Recursos para momentos difíciles' },
    'plugin-store': { title: 'Plugin Store', icon: 'fa-store', color: '#f59e0b', premium: false, url: '/apps/store/index.html', description: 'Expande tu experiencia' },
    
    // ========== FILA 3 (6 apps) ==========
    cuestionarios: { title: 'Cuestionarios', icon: 'fa-clipboard-list', color: '#14b8a6', premium: true, price: 4.99, url: '/apps/cuestionarios/index.html', description: 'Evaluaciones personalizadas' },
    biblioteca: { title: 'Biblioteca Personal', icon: 'fa-book-open', color: '#6366f1', premium: true, price: 4.99, url: '/apps/biblioteca/index.html', description: 'Artículos y guías' },
    logros: { title: 'Logros', icon: 'fa-trophy', color: '#f59e0b', premium: true, price: 1.99, url: '/apps/logros/index.html', description: 'Recompensas y medallas' },
    database: { title: 'Base de Datos', icon: 'fa-server', color: '#0ea5e9', premium: false, url: '/apps/database/index.html', description: 'Gestión de datos' },
    organizador: { title: 'Organizador', icon: 'fa-calendar-alt', color: '#3b82f6', premium: false, url: '/apps/organizador/index.html', description: 'Organiza tu día con IA, integra hábitos, metas y más' },
    gamer: { title: 'Zona Gamer', icon: 'fa-gamepad', color: '#ec4899', premium: false, url: '/apps/gamer/index.html', description: 'Brick Game: Gusanito, Tanques, Carreras y Tetris' },
};

let RepromptApp = {
    userPlugins: [],
    ventanasAbiertas: {},
    initialized: false,
    healthCheckInterval: null,
    injectedBridges: new Set(),
    
    // ==================== SISTEMA DE DEMOS ====================
    demosActivos: {},
    
    loadDemos: function() {
        try {
            const demos = localStorage.getItem('reprompt_plugins_demo');
            if (demos) {
                this.demosActivos = JSON.parse(demos);
                const now = Date.now();
                let changed = false;
                for (const [appKey, demoData] of Object.entries(this.demosActivos)) {
                    if (demoData.expira && demoData.expira < now) {
                        delete this.demosActivos[appKey];
                        changed = true;
                        console.log(`⏰ Demo de ${appKey} expirada`);
                    }
                }
                if (changed) {
                    localStorage.setItem('reprompt_plugins_demo', JSON.stringify(this.demosActivos));
                }
            }
        } catch(e) {
            console.error('Error cargando demos:', e);
            this.demosActivos = {};
        }
    },
    
    saveDemos: function() {
        localStorage.setItem('reprompt_plugins_demo', JSON.stringify(this.demosActivos));
    },
    
    activarDemo: function(appKey, days = 3) {
        const cfg = APP_CONFIG[appKey];
        if (!cfg) return { success: false, message: 'App no encontrada' };
        
        if (this.hasPluginAccess(appKey)) {
            return { success: false, message: 'Ya tienes acceso completo a esta app' };
        }
        
        if (this.demosActivos[appKey] && this.demosActivos[appKey].expira > Date.now()) {
            return { success: false, message: 'Ya tienes una demo activa para esta app' };
        }
        
        const expira = Date.now() + (days * 24 * 60 * 60 * 1000);
        this.demosActivos[appKey] = {
            activado: new Date().toISOString(),
            expira: expira,
            dias: days
        };
        this.saveDemos();
        
        console.log(`🎁 Demo de ${cfg.title} activada por ${days} días`);
        
        if (window.ui) {
            window.ui.showNotification(`🎁 Demo de ${cfg.title} activada por ${days} días`, 'success');
        }
        
        this.renderApps();
        
        return { 
            success: true, 
            message: `Demo de ${cfg.title} activada por ${days} días`,
            expiryDate: new Date(expira)
        };
    },
    
    tieneDemoActiva: function(appKey) {
        const demo = this.demosActivos[appKey];
        if (!demo) return false;
        if (demo.expira > Date.now()) return true;
        delete this.demosActivos[appKey];
        this.saveDemos();
        return false;
    },
    
    getDemoTiempoRestante: function(appKey) {
        const demo = this.demosActivos[appKey];
        if (!demo) return null;
        const restante = demo.expira - Date.now();
        if (restante <= 0) return null;
        const horas = Math.floor(restante / (1000 * 60 * 60));
        if (horas < 24) return `${horas} horas`;
        return `${Math.floor(horas / 24)} días ${horas % 24} horas`;
    },

    async init() {
        if (this.initialized) return;
        
        console.log('🚀 Inicializando Reprompt OS...');
        
        this.loadUserPlugins();
        this.loadDemos();
        
        if (window.ui) {
            window.ui.applyTheme();
        }
        
        this.renderApps();
        this.updateSystemCount();
        
        if (window.auth && window.auth.isAuthenticated) {
            this.showUserProfile();
            try {
                await window.api.getProfile();
                console.log('✅ Perfil cargado correctamente');
            } catch(e) {
                console.warn('Error cargando perfil:', e);
            }
        }
        
        setTimeout(() => {
            if (window.ui) window.ui.hideLoading();
        }, 1500);
        
        this.setupEventListeners();
        this.startHealthCheck();
        this.setupGlobalization();
        
        this.initialized = true;
        console.log('✅ Reprompt OS inicializado correctamente');
        
        document.dispatchEvent(new CustomEvent('app:initialized'));
    },
    
    setupGlobalization() {
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'APP_DATA_UPDATE') {
                console.log(`🌐 Datos recibidos de ${event.data.app}:`, event.data.data);
                
                const globalData = localStorage.getItem('reprompt_global_data') || '{}';
                const parsed = JSON.parse(globalData);
                parsed[event.data.app] = {
                    data: event.data.data,
                    lastUpdate: new Date().toISOString(),
                    key: event.data.key
                };
                localStorage.setItem('reprompt_global_data', JSON.stringify(parsed));
                this.forwardToAssistant(event.data.app, event.data.data);
                document.dispatchEvent(new CustomEvent('global:data-updated', {
                    detail: { app: event.data.app, data: event.data.data }
                }));
            }
        });
        
        console.log('🌐 Sistema de globalización configurado');
    },
    
    forwardToAssistant(appName, data) {
        const assistantWindow = document.querySelector('.window[data-app="asistente"]');
        if (assistantWindow) {
            const iframe = assistantWindow.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'GLOBAL_DATA_UPDATE',
                    app: appName,
                    data: data,
                    timestamp: new Date().toISOString()
                }, '*');
            }
        }
    },
    
    injectGlobalBridge(iframe, appName) {
        if (this.injectedBridges.has(appName)) return;
        
        const bridgeScript = `
            (function() {
                if (window.__reprompt_bridge_installed) return;
                window.__reprompt_bridge_installed = true;
                
                const GLOBAL_KEYS = [
                    'reprompt_libro', 'metas_proyectos', 'ejercicios',
                    'habitos', 'sueno', 'emocional', 'datos_ejercicios',
                    'reprompt_plugins', 'reprompt_plugins_demo'
                ];
                
                function shouldGlobalize(key) {
                    return GLOBAL_KEYS.some(globalKey => key.includes(globalKey));
                }
                
                const originalSetItem = localStorage.setItem;
                
                localStorage.setItem = function(key, value) {
                    originalSetItem.call(this, key, value);
                    if (shouldGlobalize(key)) {
                        try {
                            let parsedData;
                            try {
                                parsedData = JSON.parse(value);
                            } catch(e) {
                                parsedData = { raw: value };
                            }
                            window.parent.postMessage({
                                type: 'APP_DATA_UPDATE',
                                app: '${appName}',
                                key: key,
                                data: parsedData
                            }, '*');
                        } catch(e) {}
                    }
                };
                
                window.addEventListener('message', (event) => {
                    if (event.data && event.data.type === 'GLOBAL_DATA_UPDATE') {
                        window.dispatchEvent(new CustomEvent('external:data-update', {
                            detail: {
                                source: event.data.app,
                                data: event.data.data,
                                timestamp: event.data.timestamp
                            }
                        }));
                    }
                });
                
                console.log('✅ Bridge global instalado en ${appName}');
            })();
        `;
        
        const injectScript = () => {
            try {
                if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
                    const scriptElement = iframe.contentWindow.document.createElement('script');
                    scriptElement.textContent = bridgeScript;
                    iframe.contentWindow.document.head.appendChild(scriptElement);
                    this.injectedBridges.add(appName);
                    console.log(`✅ Bridge inyectado en ${appName}`);
                } else {
                    setTimeout(injectScript, 100);
                }
            } catch(e) {
                console.warn(`No se pudo inyectar bridge en ${appName}:`, e);
            }
        };
        
        if (iframe && iframe.contentWindow) {
            injectScript();
        } else {
            iframe.addEventListener('load', injectScript);
        }
    },
    
    getAllGlobalData() {
        const globalData = localStorage.getItem('reprompt_global_data') || '{}';
        try {
            return JSON.parse(globalData);
        } catch(e) {
            return {};
        }
    },
    
    getAppGlobalData(appName) {
        const allData = this.getAllGlobalData();
        return allData[appName] || null;
    },
    
    syncWithApp(appName, data) {
        const iframe = document.querySelector(`iframe[src*="/apps/${appName}/"]`);
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'GLOBAL_DATA_UPDATE',
                app: 'system',
                data: data,
                timestamp: new Date().toISOString()
            }, '*');
        }
    },

    loadUserPlugins() {
        try {
            const plugins = localStorage.getItem('repromt_plugins');
            this.userPlugins = plugins ? JSON.parse(plugins) : [];
            console.log(`📦 Plugins cargados: ${this.userPlugins.length}`);
        } catch(e) {
            console.error('Error cargando plugins:', e);
            this.userPlugins = [];
        }
    },

    saveUserPlugins() {
        localStorage.setItem('repromt_plugins', JSON.stringify(this.userPlugins));
    },

    hasPluginAccess(appKey) {
        const cfg = APP_CONFIG[appKey];
        if (!cfg || !cfg.premium) return true;
        if (this.tieneDemoActiva(appKey)) return true;
        return this.userPlugins.includes(appKey);
    },

    // ========== FUNCIÓN RENDERIZADO MODIFICADA - RESPETA EL ORDEN 3x6 ==========
    renderApps() {
        const workspace = document.getElementById('workspace');
        if (!workspace) {
            console.warn('⚠️ Elemento #workspace no encontrado');
            return;
        }
        
        // Crear o obtener el grid container
        let appsGrid = document.getElementById('apps-grid');
        if (!appsGrid) {
            appsGrid = document.createElement('div');
            appsGrid.id = 'apps-grid';
            workspace.innerHTML = '';
            workspace.appendChild(appsGrid);
        }
        
        appsGrid.innerHTML = '';
        
        // ORDEN CORRECTO: 3 FILAS DE 6 APPS CON ASISTENTE IA EN EL CENTRO
        const APP_ORDER = [
            // FILA 1 (6 apps)
            'dashboard', 'emocional', 'profesionales', 'metas', 'habitos', 'ejercicios',
            // FILA 2 (6 apps)
            'sueno', 'musica', 'asistente', 'comunidad', 'crisis', 'plugin-store',
            // FILA 3 (6 apps)
            'cuestionarios', 'biblioteca', 'logros', 'database', 'organizador',
            'gamer' 
        ];
        
        let delay = 0;
        
        APP_ORDER.forEach(appKey => {
            const cfg = APP_CONFIG[appKey];
            if (!cfg) return;
            
            const hasAccess = this.hasPluginAccess(appKey);
            const tieneDemo = this.tieneDemoActiva(appKey);
            const isPremium = cfg.premium;
            
            let badge = '';
            if (isPremium && hasAccess) {
                badge = '<span class="app-badge active-badge">✓ ACTIVO</span>';
            } else if (isPremium && tieneDemo) {
                const tiempoRestante = this.getDemoTiempoRestante(appKey);
                badge = `<span class="app-badge demo-badge">🎁 DEMO (${tiempoRestante})</span>`;
            } else if (isPremium && !hasAccess && !tieneDemo) {
                badge = '<span class="app-badge premium-badge">💰 PRO</span>';
            }
            
            const appDiv = document.createElement('div');
            appDiv.className = 'app-icon floating';
            appDiv.style.animationDelay = `${delay}s`;
            // IMPORTANTE: Asignar data-app para identificar el Asistente IA
            appDiv.setAttribute('data-app', appKey);
            appDiv.onclick = () => this.openApp(appKey);
            
            appDiv.innerHTML = `
                <div class="icon-hologram">
                    <i class="fas ${cfg.icon}" style="color: ${cfg.color}"></i>
                </div>
                <span>${cfg.title}</span>
                ${badge}
            `;
            
            appsGrid.appendChild(appDiv);
            delay += 0.05;
        });
        
        // Disparar evento para actualizar conexiones visuales
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('appsRendered'));
        }, 100);
        
        if (!document.querySelector('#badge-styles')) {
            const style = document.createElement('style');
            style.id = 'badge-styles';
            style.textContent = `
                .app-badge {
                    font-size: 9px;
                    padding: 2px 6px;
                    border-radius: 20px;
                    margin-top: 4px;
                    display: inline-block;
                    font-weight: bold;
                }
                .premium-badge {
                    background: linear-gradient(135deg, #f59e0b, #8b5cf6);
                    color: white;
                }
                .active-badge {
                    background: #10b981;
                    color: white;
                }
                .demo-badge {
                    background: #3b82f6;
                    color: white;
                }
                #apps-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 20px;
                    max-width: 1400px;
                    margin: 0 auto;
                    position: relative;
                }
                .app-icon[data-app="asistente"] {
                    grid-column: span 2;
                    transform: scale(1.05);
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(99, 102, 241, 0.25));
                    border: 2px solid #8b5cf6;
                    z-index: 10;
                }
                @media (max-width: 1024px) {
                    #apps-grid { grid-template-columns: repeat(3, 1fr); }
                    .app-icon[data-app="asistente"] { grid-column: span 1; }
                }
                @media (max-width: 768px) {
                    #apps-grid { grid-template-columns: repeat(2, 1fr); }
                }
            `;
            document.head.appendChild(style);
        }
    },

    activatePlugin(appKey, days = 3) {
        if (this.userPlugins.includes(appKey)) {
            return { success: false, message: 'Ya tienes este plugin activado' };
        }
        
        this.userPlugins.push(appKey);
        this.saveUserPlugins();
        
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        
        const pluginsExpiry = JSON.parse(localStorage.getItem('repromt_plugins_expiry') || '{}');
        pluginsExpiry[appKey] = expiryDate.toISOString();
        localStorage.setItem('repromt_plugins_expiry', JSON.stringify(pluginsExpiry));
        
        console.log(`✅ Plugin ${appKey} activado por ${days} días`);
        
        return { 
            success: true, 
            message: `Demo de ${APP_CONFIG[appKey].title} activada por ${days} días`,
            expiryDate: expiryDate
        };
    },

    checkPluginExpiry() {
        const pluginsExpiry = JSON.parse(localStorage.getItem('repromt_plugins_expiry') || '{}');
        const now = new Date();
        let changed = false;
        
        for (const [appKey, expiryStr] of Object.entries(pluginsExpiry)) {
            const expiryDate = new Date(expiryStr);
            if (expiryDate < now) {
                const index = this.userPlugins.indexOf(appKey);
                if (index !== -1) {
                    this.userPlugins.splice(index, 1);
                    changed = true;
                    console.log(`⏰ Plugin ${appKey} ha expirado`);
                    
                    if (window.ui) {
                        window.ui.showNotification(`${APP_CONFIG[appKey]?.title || appKey} ha expirado`, 'warning');
                    }
                }
                delete pluginsExpiry[appKey];
            }
        }
        
        if (changed) {
            this.saveUserPlugins();
            localStorage.setItem('repromt_plugins_expiry', JSON.stringify(pluginsExpiry));
            this.renderApps();
        }
    },

    async openApp(appName) {
        if (!window.auth || !window.auth.isAuthenticated) {
            if (window.ui) {
                window.ui.showModal('login-modal');
                window.ui.showNotification('Inicia sesión para acceder', 'info');
            }
            return;
        }
        
        const cfg = APP_CONFIG[appName];
        if (!cfg) {
            if (window.ui) window.ui.showNotification('App no encontrada', 'error');
            return;
        }
        
        if (cfg.premium && !this.hasPluginAccess(appName)) {
            if (window.ui) {
                window.ui.showNotification(`⚠️ ${cfg.title} requiere activación. Puedes probar una demo de 3 días en la Plugin Store`, 'warning');
                this.openApp('plugin-store');
            }
            return;
        }
        
        if (window.ui) {
            window.ui.showNotification(`Abriendo ${cfg.title}...`, 'info');
        }
        
        const iframeId = `iframe-${appName}-${Date.now()}`;
        
        const content = `
            <div class="app-iframe-container" style="width: 100%; height: 100%;">
                <iframe 
                    id="${iframeId}"
                    src="${cfg.url}" 
                    frameborder="0" 
                    style="width: 100%; height: 100%; background: var(--bg-primary, #0a0a0f); border: none;"
                    allow="clipboard-write; microphone; camera; downloads"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads"
                ></iframe>
            </div>
        `;
        
        if (window.ui && window.ui.createWindow) {
            const win = window.ui.createWindow(appName, cfg, content);
            
            setTimeout(() => {
                const iframe = document.getElementById(iframeId);
                if (iframe) {
                    this.injectGlobalBridge(iframe, appName);
                }
            }, 500);
        } else {
            console.error('UI Manager no disponible');
        }
        
        this.ventanasAbiertas[appName] = new Date();
    },

    showUserProfile() {
        const navAuth = document.getElementById('nav-auth');
        const navProfile = document.getElementById('nav-profile');
        
        if (navAuth) navAuth.style.display = 'none';
        if (navProfile) {
            navProfile.style.display = 'flex';
            const userName = document.getElementById('user-name');
            const userAvatar = document.getElementById('user-avatar');
            if (userName && window.auth) {
                userName.innerText = window.auth.getUserName();
            }
            if (userAvatar && window.auth) {
                userAvatar.innerText = window.auth.getUserAvatar();
            }
        }
    },

    hideUserProfile() {
        const navAuth = document.getElementById('nav-auth');
        const navProfile = document.getElementById('nav-profile');
        if (navAuth) navAuth.style.display = 'flex';
        if (navProfile) navProfile.style.display = 'none';
    },

    logout() {
        if (window.auth) {
            window.auth.logout();
        }
    },

    updateSystemCount() {
        const systemCount = document.getElementById('system-count');
        if (systemCount) {
            systemCount.textContent = `${Object.keys(APP_CONFIG).length} Sistemas`;
        }
    },

    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email')?.value;
                const password = document.getElementById('login-password')?.value;
                if (!email || !password) {
                    if (window.ui) window.ui.showNotification('Completa todos los campos', 'error');
                    return;
                }
                if (window.ui) window.ui.showLoading('Iniciando sesión...');
                const result = await window.auth.login(email, password);
                if (window.ui) window.ui.hideLoading();
                if (result.success) {
                    if (window.ui) {
                        window.ui.hideModals();
                        window.ui.showNotification(result.message || '¡Bienvenido!', 'success');
                    }
                    this.showUserProfile();
                    this.renderApps();
                } else {
                    if (window.ui) window.ui.showNotification(result.error, 'error');
                }
            });
        }
        
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nombre = document.getElementById('register-name')?.value;
                const email = document.getElementById('register-email')?.value;
                const password = document.getElementById('register-password')?.value;
                const confirm = document.getElementById('register-confirm-password')?.value;
                if (window.ui) window.ui.showLoading('Creando cuenta...');
                const result = await window.auth.register(nombre, email, password, confirm);
                if (window.ui) window.ui.hideLoading();
                if (result.success) {
                    if (window.ui) {
                        window.ui.hideModals();
                        window.ui.showNotification(result.message || '¡Cuenta creada!', 'success');
                    }
                    this.showUserProfile();
                    this.renderApps();
                } else {
                    if (window.ui) window.ui.showNotification(result.error, 'error');
                }
            });
        }
        
        const search = document.getElementById('global-search');
        if (search) {
            search.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const icons = document.querySelectorAll('.app-icon');
                let visibleCount = 0;
                icons.forEach(icon => {
                    const title = icon.querySelector('span')?.innerText.toLowerCase() || '';
                    const matches = title.includes(query);
                    icon.style.display = matches ? 'flex' : 'none';
                    if (matches) visibleCount++;
                });
                const workspace = document.getElementById('workspace');
                if (workspace) {
                    const existingMsg = workspace.querySelector('.no-results');
                    if (visibleCount === 0 && query) {
                        if (!existingMsg) {
                            const noResults = document.createElement('div');
                            noResults.className = 'no-results';
                            noResults.innerHTML = `
                                <i class="fas fa-search" style="font-size: 48px; opacity: 0.5;"></i>
                                <p>No se encontraron apps para "${query}"</p>
                            `;
                            workspace.appendChild(noResults);
                        }
                    } else if (existingMsg) {
                        existingMsg.remove();
                    }
                }
            });
        }
        
        document.addEventListener('click', (e) => {
            if (e.target.classList && e.target.classList.contains('modal')) {
                if (window.ui) window.ui.hideModals();
            }
        });
        
        document.addEventListener('auth:login', () => {
            this.showUserProfile();
            this.renderApps();
        });
        
        document.addEventListener('auth:logout', () => {
            this.hideUserProfile();
            this.renderApps();
            if (window.ui) window.ui.closeAllWindows();
        });
        
        setInterval(() => {
            this.checkPluginExpiry();
        }, 60 * 60 * 1000);
        
        this.checkPluginExpiry();
    },

    startHealthCheck() {
        this.healthCheckInterval = setInterval(async () => {
            if (window.api && window.api.checkHealth) {
                const health = await window.api.checkHealth();
                const dbStatus = document.getElementById('db-status');
                if (dbStatus) {
                    if (health.status === 'ok' || health.base_datos === 'conectado') {
                        dbStatus.innerHTML = '✅ Base de Datos: Conectada';
                        dbStatus.style.color = 'var(--success-color, #10b981)';
                    } else {
                        dbStatus.innerHTML = '⚠️ Base de Datos: Offline';
                        dbStatus.style.color = 'var(--warning-color, #f59e0b)';
                    }
                }
            }
        }, 30000);
    },

    stopHealthCheck() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    },

    getAppInfo(appKey) {
        return APP_CONFIG[appKey] || null;
    },

    getAllApps() {
        return Object.entries(APP_CONFIG).map(([key, config]) => ({
            key: key,
            ...config,
            isActive: this.hasPluginAccess(key)
        }));
    },

    getPremiumApps() {
        return this.getAllApps().filter(app => app.premium);
    },

    getFreeApps() {
        return this.getAllApps().filter(app => !app.premium);
    }
};

// Exponer API de globalización
window.GlobalAPI = {
    getAllData: () => app ? app.getAllGlobalData() : {},
    getAppData: (appName) => app ? app.getAppGlobalData(appName) : null,
    syncWithApp: (appName, data) => app && app.syncWithApp(appName, data),
    activarDemo: (appName, days = 3) => app ? app.activarDemo(appName, days) : { success: false, message: 'App no disponible' },
    tieneDemoActiva: (appName) => app ? app.tieneDemoActiva(appName) : false
};

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = RepromptApp;
    window.app = app;
    app.init();
});

window.addEventListener('beforeunload', () => {
    if (app && app.stopHealthCheck) {
        app.stopHealthCheck();
    }
});