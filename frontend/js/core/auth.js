// ============================================
// 🔐 AUTENTICACIÓN - LOGIN, REGISTRO, LOGOUT
// ============================================

let AuthManager = {
    currentUser: null,
    isAuthenticated: false,
    isLoading: false,

    loadStoredUser() {
        try {
            let user = localStorage.getItem('repromt_user');
            let token = localStorage.getItem('repromt_token');
            
            if (user && token && window.api) {
                this.currentUser = JSON.parse(user);
                this.isAuthenticated = true;
                // Sincronizar token con api
                window.api.setToken(token);
                console.log('✅ Usuario cargado:', this.currentUser.email);
                return true;
            }
        } catch(e) {
            console.error('Error cargando usuario:', e);
            this.clearUser();
        }
        return false;
    },

    saveUser(user, token) {
        this.currentUser = user;
        this.isAuthenticated = true;
        localStorage.setItem('repromt_user', JSON.stringify(user));
        if (token && window.api) {
            window.api.setToken(token);
        }
        console.log('✅ Usuario guardado:', user.email);
    },

    clearUser() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('repromt_user');
        if (window.api) {
            window.api.setToken(null);
        }
        console.log('👋 Usuario desconectado');
    },

    async login(email, password) {
        // Validaciones
        if (!email || !password) {
            return { 
                success: false, 
                error: 'Por favor, completa todos los campos' 
            };
        }
        
        if (!email.includes('@')) {
            return { 
                success: false, 
                error: 'Ingresa un email válido' 
            };
        }
        
        if (this.isLoading) {
            return { 
                success: false, 
                error: 'Ya hay una petición en curso' 
            };
        }
        
        this.isLoading = true;
        
        try {
            let response = await window.api.login(email, password);
            
            if (response.success && response.data) {
                const userData = response.data.user || response.data;
                const token = response.data.token;
                
                this.saveUser(userData, token);
                
                // Disparar evento de login
                this.dispatchEvent('login', userData);
                
                return { 
                    success: true, 
                    user: userData,
                    message: response.message || 'Bienvenido ' + (userData.nombre || email)
                };
            }
            
            return { 
                success: false, 
                error: response.message || 'Error al iniciar sesión' 
            };
            
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: error.message || 'Error de conexión con el servidor' 
            };
        } finally {
            this.isLoading = false;
        }
    },

    async register(nombre, email, password, confirm) {
        // Validaciones
        if (!nombre || !email || !password || !confirm) {
            return { 
                success: false, 
                error: 'Todos los campos son obligatorios' 
            };
        }
        
        if (nombre.length < 3) {
            return { 
                success: false, 
                error: 'El nombre debe tener al menos 3 caracteres' 
            };
        }
        
        if (!email.includes('@')) {
            return { 
                success: false, 
                error: 'Ingresa un email válido' 
            };
        }
        
        if (password.length < 8) {
            return { 
                success: false, 
                error: 'La contraseña debe tener al menos 8 caracteres' 
            };
        }
        
        if (password !== confirm) {
            return { 
                success: false, 
                error: 'Las contraseñas no coinciden' 
            };
        }
        
        if (this.isLoading) {
            return { 
                success: false, 
                error: 'Ya hay una petición en curso' 
            };
        }
        
        this.isLoading = true;
        
        try {
            let response = await window.api.register({ 
                nombre: nombre.trim(), 
                email: email.trim().toLowerCase(), 
                password: password 
            });
            
            if (response.success) {
                // Auto-login después del registro
                const loginResult = await this.login(email, password);
                if (loginResult.success) {
                    return { 
                        success: true, 
                        user: loginResult.user,
                        message: '¡Cuenta creada exitosamente! Bienvenido a Reprompt OS'
                    };
                }
                return loginResult;
            }
            
            return { 
                success: false, 
                error: response.message || 'Error al crear cuenta' 
            };
            
        } catch (error) {
            console.error('Register error:', error);
            return { 
                success: false, 
                error: error.message || 'Error de conexión con el servidor' 
            };
        } finally {
            this.isLoading = false;
        }
    },

    async logout() {
        if (window.api) {
            try {
                await window.api.logout();
            } catch (error) {
                console.warn('Error en logout API:', error);
            }
        }
        
        this.clearUser();
        
        // Disparar evento de logout
        this.dispatchEvent('logout');
        
        // Mostrar notificación si ui está disponible
        if (window.ui) {
            window.ui.showNotification('Sesión cerrada correctamente', 'info');
        }
        
        // Recargar después de 1 segundo
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    },

    getUserName() {
        if (!this.currentUser) return 'Usuario';
        return this.currentUser.nombre || 
               this.currentUser.name || 
               (this.currentUser.email ? this.currentUser.email.split('@')[0] : 'Usuario');
    },

    getUserEmail() {
        if (!this.currentUser) return '';
        return this.currentUser.email || '';
    },

    getUserAvatar() {
        return this.getUserName().charAt(0).toUpperCase();
    },

    getUserInitials() {
        const name = this.getUserName();
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    },

    // Eventos personalizados
    dispatchEvent(eventName, data = null) {
        const customEvent = new CustomEvent(`auth:${eventName}`, { 
            detail: data,
            bubbles: true 
        });
        document.dispatchEvent(customEvent);
    },

    // Verificar si el token es válido (refresh)
    async verifyToken() {
        if (!this.isAuthenticated || !window.api || !window.api.token) {
            return false;
        }
        
        try {
            const response = await window.api.getProfile();
            if (response.success) {
                // Actualizar datos del usuario si cambiaron
                if (response.data && response.data.user) {
                    this.currentUser = response.data.user;
                    localStorage.setItem('repromt_user', JSON.stringify(response.data.user));
                }
                return true;
            }
            return false;
        } catch (error) {
            console.warn('Token verification failed:', error);
            this.clearUser();
            return false;
        }
    },

    // Verificar estado de autenticación
    checkAuth() {
        const hasToken = !!localStorage.getItem('repromt_token');
        const hasUser = !!localStorage.getItem('repromt_user');
        
        if (hasToken && hasUser) {
            if (!this.currentUser) {
                this.loadStoredUser();
            }
            return true;
        }
        
        this.clearUser();
        return false;
    }
};

// Inicializar al cargar
AuthManager.loadStoredUser();

// Escuchar cambios de autenticación
document.addEventListener('auth:login', (e) => {
    console.log('🔐 Evento login:', e.detail);
});

document.addEventListener('auth:logout', () => {
    console.log('🔓 Evento logout');
});

window.auth = AuthManager;