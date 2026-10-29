// ============================================
// 📡 API - CONEXIÓN CON EL BACKEND
// ============================================

let ApiService = {
    token: localStorage.getItem('repromt_token'),
    baseUrl: 'https://repromt-api-856844207258.us-central1.run.app/api',
    timeout: 30000, // 30 segundos timeout

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('repromt_token', token);
        } else {
            localStorage.removeItem('repromt_token');
        }
    },

    getHeaders() {
        let headers = { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return headers;
    },

    async request(endpoint, options = {}) {
        let url = this.baseUrl + endpoint;
        let config = {
            method: options.method || 'GET',
            headers: this.getHeaders(),
            signal: options.signal || null
        };
        
        if (options.body) {
            config.body = JSON.stringify(options.body);
        }
        
        // Timeout Promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout de conexión')), this.timeout);
        });
        
        try {
            const fetchPromise = fetch(url, config);
            let response = await Promise.race([fetchPromise, timeoutPromise]);
            
            // Intentar parsear JSON, si falla devolver texto
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                data = { message: text, success: false };
            }
            
            // Manejo de sesión expirada
            if (response.status === 401) {
                console.warn('⚠️ Sesión expirada o token inválido');
                this.setToken(null);
                if (window.auth && window.auth.logout) {
                    window.auth.logout();
                }
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }
            
            // Manejo de otros errores HTTP
            if (!response.ok) {
                const errorMsg = data.message || data.error || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMsg);
            }
            
            return data;
        } catch (error) {
            console.error(`❌ API Error [${endpoint}]:`, error.message);
            
            // Errores específicos
            if (error.message === 'Failed to fetch') {
                throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo en el puerto 8000');
            }
            if (error.message === 'Timeout de conexión') {
                throw new Error('El servidor no responde. Intenta nuevamente.');
            }
            
            throw error;
        }
    },

    // ========== AUTH ==========
    async login(email, password) {
        if (!email || !password) {
            throw new Error('Email y contraseña son requeridos');
        }
        
        let data = await this.request('/auth/login', {
            method: 'POST',
            body: { email: email, password: password }
        });
        
        if (data.success && data.data && data.data.token) {
            this.setToken(data.data.token);
            // Guardar también el usuario completo si viene
            if (data.data.user) {
                localStorage.setItem('repromt_user', JSON.stringify(data.data.user));
            }
        }
        return data;
    },

    async register(userData) {
        if (!userData.nombre || !userData.email || !userData.password) {
            throw new Error('Nombre, email y contraseña son requeridos');
        }
        
        return await this.request('/auth/register', {
            method: 'POST',
            body: userData
        });
    },

    async getProfile() {
        return await this.request('/auth/profile');
    },

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.warn('Error en logout:', error.message);
        } finally {
            this.setToken(null);
            localStorage.removeItem('repromt_user');
        }
    },

    // ========== PIED PIPER ==========
    async getDashboard() {
        return await this.request('/piedpiper/dashboard');
    },

    async getRecommendations() {
        return await this.request('/piedpiper/recommendations');
    },

    async getEstadosAnimo() {
        return await this.request('/estados_animo');
    },

    // ========== HÁBITOS ==========
    async getHabits() {
        return await this.request('/habits');
    },

    async createHabit(data) {
        return await this.request('/habits', {
            method: 'POST',
            body: data
        });
    },

    async updateHabit(id, data) {
        return await this.request(`/habits/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    async deleteHabit(id) {
        return await this.request(`/habits/${id}`, {
            method: 'DELETE'
        });
    },

    // ========== METAS ==========
    async getMetasSalud() {
        return await this.request('/metas_salud');
    },

    async getMetasEmocionales() {
        return await this.request('/metas_emocionales');
    },
    
    async createMeta(endpoint, data) {
        return await this.request(endpoint, {
            method: 'POST',
            body: data
        });
    },

    // ========== HEALTH CHECK ==========
    async checkHealth() {
        try {
            const response = await fetch('https://repromt-api-856844207258.us-central1.run.app/api/health', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'error', message: 'Backend no disponible' };
        }
    },

    // ========== 🆕 SINCRONIZACIÓN DE DATOS GLOBALES ==========
    /**
     * Sincroniza todos los datos globales del usuario con el backend
     * @param {string} userId - ID del usuario
     * @param {object} data - Datos globales (metas, hábitos, libro, etc)
     * @returns {Promise<object>} Respuesta del servidor
     */
    async syncGlobalData(userId, data) {
        if (!userId) {
            throw new Error('UserId es requerido para sincronizar');
        }
        
        const syncData = {
            userId: userId,
            data: data,
            timestamp: Date.now(),
            version: '1.0.0',
            device: navigator.userAgent || 'unknown'
        };
        
        return await this.request('/sync/global', {
            method: 'POST',
            body: syncData
        });
    },

    /**
     * Obtiene todos los datos globales del usuario desde el backend
     * @param {string} userId - ID del usuario
     * @returns {Promise<object>} Datos del usuario
     */
    async getUserGlobalData(userId) {
        if (!userId) {
            throw new Error('UserId es requerido');
        }
        return await this.request(`/user/${userId}/global-data`);
    },

    /**
     * Sincroniza una app específica
     * @param {string} userId - ID del usuario
     * @param {string} appName - Nombre de la app
     * @param {object} appData - Datos de la app
     */
    async syncAppData(userId, appName, appData) {
        if (!userId || !appName) {
            throw new Error('UserId y appName son requeridos');
        }
        
        return await this.request('/sync/app', {
            method: 'POST',
            body: { userId, appName, appData, timestamp: Date.now() }
        });
    },

    // ========== 🆕 ENDPOINTS DINÁMICOS (para las 61 tablas) ==========
    /**
     * Obtiene registros de cualquier tabla
     * @param {string} tableName - Nombre de la tabla
     * @param {object} params - Parámetros de consulta (filtros, paginación)
     */
    async getTableData(tableName, params = {}) {
        if (!tableName) {
            throw new Error('Nombre de tabla es requerido');
        }
        
        let queryString = new URLSearchParams(params).toString();
        let endpoint = `/dynamic/${tableName}`;
        if (queryString) endpoint += `?${queryString}`;
        
        return await this.request(endpoint);
    },

    /**
     * Obtiene un registro por ID de cualquier tabla
     * @param {string} tableName - Nombre de la tabla
     * @param {string|number} id - ID del registro
     */
    async getTableRowById(tableName, id) {
        if (!tableName || !id) {
            throw new Error('TableName e ID son requeridos');
        }
        return await this.request(`/dynamic/${tableName}/${id}`);
    },

    /**
     * Crea un registro en cualquier tabla
     * @param {string} tableName - Nombre de la tabla
     * @param {object} data - Datos a insertar
     */
    async createTableRecord(tableName, data) {
        if (!tableName || !data) {
            throw new Error('TableName y data son requeridos');
        }
        return await this.request(`/dynamic/${tableName}`, {
            method: 'POST',
            body: data
        });
    },

    /**
     * Actualiza un registro en cualquier tabla
     * @param {string} tableName - Nombre de la tabla
     * @param {string|number} id - ID del registro
     * @param {object} data - Datos a actualizar
     */
    async updateTableRecord(tableName, id, data) {
        if (!tableName || !id || !data) {
            throw new Error('TableName, ID y data son requeridos');
        }
        return await this.request(`/dynamic/${tableName}/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    /**
     * Elimina un registro de cualquier tabla
     * @param {string} tableName - Nombre de la tabla
     * @param {string|number} id - ID del registro
     */
    async deleteTableRecord(tableName, id) {
        if (!tableName || !id) {
            throw new Error('TableName e ID son requeridos');
        }
        return await this.request(`/dynamic/${tableName}/${id}`, {
            method: 'DELETE'
        });
    },

    /**
     * Obtiene la lista de todas las tablas disponibles
     */
    async getTablesList() {
        return await this.request('/system/tables');
    },

    /**
     * Obtiene el esquema de una tabla específica
     * @param {string} tableName - Nombre de la tabla
     */
    async getTableSchema(tableName) {
        if (!tableName) {
            throw new Error('Nombre de tabla es requerido');
        }
        return await this.request(`/system/tables/${tableName}/schema`);
    },

    // ========== 🆕 RESPALDO Y RESTAURACIÓN ==========
    /**
     * Crea un respaldo completo de todos los datos del usuario
     * @param {string} userId - ID del usuario
     */
    async createBackup(userId) {
        if (!userId) {
            throw new Error('UserId es requerido');
        }
        return await this.request('/backup/create', {
            method: 'POST',
            body: { userId, timestamp: Date.now() }
        });
    },

    /**
     * Restaura datos desde un respaldo
     * @param {string} userId - ID del usuario
     * @param {string} backupId - ID del respaldo
     */
    async restoreBackup(userId, backupId) {
        if (!userId || !backupId) {
            throw new Error('UserId y backupId son requeridos');
        }
        return await this.request('/backup/restore', {
            method: 'POST',
            body: { userId, backupId }
        });
    },

    /**
     * Obtiene la lista de respaldos del usuario
     * @param {string} userId - ID del usuario
     */
    async getBackupsList(userId) {
        if (!userId) {
            throw new Error('UserId es requerido');
        }
        return await this.request(`/backup/user/${userId}/list`);
    },

    // ========== 🆕 ESTADÍSTICAS AVANZADAS ==========
    /**
     * Obtiene estadísticas completas del usuario
     * @param {string} userId - ID del usuario
     * @param {string} periodo - daily, weekly, monthly, yearly
     */
    async getUserStats(userId, periodo = 'weekly') {
        if (!userId) {
            throw new Error('UserId es requerido');
        }
        return await this.request(`/stats/user/${userId}?period=${periodo}`);
    },

    /**
     * Obtiene el progreso del usuario en todas las apps
     * @param {string} userId - ID del usuario
     */
    async getUserProgress(userId) {
        if (!userId) {
            throw new Error('UserId es requerido');
        }
        return await this.request(`/progress/user/${userId}`);
    }
};

// Inicializar
if (window.api === undefined) {
    window.api = ApiService;
}