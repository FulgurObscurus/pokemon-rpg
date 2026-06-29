// =======================================================================
// КАРТА МИРА С НЕСКОЛЬКИМИ ЛОКАЦИЯМИ И ЗДАНИЯМИ
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
const keys = { w: false, a: false, s: false, d: false };

let currentLocation = 'pallet';   // pallet | route1 | viridian
let isIndoors = false;
let currentBuilding = null;       // 'center' | 'mart'

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(300, Math.floor(rect.width || (window.innerWidth - 20)));
  canvas.height = Math.max(240, Math.floor(window.innerHeight * 0.65));

  if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
  if (player.y > canvas.height - player.size) player.y = canvas.height - player.size;
  if (player.x < 0) player.x = 0;
  if (player.y < 0) player.y = 0;
}

// === ОТРИСОВКА ===
function draw() {
  ctx.fillStyle = isIndoors ? '#d2b48c' : '#4caf50';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!isIndoors) {
    // === НАРУЖНЫЙ МИР ===
    if (currentLocation === 'pallet') {
      // Паллет-Таун
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
    // === ВНУТРИ ЗДАНИЯ ===
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (currentBuilding === 'center') {
      ctx.fillStyle = '#ff69b4';
      ctx.fillRect(80, 60, 60, 40); // Nurse
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.fillText('Nurse Joy', 85, 85);
      ctx.fillText('Нажми рядом, чтобы лечить', 20, 140);

    } else if (currentBuilding === 'mart') {
      ctx.fillStyle = '#ff9800';
      ctx.fillRect(80, 60, 60, 40); // Clerk
      ctx.fillStyle = '#000';
      ctx.fillText('Продавец', 85, 85);
      ctx.fillText('Нажми рядом, чтобы купить', 20, 140);
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

function drawBuilding(x, y, w, h, color, label, type) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#000';
  ctx.font = '12px Arial';
  ctx.fillText(label, x + 10, y + 25);
}

// === ВХОД / ВЫХОД ИЗ ЗДАНИЙ ===
function checkBuildingEntry() {
  if (isIndoors) {
    // Выход из здания
    if (player.y > canvas.height - 40) {
      isIndoors = false;
      currentBuilding = null;
      player.y = 180;
    }
    return;
  }

  // Вход в Центр покемонов
  if ((currentLocation === 'pallet' || currentLocation === 'viridian') &&
      player.x > 60 && player.x < 200 && player.y > 30 && player.y < 160) {
    if (confirm('Войти в Центр покемонов?')) {
      isIndoors = true;
      currentBuilding = 'center';
      player.x = 120;
      player.y = 100;
    }
  }

  // Вход в Покемаркет
  if ((currentLocation === 'pallet' || currentLocation === 'viridian') &&
      player.x > canvas.width - 210 && player.x < canvas.width - 60 && player.y > 40 && player.y < 160) {
    if (confirm('Войти в Покемаркет?')) {
      isIndoors = true;
      currentBuilding = 'mart';
      player.x = 120;
      player.y = 100;
    }
  }
}

// === ВЗАИМОДЕЙСТВИЕ С NPC ===
function checkNPCInteraction() {
  if (!isIndoors) return;

  if (currentBuilding === 'center') {
    // Nurse Joy
    if (player.x > 70 && player.x < 160 && player.y > 50 && player.y < 120) {
      if (confirm('Вылечить всех покемонов?')) {
        healAllPokemon();
        alert('Все покемоны полностью восстановлены!');
      }
    }
  }

  if (currentBuilding === 'mart') {
    // Продавец
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

// === ГЛАВНЫЙ ЦИКЛ ===
function gameLoop() {
  if (!isIndoors) {
    if (keys.w && player.y > 0) player.y -= player.speed;
    if (keys.s && player.y < canvas.height - player.size) player.y += player.speed;
    if (keys.a && player.x > 0) player.x -= player.speed;
    if (keys.d && player.x < canvas.width - player.size) player.x += player.speed;

    // Переходы между локациями
    const edge = 15;
    if (currentLocation === 'pallet' && player.x < edge) { currentLocation = 'route1'; player.x = canvas.width - 30; }
    if (currentLocation === 'route1' && player.x > canvas.width - edge) { currentLocation = 'pallet'; player.x = 30; }
    if (currentLocation === 'route1' && player.x < edge) { currentLocation = 'viridian'; player.x = canvas.width - 30; }
    if (currentLocation === 'viridian' && player.x > canvas.width - edge) { currentLocation = 'route1'; player.x = 30; }
  } else {
    if (keys.w && player.y > 0) player.y -= player.speed;
    if (keys.s && player.y < canvas.height - player.size) player.y += player.speed;
    if (keys.a && player.x > 0) player.x -= player.speed;
    if (keys.d && player.x < canvas.width - player.size) player.x += player.speed;
  }

  checkBuildingEntry();
  checkNPCInteraction();

  draw();
  requestAnimationFrame(gameLoop);
}

// === Управление (клавиатура + тач) ===
document.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (['w','arrowup'].includes(k)) keys.w = true;
  if (['s','arrowdown'].includes(k)) keys.s = true;
  if (['a','arrowleft'].includes(k)) keys.a = true;
  if (['d','arrowright'].includes(k)) keys.d = true;
});
document.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  if (['w','arrowup'].includes(k)) keys.w = false;
  if (['s','arrowdown'].includes(k)) keys.s = false;
  if (['a','arrowleft'].includes(k)) keys.a = false;
  if (['d','arrowright'].includes(k)) keys.d = false;
});

window.addEventListener('resize', () => {
  resizeCanvas();
  draw();
});

document.addEventListener('DOMContentLoaded', function() {
  const btnUp = document.getElementById('btn-up');
  const btnDown = document.getElementById('btn-down');
  const btnLeft = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');

  function bindBtn(btn, key) {
    if (!btn) return;
    btn.addEventListener('touchstart', e => { e.preventDefault(); keys[key] = true; });
    btn.addEventListener('touchend', e => { e.preventDefault(); keys[key] = false; });
    btn.addEventListener('mousedown', () => keys[key] = true);
    btn.addEventListener('mouseup', () => keys[key] = false);
  }

  bindBtn(btnUp, 'w');
  bindBtn(btnDown, 's');
  bindBtn(btnLeft, 'a');
  bindBtn(btnRight, 'd');

  resizeCanvas();
  draw();
});

resizeCanvas();
gameLoop();
console.log('Карта с зданиями загружена');
