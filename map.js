// =======================================================================
// КАРТА И ПЕРЕМЕЩЕНИЕ
// =======================================================================

let canvas = null;
let ctx = null;
let player = { x: 5, y: 5 };
let lastDirection = 'down';
let mapData = [];
const TILE_SIZE = 32;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 30;

// Инициализация карты
function initMap() {
    canvas = document.querySelector('canvas');
    if (!canvas) {
        console.error('Canvas не найден!');
        return;
    }
    
    ctx = canvas.getContext('2d');
    canvas.width = MAP_WIDTH * TILE_SIZE;
    canvas.height = MAP_HEIGHT * TILE_SIZE;
    
    generateMap();
    renderMap();
    
    // Привязка кнопок джойстика
    document.getElementById('btn-up').addEventListener('click', function() {
        movePlayer('up');
        lastDirection = 'up';
    });
    
    document.getElementById('btn-down').addEventListener('click', function() {
        movePlayer('down');
        lastDirection = 'down';
    });
    
    document.getElementById('btn-left').addEventListener('click', function() {
        movePlayer('left');
        lastDirection = 'left';
    });
    
    document.getElementById('btn-right').addEventListener('click', function() {
        movePlayer('right');
        lastDirection = 'right';
    });
    
    console.log('[map] Карта инициализирована');
}

function generateMap() {
    mapData = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        mapData[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (Math.random() < 0.1 && !(x === player.x && y === player.y)) {
                mapData[y][x] = 'tree';
            } else {
                mapData[y][x] = 'grass';
            }
        }
    }
}

function renderMap() {
    if (!ctx) return;
    
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (mapData[y][x] === 'tree') {
                ctx.fillStyle = '#2E7D32';
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(x * TILE_SIZE + TILE_SIZE/2 - 4, y * TILE_SIZE + TILE_SIZE/2, 8, TILE_SIZE/2);
            }
        }
    }
    
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(player.x * TILE_SIZE + 4, player.y * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x * TILE_SIZE + 8, player.y * TILE_SIZE + 10, 6, 6);
    ctx.fillRect(player.x * TILE_SIZE + 18, player.y * TILE_SIZE + 10, 6, 6);
}

function movePlayer(direction) {
    let newX = player.x;
    let newY = player.y;
    
    switch(direction) {
        case 'up': newY--; break;
        case 'down': newY++; break;
        case 'left': newX--; break;
        case 'right': newX++; break;
    }
    
    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) {
        return;
    }
    
    if (mapData[newY][newX] === 'tree') {
        return;
    }
    
    player.x = newX;
    player.y = newY;
    renderMap();
}

// Инициализация
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(initMap, 500);
});
