// ============================================
// 👨‍⚕️ PROFESIONALES DE SALUD
// ============================================

let ProfesionalesApp = {
    profesionales: [
        { nombre: 'Dra. María González', especialidad: 'Psicología Clínica', telefono: '01 234 5678', disponible: true, rating: 4.8 },
        { nombre: 'Dr. Carlos Ruiz', especialidad: 'Psiquiatría', telefono: '01 876 5432', disponible: true, rating: 4.9 },
        { nombre: 'Lic. Ana Martínez', especialidad: 'Terapia Familiar', telefono: '01 345 6789', disponible: false, rating: 4.5 }
    ],
    
    async render() {
        return `
            <div>
                <h3>👨‍⚕️ Profesionales de Salud</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">Encuentra ayuda profesional cerca de ti</p>
                
                <div class="dashboard-grid">
                    ${this.profesionales.map(p => `
                        <div class="dashboard-card">
                            <h4>${p.nombre}</h4>
                            <p><i class="fas fa-stethoscope"></i> ${p.especialidad}</p>
                            <p><i class="fas fa-phone"></i> ${p.telefono}</p>
                            <p><i class="fas fa-star" style="color: gold;"></i> ${p.rating}</p>
                            <span style="color: ${p.disponible ? 'var(--success)' : 'var(--error)'}">
                                ${p.disponible ? '✅ Disponible' : '⏰ No disponible'}
                            </span>
                            <button class="btn-hologram" style="margin-top: 10px;" onclick="ProfesionalesApp.contactar('${p.telefono}')">
                                Contactar
                            </button>
                        </div>
                    `).join('')}
                </div>
                
                <div class="dashboard-card" style="margin-top: 20px;">
                    <h4>🔍 Buscar Profesional</h4>
                    <input type="text" id="buscar-profesional" class="text-input-3d" placeholder="Especialidad, nombre...">
                    <button class="btn-hologram" onclick="ProfesionalesApp.buscar()">Buscar</button>
                </div>
            </div>
        `;
    },
    
    contactar(telefono) {
        if (window.ui) ui.showNotification('Contactando a ' + telefono, 'info');
        window.open('tel:' + telefono);
    },
    
    buscar() {
        let query = document.getElementById('buscar-profesional').value.toLowerCase();
        let resultados = this.profesionales.filter(p => 
            p.nombre.toLowerCase().includes(query) || 
            p.especialidad.toLowerCase().includes(query)
        );
        if (resultados.length === 0) {
            if (window.ui) ui.showNotification('No se encontraron profesionales', 'warning');
        } else {
            if (window.ui) ui.showNotification('Encontrados ' + resultados.length + ' profesionales', 'success');
        }
    }
};
