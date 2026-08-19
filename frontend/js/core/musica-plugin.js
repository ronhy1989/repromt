// ==================== PLUGIN DE MÚSICA PERSISTENTE ====================
// Se activa SOLO cuando el usuario tiene Premium (comprado) o Demo activa desde la tienda
// El reproductor vive en el SISTEMA, NO dentro del iframe de la app

(function() {
    'use strict';
    
    let pluginActivo = false;
    let currentTrack = null;
    let isPlaying = false;
    let currentIframe = null;
    let progressInterval = null;
    let currentVolume = 70;
    let isMinimized = false;
    
    // ==================== BIBLIOTECA DE MÚSICA ====================
    const MUSICA_LIBRARY = {
        concentracion: [
            { id: 1, nombre: "LoFi Hip Hop Radio", artista: "LoFi Girl", duracion: "∞", youtubeId: "5qap5aO4i9A", tipo: "live" },
            { id: 2, nombre: "Música Clásica", artista: "Mozart", duracion: "120 min", youtubeId: "jGPg9VqP2vY", tipo: "video" },
            { id: 3, nombre: "Piano Relajante", artista: "Piano Music", duracion: "60 min", youtubeId: "vWGb4yPw3oQ", tipo: "video" }
        ],
        dormir: [
            { id: 4, nombre: "528 Hz - Sanación Profunda", artista: "Frecuencia del Amor", duracion: "∞", youtubeId: "YkBntoPOOUM", tipo: "live" },
            { id: 5, nombre: "Sonido de Lluvia", artista: "Naturaleza", duracion: "∞", youtubeId: "mPZkdNFkNps", tipo: "live" },
            { id: 6, nombre: "Ruido Blanco", artista: "White Noise", duracion: "∞", youtubeId: "nMfPqeZjc2c", tipo: "live" }
        ],
        meditar: [
            { id: 7, nombre: "Meditación Guiada", artista: "Mindfulness", duracion: "30 min", youtubeId: "inpok4MKVLM", tipo: "video" },
            { id: 8, nombre: "Sonidos del Bosque", artista: "Naturaleza", duracion: "∞", youtubeId: "T5B2S2xXm4c", tipo: "live" }
        ],
        motivacion: [
            { id: 9, nombre: "Música Motivacional", artista: "Epic Music", duracion: "60 min", youtubeId: "ASj81daun5Q", tipo: "video" },
            { id: 10, nombre: "Rock Energético", artista: "Classic Rock", duracion: "60 min", youtubeId: "fJ9rUzIMcZQ", tipo: "video" }
        ],
        audiolibros: [
            { id: 11, nombre: "Hábitos Atómicos", artista: "James Clear", duracion: "15 min", youtubeId: "U5PZmN4wI2s", tipo: "video" },
            { id: 12, nombre: "El Poder del Ahora", artista: "Eckhart Tolle", duracion: "20 min", youtubeId: "xLJotO8OEo8", tipo: "video" }
        ]
    };
    
    // ==================== VERIFICAR LICENCIA DESDE LA TIENDA ====================
    function verificarLicenciaDesdeStore() {
        try {
            // 1. Verificar si el plugin está instalado permanentemente (comprado)
            const plugins = localStorage.getItem('repromt_plugins');
            if (plugins) {
                const pluginsArray = JSON.parse(plugins);
                if (pluginsArray.includes('musica')) {
                    console.log('🎵 Plugin de música: LICENCIA PERMANENTE activada');
                    return { activo: true, tipo: 'permanente' };
                }
            }
            
            // 2. Verificar demo activa desde la tienda
            const demos = localStorage.getItem('reprompt_plugins_demo');
            if (demos) {
                const demosObj = JSON.parse(demos);
                if (demosObj.musica && demosObj.musica.expira > Date.now()) {
                    const diasRestantes = Math.ceil((demosObj.musica.expira - Date.now()) / (1000 * 60 * 60 * 24));
                    console.log(`🎵 Plugin de música: DEMO ACTIVA (${diasRestantes} días restantes)`);
                    return { activo: true, tipo: 'demo', expira: demosObj.musica.expira };
                }
            }
        } catch(e) {
            console.error('Error verificando licencia de música:', e);
        }
        return { activo: false };
    }
    
    // ==================== CREAR REPRODUCTOR GLOBAL ====================
    function crearReproductor() {
        if (document.getElementById('globalMusicPlayer')) return;
        
        // Añadir FontAwesome si no existe
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fa = document.createElement('link');
            fa.rel = 'stylesheet';
            fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fa);
        }
        
        const html = `
            <div id="globalMusicPlayer" style="display: none; position: fixed; bottom: 20px; right: 20px; width: 360px; background: linear-gradient(135deg, #1a1a24, #0f0f14); border-radius: 20px; box-shadow: 0 12px 40px rgba(0,0,0,0.5); border: 1px solid rgba(29,185,84,0.4); z-index: 999999; backdrop-filter: blur(20px); font-family: system-ui, -apple-system, sans-serif; transition: all 0.3s;">
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(0,0,0,0.6); border-radius: 20px 20px 0 0; cursor: move; border-bottom: 1px solid rgba(29,185,84,0.3);" id="playerDragHandle">
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                        <div style="width: 32px; height: 32px; background: #1DB954; border-radius: 8px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-headphones" style="color: white; font-size: 14px;"></i></div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 12px; font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="playerTitle">Selecciona música</div>
                            <div style="font-size: 10px; color: #1DB954; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="playerArtist">-</div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="player-ctrl" data-action="prev" style="background: rgba(255,255,255,0.1); border: none; width: 28px; height: 28px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fas fa-backward" style="font-size: 12px;"></i></button>
                            <button class="player-ctrl" data-action="playpause" style="background: rgba(255,255,255,0.1); border: none; width: 28px; height: 28px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fas fa-play" style="font-size: 12px;"></i></button>
                            <button class="player-ctrl" data-action="next" style="background: rgba(255,255,255,0.1); border: none; width: 28px; height: 28px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fas fa-forward" style="font-size: 12px;"></i></button>
                        </div>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button class="window-ctrl" data-action="minimize" style="background: none; border: none; color: #888; cursor: pointer; width: 24px; height: 24px; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-minus" style="font-size: 12px;"></i></button>
                        <button class="window-ctrl" data-action="close" style="background: none; border: none; color: #888; cursor: pointer; width: 24px; height: 24px; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-times" style="font-size: 12px;"></i></button>
                    </div>
                </div>
                <div id="playerExpanded" style="padding: 16px;">
                    <div id="videoContainer" style="width: 100%; height: 180px; background: #000; border-radius: 12px; margin-bottom: 16px; overflow: hidden;"></div>
                    <div style="text-align: center; margin-bottom: 16px;">
                        <div style="font-size: 16px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="expandedTitle">-</div>
                        <div style="font-size: 12px; color: #1DB954;" id="expandedArtist">-</div>
                    </div>
                    <div style="display: flex; justify-content: center; gap: 20px; margin: 16px 0;">
                        <button class="big-ctrl" data-action="prev" style="background: rgba(255,255,255,0.1); border: none; width: 44px; height: 44px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fas fa-backward" style="font-size: 18px;"></i></button>
                        <button class="big-ctrl playpause" data-action="playpause" style="background: #1DB954; border: none; width: 56px; height: 56px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 22px;"><i class="fas fa-play"></i></button>
                        <button class="big-ctrl" data-action="next" style="background: rgba(255,255,255,0.1); border: none; width: 44px; height: 44px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fas fa-forward" style="font-size: 18px;"></i></button>
                    </div>
                    <div style="margin: 12px 0;">
                        <div id="progressBar" style="height: 4px; background: rgba(255,255,255,0.2); border-radius: 4px; cursor: pointer;">
                            <div id="progressFill" style="height: 100%; background: #1DB954; width: 0%; border-radius: 4px;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 10px; color: #888; font-family: monospace;">
                            <span id="currentTime">00:00</span>
                            <span id="totalTime">00:00</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <i class="fas fa-volume-down" style="font-size: 12px; color: #888;"></i>
                        <div id="volumeSlider" style="flex: 1; height: 3px; background: rgba(255,255,255,0.2); border-radius: 3px; cursor: pointer;">
                            <div id="volumeFill" style="height: 100%; background: #1DB954; width: 70%; border-radius: 3px;"></div>
                        </div>
                        <i class="fas fa-volume-up" style="font-size: 12px; color: #888;"></i>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', html);
        
        // Estilos adicionales
        const style = document.createElement('style');
        style.textContent = `
            #globalMusicPlayer.minimized { width: 280px; }
            #globalMusicPlayer.minimized #playerExpanded { display: none; }
            .player-ctrl:hover, .big-ctrl:hover { background: #1DB954 !important; transform: scale(1.05); }
            .window-ctrl:hover { background: rgba(255,255,255,0.2) !important; color: white !important; }
            .window-ctrl[data-action="close"]:hover { background: #ef4444 !important; }
        `;
        document.head.appendChild(style);
        
        asignarEventos();
        hacerArrastrable();
    }
    
    function asignarEventos() {
        document.querySelectorAll('.player-ctrl, .big-ctrl').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                if (action === 'prev') prevTrack();
                if (action === 'playpause') togglePlayPause();
                if (action === 'next') nextTrack();
            });
        });
        
        document.querySelectorAll('.window-ctrl').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                if (action === 'minimize') toggleMinimize();
                if (action === 'close') closePlayer();
            });
        });
        
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.addEventListener('click', (e) => {
                const rect = volumeSlider.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width * 100;
                setVolume(percent);
            });
        }
        
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width * 100;
                if (currentIframe) {
                    const seekTo = (percent / 100) * 300;
                    currentIframe.contentWindow.postMessage(`{"event":"command","func":"seekTo","args":[${seekTo}, true]}`, '*');
                }
            });
        }
    }
    
    function hacerArrastrable() {
        const player = document.getElementById('globalMusicPlayer');
        const dragHandle = document.getElementById('playerDragHandle');
        if (!player || !dragHandle) return;
        
        let isDragging = false, offsetX, offsetY;
        
        dragHandle.addEventListener('mousedown', (e) => {
            if (e.target.closest('.player-ctrl') || e.target.closest('.window-ctrl')) return;
            isDragging = true;
            offsetX = e.clientX - player.offsetLeft;
            offsetY = e.clientY - player.offsetTop;
            player.style.transition = 'none';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                let left = e.clientX - offsetX;
                let top = e.clientY - offsetY;
                left = Math.min(window.innerWidth - player.offsetWidth - 10, Math.max(10, left));
                top = Math.min(window.innerHeight - player.offsetHeight - 10, Math.max(10, top));
                player.style.left = left + 'px';
                player.style.top = top + 'px';
                player.style.right = 'auto';
                player.style.bottom = 'auto';
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            player.style.transition = '';
        });
    }
    
    function iniciarReproductor(track) {
        if (!pluginActivo) {
            console.warn('⚠️ Plugin de música no activo. Compra o activa demo en la tienda.');
            return false;
        }
        
        crearReproductor();
        currentTrack = track;
        
        // Actualizar UI
        document.getElementById('playerTitle').innerText = track.nombre;
        document.getElementById('playerArtist').innerText = track.artista;
        document.getElementById('expandedTitle').innerText = track.nombre;
        document.getElementById('expandedArtist').innerText = track.artista;
        document.getElementById('totalTime').innerText = track.duracion;
        
        // Crear iframe
        const container = document.getElementById('videoContainer');
        container.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.id = 'youtubePlayerGlobal';
        iframe.src = `https://www.youtube.com/embed/${track.youtubeId}?autoplay=1&enablejsapi=1&controls=0&rel=0&modestbranding=1`;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        container.appendChild(iframe);
        currentIframe = iframe;
        
        // Mostrar y reproducir
        document.getElementById('globalMusicPlayer').style.display = 'block';
        isPlaying = true;
        actualizarBotonesPlay(true);
        iniciarSimulacionProgreso();
        setVolume(currentVolume);
        
        // Guardar estado para restaurar al recargar
        localStorage.setItem('reprompt_music_state', JSON.stringify({
            track: track,
            isPlaying: true,
            timestamp: Date.now()
        }));
        
        console.log('🎵 Reproduciendo:', track.nombre);
        return true;
    }
    
    function togglePlayPause() {
        if (!currentIframe) return;
        if (isPlaying) {
            currentIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            isPlaying = false;
        } else {
            currentIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            isPlaying = true;
        }
        actualizarBotonesPlay(isPlaying);
    }
    
    function actualizarBotonesPlay(playing) {
        const icon = playing ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        document.querySelectorAll('[data-action="playpause"]').forEach(btn => {
            btn.innerHTML = icon;
        });
        
        if (playing && !progressInterval) {
            iniciarSimulacionProgreso();
        } else if (!playing && progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
    }
    
    function iniciarSimulacionProgreso() {
        if (progressInterval) clearInterval(progressInterval);
        let progress = 0;
        progressInterval = setInterval(() => {
            if (isPlaying && progress < 100) {
                progress += 0.33;
                document.getElementById('progressFill').style.width = `${Math.min(progress, 100)}%`;
                const minutes = Math.floor(progress / 100 * 5);
                const seconds = Math.floor((progress / 100 * 5) % 1 * 60);
                document.getElementById('currentTime').innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else if (progress >= 100) {
                nextTrack();
            }
        }, 500);
    }
    
    function setVolume(value) {
        currentVolume = Math.min(100, Math.max(0, value));
        const fill = document.getElementById('volumeFill');
        if (fill) fill.style.width = `${currentVolume}%`;
        if (currentIframe) {
            currentIframe.contentWindow.postMessage(`{"event":"command","func":"setVolume","args":[${currentVolume}]}`, '*');
        }
    }
    
    function nextTrack() {
        if (!currentTrack) return;
        const allSongs = Object.values(MUSICA_LIBRARY).flat();
        const currentIndex = allSongs.findIndex(c => c.id === currentTrack.id);
        let nextIndex = currentIndex + 1;
        if (nextIndex >= allSongs.length) nextIndex = 0;
        if (allSongs[nextIndex]) {
            iniciarReproductor(allSongs[nextIndex]);
        }
    }
    
    function prevTrack() {
        if (!currentTrack) return;
        const allSongs = Object.values(MUSICA_LIBRARY).flat();
        const currentIndex = allSongs.findIndex(c => c.id === currentTrack.id);
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = allSongs.length - 1;
        if (allSongs[prevIndex]) {
            iniciarReproductor(allSongs[prevIndex]);
        }
    }
    
    function toggleMinimize() {
        const player = document.getElementById('globalMusicPlayer');
        if (!player) return;
        isMinimized = !isMinimized;
        if (isMinimized) {
            player.classList.add('minimized');
            const minBtn = document.querySelector('.window-ctrl[data-action="minimize"] i');
            if (minBtn) minBtn.className = 'fas fa-square';
        } else {
            player.classList.remove('minimized');
            const minBtn = document.querySelector('.window-ctrl[data-action="minimize"] i');
            if (minBtn) minBtn.className = 'fas fa-minus';
        }
    }
    
    function closePlayer() {
        if (progressInterval) clearInterval(progressInterval);
        if (currentIframe) {
            currentIframe.src = '';
        }
        const player = document.getElementById('globalMusicPlayer');
        if (player) player.style.display = 'none';
        isPlaying = false;
        currentTrack = null;
        localStorage.removeItem('reprompt_music_state');
        console.log('🔇 Reproductor cerrado');
    }
    
    function restaurarEstado() {
        const saved = localStorage.getItem('reprompt_music_state');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                if (state.track && (Date.now() - state.timestamp < 3600000)) { // 1 hora
                    setTimeout(() => iniciarReproductor(state.track), 500);
                }
            } catch(e) {}
        }
    }
    
    // ==================== API PÚBLICA ====================
    window.RepromptMusicPlugin = {
        // Verificar y actualizar estado desde la tienda
        refreshStatus: function() {
            const licencia = verificarLicenciaDesdeStore();
            const estabaActivo = pluginActivo;
            pluginActivo = licencia.activo;
            
            if (pluginActivo && !estabaActivo) {
                console.log('🎵 Plugin de música ACTIVADO desde la tienda');
                restaurarEstado();
            } else if (!pluginActivo && estabaActivo) {
                console.log('🔒 Plugin de música DESACTIVADO (demo expirada o desinstalado)');
                closePlayer();
            }
            return pluginActivo;
        },
        
        // Reproducir una canción (llamado desde la app)
        playTrack: function(track) {
            this.refreshStatus(); // Verificar estado actualizado
            if (!pluginActivo) {
                console.warn('⚠️ Plugin no activo. Premium necesario.');
                return false;
            }
            if (track) {
                return iniciarReproductor(track);
            }
            return false;
        },
        
        // Verificar si el plugin está activo
        isActive: function() {
            this.refreshStatus();
            return pluginActivo;
        },
        
        // Obtener información de la licencia
        getLicenseInfo: function() {
            return verificarLicenciaDesdeStore();
        },
        
        // Obtener canción actual
        getCurrentTrack: function() {
            return currentTrack;
        },
        
        // Obtener biblioteca completa
        getLibrary: function() {
            return MUSICA_LIBRARY;
        },
        
        // Pausar/reanudar
        togglePlayPause: function() {
            togglePlayPause();
        },
        
        // Cerrar reproductor
        close: function() {
            closePlayer();
        }
    };
    
    // ==================== ESCUCHAR CAMBIOS EN LA TIENDA ====================
    // Escuchar mensajes desde la tienda o la app
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'REPROMPT_MUSIC_PLAY') {
            if (window.RepromptMusicPlugin.isActive()) {
                window.RepromptMusicPlugin.playTrack(event.data.track);
                if (event.source) {
                    event.source.postMessage({ type: 'REPROMPT_MUSIC_PLAY_CONFIRMED', track: event.data.track }, '*');
                }
            } else {
                if (event.source) {
                    event.source.postMessage({ type: 'REPROMPT_MUSIC_NEED_PREMIUM' }, '*');
                }
            }
        }
        
        // Escuchar cuando se instala o desinstala un plugin desde la tienda
        if (event.data && event.data.type === 'PLUGIN_INSTALLED' && event.data.pluginId === 'musica') {
            console.log('🔄 Plugin de música instalado, actualizando estado');
            window.RepromptMusicPlugin.refreshStatus();
        }
        if (event.data && event.data.type === 'PLUGIN_UNINSTALLED' && event.data.pluginId === 'musica') {
            console.log('🔄 Plugin de música desinstalado');
            window.RepromptMusicPlugin.refreshStatus();
        }
    });
    
    // También escuchar cambios en localStorage (para cuando la tienda actualiza)
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        if (key === 'repromt_plugins' || key === 'reprompt_plugins_demo') {
            console.log('🔄 Cambio detectado en licencias de música');
            if (window.RepromptMusicPlugin) {
                window.RepromptMusicPlugin.refreshStatus();
            }
        }
    };
    
    // Inicializar al cargar la página
    function init() {
        const licencia = verificarLicenciaDesdeStore();
        pluginActivo = licencia.activo;
        if (pluginActivo) {
            console.log(`🎵 Plugin de música INICIADO (${licencia.tipo})`);
            restaurarEstado();
        } else {
            console.log('🔒 Plugin de música INACTIVO - Compra o activa demo en la tienda');
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    console.log('🎵 Plugin de música cargado. Estado:', pluginActivo ? 'ACTIVO' : 'INACTIVO');
})();