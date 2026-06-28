// =======================================================================
// КАРТА МИРА (финальная, без ошибок)
// =======================================================================
const canvas = document.createElement('canvas');
canvas.width = Math.min(window.innerWidth - 20, 800);
canvas.height = Math.min(window.innerHeight - 200, 400);
canvas.style.width = '100%';
canvas.style.height = 'auto';
canvas.style.border = '4px solid #7b4a9e';
canvas.style.borderRadius = '12px';
canvas.style.marginBottom = '10px';
canvas.style.display = 'block';

const gameDiv = document.getElementById('game');
const battleScreen = document.getElementById('battle-screen');
gameDiv.insertBefore(canvas, battleScreen);
battleScreen.style.display = 'none';

const ctx = canvas.getContext('2d');
const player = { x: 100, y: 100, size: 24, speed: 4 };
const keys = { w: false, a: false, s: false, d: false };

function drawMap() {
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 30; i++) {
        ctx.fillStyle = '#388e3c';
        ctx.beginPath();
        ctx.arc(30 + i * 40, 40 + Math.sin(i) * 20, 8, 0, Math.PI * 2);
        ctx.fill();
    }
    const trees = [[50,50],[200,80],[350,40],[500,70],[100,350],[300,380],[550,340]];
    for (let [tx, ty] of trees) {
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(tx, ty, 12, 20);
        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.arc(tx + 6, ty - 6, 16, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(player.x, player.y, player.size, player.size);
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x + 6, player.y + 6, 6, 6);
    ctx.fillRect(player.x + 14, player.y + 6, 6, 6);
}

function gameLoop() {
    if (keys.w && player.y > 0) player.y -= player.speed;
    if (keys.s && player.y < canvas.height - player.size) player.y += player.speed;
    if (keys.a && player.x > 0) player.x -= player.speed;
    if (keys.d && player.x < canvas.width - player.size) player.x += player.speed;
    drawMap();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', () => {
    canvas.width = Math.min(window.innerWidth - 20, 800);
    canvas.height = Math.min(window.innerHeight - 200, 400);
});

document.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') keys.w = true;
    if (k === 's' || k === 'arrowdown') keys.s = true;
    if (k === 'a' || k === 'arrowleft') keys.a = true;
    if (k === 'd' || k === 'arrowright') keys.d = true;
});
document.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') keys.w = false;
    if (k === 's' || k === 'arrowdown') keys.s = false;
    if (k === 'a' || k === 'arrowleft') keys.a = false;
    if (k === 'd' || k === 'arrowright') keys.d = false;
});

document.addEventListener('DOMContentLoaded', function() {
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnAction = document.getElementById('btn-action');

    if (btnUp) {
        btnUp.addEventListener('touchstart', (e) => { e.preventDefault(); keys.w = true; });
        btnUp.addEventListener('touchend', (e) => { e.preventDefault(); keys.w = false; });
        btnUp.addEventListener('mousedown', () => keys.w = true);
        btnUp.addEventListener('mouseup', () => keys.w = false);
    }
    if (btnDown) {
        btnDown.addEventListener('touchstart', (e) => { e.preventDefault(); keys.s = true; });
        btnDown.addEventListener('touchend', (e) => { e.preventDefault(); keys.s = false; });
        btnDown.addEventListener('mousedown', () => keys.s = true);
        btnDown.addEventListener('mouseup', () => keys.s = false);
    }
    if (btnLeft) {
        btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); keys.a = true; });
        btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); keys.a = false; });
        btnLeft.addEventListener('mousedown', () => keys.a = true);
        btnLeft.addEventListener('mouseup', () => keys.a = false);
    }
    if (btnRight) {
        btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); keys.d = true; });
        btnRight.addEventListener('touchend', (e) => { e.preventDefault(); keys.d = false; });
        btnRight.addEventListener('mousedown', () => keys.d = true);
        btnRight.addEventListener('mouseup', () => keys.d = false);
    }

    if (btnAction) {
        btnAction.addEventListener('click', function() {
            if (inBattle) return;
            const wild = generateWildPokemon();
            if (wild) {
                canvas.style.display = 'none';
                document.getElementById('controls').style.display = 'none';
                battleScreen.style.display = 'block';
                document.getElementById('hp-bars').style.display = 'flex';
                document.getElementById('actions').style.display = 'grid';
                document.getElementById('info-panel').style.display = 'flex';
                startBattle(wild);
                document.getElementById('btn-fight').textContent = '⚔️ Бой';
            }
        });
    }
});

window._canvas = canvas;
window._battleScreen = battleScreen;
gameLoop();
console.log('Карта загружена (финальная)');
