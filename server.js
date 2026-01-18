const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

let brainrots = [];

app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
        <html>
        <style>body{font-family:Arial;padding:20px;background:#0f0c29;color:white;}</style>
        <h1>🧠 Brainrot API</h1>
        <p>✅ Funcionando</p>
        <p>📊 Brainrots: ${brainrots.length}</p>
        </html>
    `);
});

app.get('/api/brainrots', (req, res) => {
    res.json({ success: true, data: brainrots });
});

app.post('/api/brainrots', (req, res) => {
    const { name, money, players, jobId } = req.body;
    
    if (!jobId) return res.json({ error: 'Sin Job ID' });
    
    // Agregar nuevo
    brainrots.unshift({
        id: jobId,
        name: name || 'Desconocido',
        money: money || '$0M/s',
        players: players || '0/0',
        time: new Date().toLocaleTimeString()
    });
    
    // Mantener últimos 20
    if (brainrots.length > 20) brainrots = brainrots.slice(0, 20);
    
    console.log(`✅ ${name} | ${money} | ${players}`);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`🚀 API: http://localhost:${PORT}`);
});