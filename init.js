// =======================================================================
// ИНИЦИАЛИЗАЦИЯ
// =======================================================================

document.addEventListener('DOMContentLoaded', function() {
  const loadingEl = document.getElementById('loading');

  // Чистим старый огромный кэш (если остался)
  try { localStorage.removeItem('pokemonData151'); } catch (e) {}

  // 1) Загружаем покедекс
  let pokedexOk = false;
  try { pokedexOk = (loadAllPokemon() === true); } catch (e) { pokedexOk = false; }

  if (!pokedexOk || !allPokemonData || Object.keys(allPokemonData).length === 0) {
    if (loadingEl) {
      loadingEl.style.display = 'block';
      loadingEl.textContent = '❌ Не удалось загрузить покедекс. Сохранение НЕ трогаем.';
    }
    return;
  }

  // 2) Автоочистка старых сломанных сохранений (v1/v2)
  ['pokemonRPG_save', 'pokemonRPG_save_v1', 'pokemonRPG_save_v2'].forEach(function(key) {
    try {
      var _t = localStorage.getItem(key);
      if (_t) JSON.parse(_t);
    } catch(e) {
      localStorage.removeItem(key);
      console.warn('Сломанное сохранение удалено:', key);
    }
  });

  const hasSave = !!localStorage.getItem('pokemonRPG_save_v3');

  // 3) Пробуем загрузить
  let loaded = false;
  try { loaded = loadGame(); } catch(e) { console.error('Ошибка загрузки:', e); loaded = false; }

  // 4) ВАЖНО: стартер создаём ТОЛЬКО если сейва нет вообще.
  // Если сейв есть, но загрузка не удалась — не перезаписываем прогресс.
  if (!loaded || !myParty || myParty.length === 0) {
    if (hasSave) {
      if (loadingEl) {
        loadingEl.style.display = 'block';
        loadingEl.textContent =
          '❌ Сейв найден, но загрузить его не удалось.\n' +
          'Чтобы не потерять прогресс, игра НЕ будет перезаписывать сохранение стартером.\n' +
          'Решение: очистить данные сайта/LocalStorage или исправить формат сейва.';
      }
      return;
    }

    try {
      const starter = new Poke(25, 5);
      myParty = [starter];
      currentPokemonIndex = 0;
      gameState.money = 300;
      gameState.items = { potion: 5, pokeball: 3 };
      saveGame();
    } catch(e) {
      console.error('Не удалось создать стартера:', e);
      myParty = [];
    }
  }

  // 5) UI/обработчики
  const btnFight = document.getElementById('btn-fight');
  const btnAction = document.getElementById('btn-action');
  const btnBag = document.getElementById('btn-bag');
  const btnSwitch = document.getElementById('btn-switch');
  const btnRun = document.getElementById('btn-run');

  function showMapScreen() {
    document.body.classList.remove('mode-battle');
    document.body.classList.add('mode-map');
  }

  function showBattleScreen() {
    document.body.classList.remove('mode-map');
    document.body.classList.add('mode-battle');
  }

  window.showMapScreen = showMapScreen;
  window.showBattleScreen = showBattleScreen;

  if (loadingEl) loadingEl.style.display = 'none';

  showMapScreen();
  updateHpBars();
  updateInfoPanel();

  function startWildBattle() {
    if (inBattle) {
      onFight();
      return;
    }
    const wild = generateWildPokemon();
    if (!wild) {
      addMessage('Не удалось создать дикого покемона');
      return;
    }
    showBattleScreen();
    if (btnFight) btnFight.textContent = 'Бой';
    startBattle(wild);
  }

  function onFightClick() {
    // Есть ли хоть один живой покемон
    var hasAlive = false;
    for (var i = 0; i < myParty.length; i++) {
      if (myParty[i].currentHp > 0) { hasAlive = true; break; }
    }
    if (!hasAlive) {
      addMessage('Все ваши покемоны без сознания! Используйте зелье или посетите центр покемонов.');
      return;
    }

    // Проверяем текущего покемона
    var curP = getCurrentPokemon();
    if (!curP || curP.currentHp <= 0) {
      for (var i = 0; i < myParty.length; i++) {
        if (myParty[i].currentHp > 0) {
          currentPokemonIndex = i;
          addMessage(myParty[i].name + ' выходит на бой!');
          updateHpBars();
          break;
        }
      }
    }

    startWildBattle();
  }

  if (btnFight) {
    btnFight.disabled = false;
    btnFight.onclick = onFightClick;
  }
  if (btnAction) btnAction.onclick = onFightClick;

  if (btnBag) {
    btnBag.onclick = openInventory;
    btnBag.disabled = true;
  }

  if (btnSwitch) {
    btnSwitch.disabled = true;
    btnSwitch.onclick = function() { switchPokemon(); };
  }

  if (btnRun) btnRun.disabled = true;

  var btnSave = document.getElementById('btn-save');
  if (btnSave) {
    btnSave.addEventListener('click', function() {
      const ok = saveGame();
      if (!ok) {
        addMessage('❌ Не удалось сохранить (переполнен localStorage).');
        alert('❌ Не удалось сохранить игру (переполнен localStorage).\n\nМы отключили кэш покедекса, но старые данные могли остаться.\nОчистите данные сайта/LocalStorage и попробуйте снова.');
        return;
      }
      addMessage('Сохранено!');
    });
  }

  var btnTraining = document.getElementById('btn-training');
  if (btnTraining) btnTraining.addEventListener('click', function() { openTraining(); });

  var trainCloseBtn = document.getElementById('train-close-btn');
  if (trainCloseBtn) trainCloseBtn.addEventListener('click', function() { closeTraining(); });

  var trainConfirmBtn = document.getElementById('train-confirm-btn');
  if (trainConfirmBtn) trainConfirmBtn.addEventListener('click', function() { confirmTraining(); });

  startAutoSave();
});
