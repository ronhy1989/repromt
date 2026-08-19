const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
    console.log(`📡 ${req.method} ${req.url}`);
    
    // Normalizar URL
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Prevenir path traversal attacks
    const safePath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '');
    filePath = path.join(__dirname, safePath);
    
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Archivo no encontrado - Intentar servir index.html para SPA
                const indexPath = path.join(__dirname, 'index.html');
                fs.readFile(indexPath, (err2, indexData) => {
                    if (err2) {
                        console.log(`❌ 404: ${req.url}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(`
                            <!DOCTYPE html>
                            <html>
                            <head><title>404 - No encontrado</title></head>
                            <body style="font-family: monospace; padding: 50px; text-align: center;">
                                <h1>🔍 404 - Página no encontrada</h1>
                                <p>El archivo <code>${req.url}</code> no existe en el servidor.</p>
                                <a href="/" style="color: #6366F1;">Volver al inicio</a>
                            </body>
                            </html>
                        `);
                        return;
                    }
                    console.log(`✅ SPA Fallback: ${req.url} → index.html`);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(indexData);
                });
            } else {
                console.log(`❌ Error interno: ${err.code} - ${req.url}`);
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head><title>500 - Error del servidor</title></head>
                    <body style="font-family: monospace; padding: 50px; text-align: center;">
                        <h1>⚠️ 500 - Error interno del servidor</h1>
                        <p>Código: ${err.code}</p>
                        <a href="/" style="color: #6366F1;">Volver al inicio</a>
                    </body>
                    </html>
                `);
            }
            return;
        }
        
        console.log(`✅ 200: ${req.url} (${contentType})`);
        res.writeHead(200, { 
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         🚀 FRONTEND - REPROMT OS                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n📁 Serviendo: ${__dirname}`);
    console.log(`🌐 Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`🔄 Modo SPA: Activado (fallback a index.html)`);
    console.log(`\n📋 Archivos servidos correctamente:`);
    console.log(`   - HTML, CSS, JS, imágenes, fuentes`);
    console.log(`\n✨ Servidor listo para recibir peticiones\n`);
});