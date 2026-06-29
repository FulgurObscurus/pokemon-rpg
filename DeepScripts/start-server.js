const fs = require('fs');
const http = require('http');
const path = require('path');
const { exec } = require('child_process');
const { PATHS } = require('./config.js');

const PORT = 8080;
const publicDir = PATHS.GAME_DIR;

const server = http.createServer((req, res) => {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(publicDir, filePath);
    const ext = path.extname(filePath);
    const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg'
    }[ext] || 'text/plain';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`🌐 Сервер запущен на ${url}`);
    console.log(`📂 Корневая директория: ${publicDir}`);
    console.log('🔄 Сервер автоматически завершится через 3 секунды после закрытия последнего соединения');
    // Открываем браузер
    exec(`termux-open-url ${url}`, (err) => {
        if (err) {
            console.log('⚠️ Не удалось открыть браузер автоматически. Откройте вручную:', url);
        } else {
            console.log('✅ Браузер открыт');
        }
    });
});

// Автоматическое завершение при отсутствии соединений
let connectionCount = 0;
server.on('connection', (socket) => {
    connectionCount++;
    socket.on('close', () => {
        connectionCount--;
        if (connectionCount === 0) {
            console.log('⚠️ Все соединения закрыты. Сервер завершится через 3 секунды...');
            setTimeout(() => {
                process.exit(0);
            }, 3000);
        }
    });
});

// Завершение при нажатии Ctrl+C
process.on('SIGINT', () => {
    console.log('🛑 Сервер остановлен вручную');
    process.exit(0);
});
