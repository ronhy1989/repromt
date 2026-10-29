// ============================================
// 🎨 UI - VENTANAS, NOTIFICACIONES, TEMAS
// ============================================

let UIManager = {
    openWindows: new Map(),
    windowZIndex: 1000,
    theme: localStorage.getItem('theme') || 'dark',
    notifications: [],
    maxNotifications: 5,

    // ==================== INICIALIZACIÓN ====================
    
    init() {
        this.applyTheme();
        this.initSystemTime();
        this.initKeyboardShortcuts();
        console.log('🎨 UI Manager inicializado');
    },

    // ==================== TEMA ====================
    
    applyTheme() {
        document.body.setAttribute('data-theme', this.theme);
        const themeIcon = document.querySelector('.theme-toggle i');
        if (themeIcon) {
            themeIcon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        // Guardar preferencia
        localStorage.setItem('theme', this.theme);
        
        // Disparar evento
        document.dispatchEvent(new CustomEvent('theme:changed', { detail: { theme: this.theme } }));
    },

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        this.showNotification(`Tema ${this.theme === 'dark' ? 'oscuro' : 'claro'} activado`, 'info');
    },

    getCurrentTheme() {
        return this.theme;
    },

    // ==================== MODALES ====================
    
    showModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'flex';
            // Animación de entrada
            modal.classList.add('modal-enter');
            setTimeout(() => modal.classList.remove('modal-enter'), 300);
            
            // Enfocar primer input si existe
            const firstInput = modal.querySelector('input, textarea, button');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    },

    hideModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        
        // Resetear formularios
        const forms = document.querySelectorAll('.modal form');
        forms.forEach(form => {
            form.reset();
        });
        
        // Remover mensajes de error
        const errorMessages = document.querySelectorAll('.form-error');
        errorMessages.forEach(error => error.remove());
    },

    hideModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // ==================== NOTIFICACIONES ====================
    
    showNotification(msg, type = 'info', duration = 3000) {
        type = type || 'info';
        
        // Limitar cantidad de notificaciones
        if (this.notifications.length >= this.maxNotifications) {
            const oldest = this.notifications.shift();
            if (oldest && oldest.element) oldest.element.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type} notification-enter`;
        
        // Iconos según tipo
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        const icon = icons[type] || 'info-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${this.escapeHtml(msg)}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        document.body.appendChild(notification);
        
        // Botón cerrar
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                notification.classList.add('notification-exit');
                setTimeout(() => notification.remove(), 300);
                const index = this.notifications.findIndex(n => n.element === notification);
                if (index !== -1) this.notifications.splice(index, 1);
            };
        }
        
        // Auto-cerrar
        const timeout = setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add('notification-exit');
                setTimeout(() => notification.remove(), 300);
                const index = this.notifications.findIndex(n => n.element === notification);
                if (index !== -1) this.notifications.splice(index, 1);
            }
        }, duration);
        
        // Guardar referencia
        this.notifications.push({
            element: notification,
            timeout: timeout,
            type: type
        });
        
        // Remover animación después
        setTimeout(() => {
            notification.classList.remove('notification-enter');
        }, 100);
        
        return notification;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // ==================== LOADING ====================
    
    showLoading(msg = 'Cargando...') {
        let loading = document.getElementById('loading-screen');
        if (!loading) {
            // Crear loading si no existe
            loading = document.createElement('div');
            loading.id = 'loading-screen';
            loading.innerHTML = `
                <div class="neural-loader">
                    <div class="neural-node"></div>
                    <div class="neural-node"></div>
                    <div class="neural-node"></div>
                    <div class="neural-node"></div>
                    <div class="neural-node"></div>
                    <div class="neural-node"></div>
                </div>
                <h2>Cargando...</h2>
                <p id="loading-status">${msg}</p>
            `;
            document.body.appendChild(loading);
        }
        
        const statusEl = document.getElementById('loading-status');
        if (statusEl) statusEl.innerText = msg;
        
        loading.style.display = 'flex';
    },

    hideLoading() {
        const loading = document.getElementById('loading-screen');
        if (loading) {
            loading.style.display = 'none';
        }
    },

    setLoadingMessage(msg) {
        const statusEl = document.getElementById('loading-status');
        if (statusEl) statusEl.innerText = msg;
    },

    // ==================== SIDEBAR ====================
    
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
            
            // Guardar estado
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebar_collapsed', isCollapsed);
            
            // Disparar evento
            document.dispatchEvent(new CustomEvent('sidebar:toggle', { 
                detail: { collapsed: isCollapsed } 
            }));
        }
    },

    restoreSidebarState() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
            if (isCollapsed) {
                sidebar.classList.add('collapsed');
            }
        }
    },

    // ==================== VENTANAS ====================
    
    createWindow(appName, cfg, content) {
        const windowId = `window-${appName}`;
        
        // Verificar si ya existe
        const existingWindow = document.getElementById(windowId);
        if (existingWindow) {
            // Traer al frente
            existingWindow.style.display = 'flex';
            existingWindow.style.zIndex = ++this.windowZIndex;
            this.focusWindow(windowId);
            return;
        }
        
        // Posición centrada con offset
        const left = Math.max(50, Math.min(100, (this.openWindows.size * 30) + 50));
        const top = Math.max(50, Math.min(80, (this.openWindows.size * 30) + 50));
        
        const windowHtml = `
            <div id="${windowId}" class="os-window" style="width: ${window.innerWidth <= 768 ? "100vw" : "900px"}; height: ${window.innerWidth <= 768 ? "100vh" : "700px"}; left: ${window.innerWidth <= 768 ? "0" : left + "px"}; top: ${window.innerWidth <= 768 ? "0" : top + "px"}; z-index: ${++this.windowZIndex};">
                <div class="window-header">
                    <span class="window-title">
                        <i class="fas ${cfg.icon}" style="color:${cfg.color}"></i>
                        ${cfg.title}
                    </span>
                    <div class="window-controls">
                        <button class="minimize-btn" title="Minimizar"><i class="fas fa-minus"></i></button>
                        <button class="maximize-btn" title="Maximizar"><i class="fas fa-expand"></i></button>
                        <button class="close-btn" title="Cerrar"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="window-content">
                    ${content}
                </div>
                <div class="window-resize-handle"></div>
            </div>
        `;
        
        const container = document.getElementById('app-windows-container');
        if (container) {
            container.insertAdjacentHTML('beforeend', windowHtml);
            this.initWindowControls(windowId);
            this.initWindowResize(windowId);
        }
    },
    
    initWindowControls(windowId) {
        const ventana = document.getElementById(windowId);
        if (!ventana) return;
        
        const closeBtn = ventana.querySelector('.close-btn');
        const minimizeBtn = ventana.querySelector('.minimize-btn');
        const maximizeBtn = ventana.querySelector('.maximize-btn');
        const header = ventana.querySelector('.window-header');
        
        // Cerrar
        if (closeBtn) {
            closeBtn.onclick = () => this.closeWindow(windowId);
        }
        
        // Minimizar
        if (minimizeBtn) {
            minimizeBtn.onclick = () => {
                ventana.classList.toggle('minimized');
            };
        }
        
        // Maximizar
        if (maximizeBtn) {
            maximizeBtn.onclick = () => {
                if (ventana.classList.contains('maximized')) {
                    ventana.classList.remove('maximized');
                    ventana.style.width = '900px';
                    ventana.style.height = '700px';
                } else {
                    ventana.classList.add('maximized');
                    ventana.style.width = '100%';
                    ventana.style.height = 'calc(100% - 60px)';
                    ventana.style.left = '0';
                    ventana.style.top = '0';
                }
            };
        }
        
        // Drag to move
        if (header) {
            this.makeDraggable(ventana, header);
        }
        
        // Focus al hacer click
        ventana.addEventListener('mousedown', () => {
            ventana.style.zIndex = ++this.windowZIndex;
        });
        
        this.openWindows.set(windowId, ventana);
    },
    
    makeDraggable(element, handle) {
        let isDragging = false;
        let offsetX, offsetY;
        
        handle.style.cursor = 'grab';
        
        handle.addEventListener('mousedown', (e) => {
            if (element.classList.contains('maximized')) return;
            if (e.target.closest('.window-controls')) return;
            
            isDragging = true;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            handle.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            let newLeft = e.clientX - offsetX;
            let newTop = e.clientY - offsetY;
            
            // Limitar dentro de la pantalla
            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - element.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - element.offsetHeight));
            
            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            handle.style.cursor = 'grab';
        });
    },
    
    initWindowResize(windowId) {
        const ventana = document.getElementById(windowId);
        const resizeHandle = ventana?.querySelector('.window-resize-handle');
        if (!resizeHandle) return;
        
        let isResizing = false;
        let startX, startY, startWidth, startHeight;
        
        resizeHandle.addEventListener('mousedown', (e) => {
            if (ventana.classList.contains('maximized')) return;
            
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(ventana.style.width);
            startHeight = parseInt(ventana.style.height);
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const newWidth = Math.max(400, startWidth + (e.clientX - startX));
            const newHeight = Math.max(300, startHeight + (e.clientY - startY));
            
            ventana.style.width = `${newWidth}px`;
            ventana.style.height = `${newHeight}px`;
        });
        
        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
    },
    
    closeWindow(windowId) {
        const ventana = document.getElementById(windowId);
        if (ventana) {
            ventana.classList.add('window-exit');
            setTimeout(() => {
                ventana.remove();
                this.openWindows.delete(windowId);
            }, 200);
        }
    },
    
    focusWindow(windowId) {
        const ventana = document.getElementById(windowId);
        if (ventana) {
            ventana.style.zIndex = ++this.windowZIndex;
        }
    },
    
    minimizeAllWindows() {
        this.openWindows.forEach((ventana) => {
            ventana.classList.add('minimized');
        });
    },
    
    restoreAllWindows() {
        this.openWindows.forEach((ventana) => {
            ventana.classList.remove('minimized');
        });
    },
    
    closeAllWindows() {
        this.openWindows.forEach((_, windowId) => {
            this.closeWindow(windowId);
        });
    },

    // ==================== SISTEMA ====================
    
    initSystemTime() {
        const updateTime = () => {
            const timeEl = document.getElementById('system-time');
            if (timeEl) {
                const now = new Date();
                const timeStr = now.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                });
                timeEl.textContent = timeStr;
            }
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    },
    
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + K = Buscar
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('global-search');
                if (searchInput) searchInput.focus();
            }
            
            // ESC = Cerrar modales
            if (e.key === 'Escape') {
                this.hideModals();
                
                // También cerrar ventana enfocada si existe
                const focusedWindow = Array.from(this.openWindows.values())
                    .find(w => w.style.zIndex === String(this.windowZIndex));
                if (focusedWindow && !focusedWindow.classList.contains('minimized')) {
                    const windowId = focusedWindow.id;
                    if (windowId) this.closeWindow(windowId);
                }
            }
            
            // F11 = Pantalla completa
            if (e.key === 'F11') {
                e.preventDefault();
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
                }
            }
        });
    },
    
    showContextMenu(x, y, options) {
        // Implementar menú contextual si es necesario
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) existingMenu.remove();
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        
        options.forEach(opt => {
            const item = document.createElement('div');
            item.className = 'context-menu-item';
            item.innerHTML = `<i class="fas ${opt.icon}"></i> ${opt.label}`;
            item.onclick = () => {
                opt.action();
                menu.remove();
            };
            menu.appendChild(item);
        });
        
        document.body.appendChild(menu);
        
        // Cerrar al hacer click fuera
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    }
};

// Inicializar UI
const ui = UIManager;
window.ui = ui;

// Inicializar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    ui.init();
    ui.restoreSidebarState();
});