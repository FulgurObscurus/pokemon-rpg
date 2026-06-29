// =======================================================================
// КАРТА МИРА С НЕСКОЛЬКИМИ ЛОКАЦИЯМИ И ЗДАНИЯМИ (исправленная версия)
// =======================================================================

const canvas = document.createElement('canvas');
canvas.style.width = '100%';
canvas.style.height = '65vh';
canvas.style.border = '4px solid #7b4a9e';
canvas.style.borderRadius = '12px';
canvas.style.marginBottom = '10px';
canvas.style.display = 'block';

const gameDiv = document.getElementById('game');
const battleScreen = document.getElementById('battle-screen');
gameDiv.insertBefore(canvas, battleScreen);
battleScreen.style.display = 'none';

const ctx = canvas.getContext('2d');

const player = { x: 150, y: 150, size: 24, speed: 5 };
const keys = { w: false, a: false, s: false, d: false, e: false };

let currentLocation = 'pallet';
let isIndoors = false;
let currentBuilding = null;
let lastInteractionTime = 0;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(300, Math.floor(rect.width || (window.innerWidth - 20)));
  canvas.height = Math.max(240, Math.floor(window.innerHeight * 0.65));
}

function draw() {
  ctx.fillStyle = isIndoors ? '#d2b48c' : '#4caf50';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!isIndoors) {
    if (currentLocation === 'pallet') {
      drawBuilding(60, 40, 140, 110, '#8d6e63', 'Центр покемонов', 'center');
      drawBuilding(canvas.width - 200, 50, 130, 100, '#ff9800', 'Покемаркет', 'mart');
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.fillText('Pallet Town', 20, 25);
    } else if (currentLocation === 'route1') {
      ctx.fillStyle = '#2e7d32';
      for (let i = 0; i < 25; i++) {
        ctx.fillRect(15 + i * 32, 25 + (i % 4) * 35, 16, 16);
      }
      ctx.fillStyle = '#fff';
      ctx.fillText('Route 1', 20, 25);
    } else if (currentLocation === 'viridian') {
      drawBuilding(50, 30, 130, 100, '#8d6e63', 'Центр покемонов', 'center');
      drawBuilding(canvas.width - 180, 40, 120, 95, '#ff9800', 'Покемаркет', 'mart');
      ctx.fillStyle = '#fff';
      ctx.fillText('Viridian City', 20, 25);
    }
  } else {
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (currentBuilding === 'center') {
      ctx.fillStyle = '#ff69b4';
      ctx.fillRect(80, 60, 60, 40);
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.fillText('Nurse Joy', 85, 85);
      ctx.fillText('Нажми E рядом, чтобы лечить', 20, 140);
    } else if (currentBuilding === 'mart') {
      ctx.fillStyle = '#ff9800';
      ctx.fillRect(80, 60, 60, 40);
      ctx.fillStyle = '#000';
      ctx.fillText('Продавец', 85, 85);
      ctx.fillText('Нажми E рядом, чтобы купить', 20, 140);
    }
    ctx.fillStyle = '#fff';
    ctx.fillText('Выход → подойди к нижнему краю', 20, canvas.height - 20);
  }

  ctx.fillStyle = '#2196F3';
  ctx.fillRect(player.x, player.y, player.size, player.size);
  ctx.fillStyle = '#fff';
  ctx.fillRect(player.x + 6, player.y + 6, 4, 4);
  ctx.fillRect(player.x + 14, player.y + 6, 4, 4);
}

function drawBuilding(x, y, w, h, color, label, type) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#000';
  ctx.font = '12px Arial';
  ctx.fillText(label, x + 10, y + 25);
}

