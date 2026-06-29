// =======================================================================
// КАРТА МИРА С КРАСИВЫМИ ЗДАНИЯМИ И ПОДДЕРЖКОЙ СТРЕЛОК
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

// === Красивое здание ===
function drawNiceBuilding(x, y, w, h, roofColor, wallColor, label) {
  // Стены
  ctx.fillStyle = wallColor;
  ctx.fillRect(x, y, w, h);

  // Крыша
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(x - 8, y);
  ctx.lineTo(x + w / 2, y - 25);
  ctx.lineTo(x + w + 8, y);
  ctx.fill();

  // Дверь
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(x + w / 2 - 12, y + h - 35, 24, 35);

  // Окна
  ctx.fillStyle = '#bbdefb';
  ctx.fillRect(x + 15, y + 20, 22, 22);
  ctx.fillRect(x + w - 37, y + 20, 22, 22);
  ctx.fillRect(x + 15, y + h - 60, 22, 22);
  ctx.fillRect(x + w - 37, y + h - 60, 22, 22);

  // Надпись
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px Arial';
  ctx.fillText(label, x + 10, y + 15);
}

// === Отрисовка ===
function draw() {
  ctx.fillStyle = isIndoors ? '#d2b48c' : '#4caf50';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!isIndoors) {
    if (currentLocation === 'pallet') {
      drawNiceBuilding(50, 35, 160, 120, '#5d4037', '#8d6e63', 'Центр покемонов');
      drawNiceBuilding(canvas.width - 210, 45, 150, 110, '#e65100', '#ff9800', 'Покемаркет');
      ctx.fillStyle = '#fff';
      ctx.font = '18px Arial';
      ctx.fillText('Pallet Town', 20, 25);

    } else if (currentLocation === 'route1') {
      ctx.fillStyle = '#2e7d32';
      for (let i = 0; i < 30; i++) {
        ctx.fillRect(10 + i * 30, 20 + (i % 5) * 38, 18, 18);
      }
      ctx.fillStyle = '#fff';
      ctx.fillText('Route 1', 20, 25);

    } else if (currentLocation === 'viridian') {
      drawNiceBuilding(40, 25, 150, 115, '#5d4037', '#8d6e63', 'Центр покемонов');
      drawNiceBuilding(canvas.width - 190, 35, 140, 105, '#e65100', '#ff9800', 'Покемаркет');
      ctx.fillStyle = '#fff';
      ctx.fillText('Viridian City', 20, 25);
    }
  } else {
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (currentBuilding === 'center') {
      ctx.fillStyle = '#ff69b4';
      ctx.fillRect(90, 70, 50, 35);
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.fillText('Nurse Joy', 95, 92);
      ctx.fillText('Нажми E рядом, чтобы лечить', 20, 160);
    } else if (currentBuilding === 'mart') {
      ctx.fillStyle = '#ff9800';
      ctx.fillRect(90, 70, 50, 35);
      ctx.fillStyle = '#000';
      ctx.fillText('Продавец', 95, 92);
      ctx.fillText('Нажми E рядом, чтобы купить', 20, 160);
    }

    ctx.fillStyle = '#fff';
    ctx.fillText('Выход → подойди к нижнему краю', 20, canvas.height - 20);
  }

  // Игрок
  ctx.fillStyle = '#2196F3';
  ctx.fillRect(player.x, player.y, player.size, player.size);
  ctx.fillStyle = '#fff';
  ctx.fillRect(player.x + 6, player.y + 6, 4, 4);
  ctx.fillRect(player.x + 14, player.y + 6, 4, 4);
}

// === Взаимодействие ===
function checkBuildingInteraction() {
  const now = Date.now();
  if (now - lastInteractionTime < 700) return;

  if (!isIndoors) {
    if ((currentLocation === 'pallet' || currentLocation === 'viridian') &&
        player.x > 50 && player.x < 220 && player.y > 25 && player.y < 170) {
      if (keys.e) {
        isIndoors = true;
        currentBuilding = 'center';
        player.x = 130;
        player.y = 110;
        lastInteractionTime = now;
      }
    }

    if ((currentLocation === 'pallet' || currentLocation === 'viridian') &&
        player.x > canvas.width - 220 && player.x < canvas.width - 50 && player.y > 35 && player.y < 170) {
      if (keys.e) {
        isIndoors = true;
        currentBuilding = 'mart';
        player.x = 130;
        player.y = 110;
        lastInteractionTime = now;
      }
    }
  } else {
    if (player.y > canvas.height - 40) {
      isIndoors = false;
      currentBuilding = null;
      player.y = 180;
    }
  }
}

function checkNPCInteraction() {
  const now = Date.now();
  if (now - lastInteractionTime < 700) return;
  if (!isIndoors || !keys.e) return;

  if (currentBuilding === 'center') {
    if (player.x > 80 && player.x < 170 && player.y > 55 && player.y < 130) {
      healAllPokemon();
      alert('Все покемоны полностью восстановлены!');
      lastInteractionTime = now;
    }
  }

  if (currentBuilding === 'mart') {
    if (player.x > 80 && player.x < 170 && player.y > 55 && player.y < 130) {
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
  myParty.forEach(p => { p.currentHp = p.maxHp; if (p.status) p.status = null; });
  updateHpBars();
}

// === Главный цикл ===
function gameLoop() {
  if (keys.w && player.y > 0) player.y -= player.speed;
  if (keys.s && player.y < canvas.height - player.size) player.y += player.speed;
  if (keys.a && player.x > 0) player.x -= player.speed;
  if (keys.d && player.x < canvas.width - player.size) player.x += player.speed;

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

// === Управление (WASD + стрелки) ===
document.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (['w', 'arrowup'].includes(k)) keys.w = true;
  if (['s', 'arrowdown'].includes(k)) keys.s = true;
  if (['a', 'arrowleft'].includes(k)) keys.a = true;
  if (['d', 'arrowright'].includes(k)) keys.d = true;
  if (k === 'e') keys.e = true;
});

document.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  if (['w', 'arrowup'].includes(k)) keys.w = false;
  if (['s', 'arrowdown'].includes(k)) keys.s = false;
  if (['a', 'arrowleft'].includes(k)) keys.a = false;
  if (['d', 'arrowright'].includes(k)) keys.d = false;
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
console.log('Карта обновлена: красивые здания + стрелки работают');
