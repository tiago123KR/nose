const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Base de datos en memoria
let brainrots = [];

app.use(express.json());

// Permitir CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

// Página principal
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🧠 Brainrot Notify API</title>
            <style>
                body {
                    font-family: 'Segoe UI', Arial, sans-serif;
                    padding: 20px;
                    background: linear-gradient(135deg, #0f0c29, #302b63);
                    color: white;
                    min-height: 100vh;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: rgba(0, 0, 0, 0.7);
                    padding: 30px;
                    border-radius: 15px;
                    border: 1px solid rgba(0, 255, 157, 0.3);
                }
                h1 {
                    color: #00ff9d;
                    text-align: center;
                    margin-bottom: 20px;
                }
                .stats {
                    display: flex;
                    justify-content: space-around;
                    margin-bottom: 30px;
                }
                .stat-card {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 20px;
                    border-radius: 10px;
                    text-align: center;
                    min-width: 150px;
                }
                .stat-value {
                    font-size: 2em;
                    font-weight: bold;
                    color: #00ff9d;
                    margin: 10px 0;
                }
                .brainrot-card {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 15px;
                    margin: 10px 0;
                    border-radius: 8px;
                    border-left: 4px solid #00ff9d;
                }
                .brainrot-name {
                    color: #fff;
                    font-weight: bold;
                    font-size: 1.1em;
                }
                .brainrot-details {
                    color: #ccc;
                    margin: 5px 0;
                }
                .brainrot-id {
                    color: #888;
                    font-size: 0.9em;
                    font-family: monospace;
                    word-break: break-all;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🧠 Brainrot Notify API</h1>
                
                <div class="stats">
                    <div class="stat-card">
                        <div>Total Brainrots</div>
                        <div class="stat-value">${brainrots.length}</div>
                    </div>
                    <div class="stat-card">
                        <div>Último</div>
                        <div class="stat-value">${brainrots.length > 0 ? brainrots[0].name.substring(0, 10) + '...' : 'Ninguno'}</div>
                    </div>
                    <div class="stat-card">
                        <div>Estado</div>
                        <div class="stat-value">🟢 Activo</div>
                    </div>
                </div>
                
                <h3>Últimos Brainrots Detectados:</h3>
                ${brainrots.length > 0 ? brainrots.slice(0, 10).map(brainrot => `
                    <div class="brainrot-card">
                        <div class="brainrot-name">${brainrot.name}</div>
                        <div class="brainrot-details">
                            💰 ${brainrot.money} | 👥 ${brainrot.players} | ⏰ ${brainrot.time}
                        </div>
                        <div class="brainrot-id">ID: ${brainrot.id.substring(0, 40)}...</div>
                    </div>
                `).join('') : '<p style="text-align:center;color:#888;">Esperando brainrots...</p>'}
                
                <div style="margin-top:30px;padding:15px;background:rgba(0,255,157,0.1);border-radius:8px;">
                    <strong>📡 Endpoints:</strong><br>
                    <code>GET /api/brainrots</code> - Obtener todos los brainrots<br>
                    <code>POST /api/brainrots</code> - Agregar nuevo brainrot<br>
                    <strong>🔗 Para Roblox:</strong> <code>${req.protocol}://${req.get('host')}/api/brainrots</code>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Obtener todos los brainrots
app.get('/api/brainrots', (req, res) => {
    res.json({
        success: true,
        data: brainrots,
        count: brainrots.length,
        lastUpdate: brainrots.length > 0 ? brainrots[0].timestamp : null
    });
});

// Agregar nuevo brainrot
app.post('/api/brainrots', (req, res) => {
    const { name, money, players, jobId } = req.body;
    
    if (!jobId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Se requiere Job ID' 
        });
    }
    
    // Verificar si ya existe (mismo ID en últimos 5 minutos)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const isDuplicate = brainrots.some(b => 
        b.id === jobId && 
        new Date(b.timestamp).getTime() > fiveMinutesAgo
    );
    
    if (!isDuplicate) {
        const newBrainrot = {
            id: jobId,
            name: name || 'Desconocido',
            money: money || '$0M/s',
            players: players || '0/0',
            time: new Date().toLocaleTimeString(),
            timestamp: new Date().toISOString()
        };
        
        // Agregar al inicio del array
        brainrots.unshift(newBrainrot);
        
        // Mantener últimos 30 brainrots
        if (brainrots.length > 30) {
            brainrots = brainrots.slice(0, 30);
        }
        
        console.log(`✅ Brainrot guardado: ${name} | ${money} | ${players} | ${jobId.substring(0, 20)}...`);
        
        res.json({
            success: true,
            message: 'Brainrot guardado exitosamente',
            brainrot: newBrainrot
        });
    } else {
        res.json({
            success: true,
            message: 'Brainrot duplicado (ignorado)'
        });
    }
});

// Limpiar brainrots antiguos (más de 1 hora)
setInterval(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const initialCount = brainrots.length;
    
    brainrots = brainrots.filter(b => 
        new Date(b.timestamp).getTime() > oneHourAgo
    );
    
    if (initialCount !== brainrots.length) {
        console.log(`🧹 Limpiados ${initialCount - brainrots.length} brainrots antiguos`);
    }
}, 300000); // Cada 5 minutos

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n🚀 BRAINROT NOTIFY API`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📊 Endpoint: /api/brainrots`);
    console.log(`💡 Listo para recibir brainrots...\n`);
});