// === Проверка входа в здания (только по нажатию E) ===
function checkBuildingInteraction() {
  const now = Date.now();
  if (now - lastInteractionTime < 800) return; // анти-спам

  if (!isIndoors) {
    // Вход в Центр
    if ((currentLocation === 'pallet' || currentLocation === 'viridian') &&
        player.x > 60 && player.x < 200 && player.y > 30 && player.y < 160) {
      if (keys.e) {
        isIndoors = true;
        currentBuilding = 'center';
        player.x = 120;
        player.y = 100;
        lastInteractionTime = now;
      }
    }
    // Вход в Покемаркет
    if ((currentLocation === 'pallet' || currentLocation === 'viridian') &&
        player.x > canvas.width - 210 && player.x < canvas.width - 60 && player.y > 40 && player.y < 160) {
      if (keys.e) {
        isIndoors = true;
        currentBuilding = 'mart';
        player.x = 120;
        player.y = 100;
        lastInteractionTime = now;
      }
    }
  } else {
    // Выход из здания
    if (player.y > canvas.height - 40) {
      isIndoors = false;
      currentBuilding = null;
      player.y = 180;
    }
  }
}

// === Взаимодействие с NPC (только по нажатию E) ===
function checkNPCInteraction() {
  const now = Date.now();
  if (now - lastInteractionTime < 800) return;

  if (!isIndoors || !keys.e) return;

  if (currentBuilding === 'center') {
    if (player.x > 70 && player.x < 160 && player.y > 50 && player.y < 120) {
      healAllPokemon();
      alert('Все покемоны полностью восстановлены!');
      lastInteractionTime = now;
    }
  }

  if (currentBuilding === 'mart') {
    if (player.x > 70 && player.x < 160 && player.y > 50 && player.y < 120) {
      const choice = prompt('Покемаркет\n1 - Зелье (200)\n2 - Покебол (150)\n3 - Уйти');
      if (choice === '1' && gameState.money >= 200) {
        gameState.money -= 200;
        gameState.items.potion = (gameState.items.potion || 0) + 1;
        alert('Куплено зелье!');
      } else if (choice === '2' && gameState.money >= 150) {
        gameState.money -= 150;
        gameState.items.pokeball = (gameState.items.pokeball || 0) + 1;
        alert('Куплен покебол!');
      }
      updateHpBars();
      lastInteractionTime = now;
    }
  }
}

function healAllPokemon() {
  if (!myParty) return;
  myParty.forEach(p => {
    p.currentHp = p.maxHp;
    if (p.status) p.status = null;
  });
  updateHpBars();
}

// === Главный цикл ===
function gameLoop() {
  if (keys.w && player.y > 0) player.y -= player.speed;
  if (keys.s && player.y < canvas.height - player.size) player.y += player.speed;
  if (keys.a && player.x > 0) player.x -= player.speed;
  if (keys.d && player.x < canvas.width - player.size) player.x += player.speed;

  // Переходы между локациями
  const edge = 15;
  if (!isIndoors) {
    if (currentLocation === 'pallet' && player.x < edge) { currentLocation = 'route1'; player.x = canvas.width - 30; }
    if (currentLocation === 'route1' && player.x > canvas.width - edge) { currentLocation = 'pallet'; player.x = 30; }
    if (currentLocation === 'route1' && player.x < edge) { currentLocation = 'viridian'; player.x = canvas.width - 30; }
    if (currentLocation === 'viridian' && player.x > canvas.width - edge) { currentLocation = 'route1'; player.x = 30; }
  }

  checkBuildingInteraction();
  checkNPCInteraction();

  draw();
  requestAnimationFrame(gameLoop);
}

// === Управление ===
document.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (['w','arrowup'].includes(k)) keys.w = true;
  if (['s','arrowdown'].includes(k)) keys.s = true;
  if (['a','arrowleft'].includes(k)) keys.a = true;
  if (['d','arrowright'].includes(k)) keys.d = true;
  if (k === 'e') keys.e = true;
});
document.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  if (['w','arrowup'].includes(k)) keys.w = false;
  if (['s','arrowdown'].includes(k)) keys.s = false;
  if (['a','arrowleft'].includes(k)) keys.a = false;
  if (['d','arrowright'].includes(k)) keys.d = false;
  if (k === 'e') keys.e = false;
});

window.addEventListener('resize', () => {
  resizeCanvas();
  draw();
});

document.addEventListener('DOMContentLoaded', function() {
  resizeCanvas();
  draw();
});

resizeCanvas();
gameLoop();
console.log('Карта исправлена (взаимодействие только по E)');
