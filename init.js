// =======================================================================
// ИНИЦИАЛИЗАЦИЯ
// =======================================================================

document.addEventListener('DOMContentLoaded', function() {
  const loadingEl = document.getElementById('loading');

  // 1) Сначала покедекс
  let pokedexOk = false;
  try {
    pokedexOk = (loadAllPokemon() === true) && allPokemonData && Object.keys(allPokemonData).length > 0;
  } catch (e) {
    console.error('Ошибка loadAllPokemon:', e);
    pokedexOk = false;
  }

  if (!pokedexOk) {
    if (loadingEl) {
      loadingEl.style.display = 'block';
      loadingEl.textContent = '❌ Не удалось загрузить покедекс.\nСохранение НЕ трогаем.';
    }
    return;
  }

  // 2) Автоочистка старых сломанных сохранений (как было)
  ['pokemonRPG_save', 'pokemonRPG_save_v1', 'pokemonRPG_save_v2'].forEach(function(key) {
    try {
      var _t = localStorage.getItem(key);
      if (_t) JSON.parse(_t);
    } catch(e) {
      localStorage.removeItem(key);
      console.warn('Сломанное сохранение удалено:', key);
    }
  });

  // 3) Пробуем загрузить
  let loaded = false;
  try {
    loaded = loadGame();
  } catch (e) {
    console.error('Ошибка загрузки сохранения:', e);
    loaded = false;
  }

  // 4) Если не загрузилось — создаём стартера (но сейв НЕ удаляем)
  if (!loaded || !myParty || myParty.length === 0) {
    try {
      const starter = new Poke(25, 5);
      myParty = [starter];
      currentPokemonIndex = 0;
      gameState.money = 300;
      gameState.items = { potion: 5, pokeball: 3 };

      // сохраняем стартера только если сохранение реально записывается
      saveGame();
    } catch (e) {
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
      alert('Не удалось создать дикого покемона (покедекс пуст?)');
      return;
    }
    showBattleScreen();
    if (btnFight) btnFight.textContent = 'Бой';
    startBattle(wild);
  }

  function onFightClick() {
    // Проверяем, есть ли хоть один живой покемон
    var hasAlive = false;
    for (var i = 0; i < myParty.length; i++) {
      if (myParty[i].currentHp > 0) { hasAlive = true; break; }
    }
    if (!hasAlive) {
      alert('Все ваши покемоны без сознания! Используйте зелье.');
      return;
    }

    // Проверяем текущего покемона
    var curP = getCurrentPokemon();
    if (!curP || curP.currentHp <= 0) {
      for (var i = 0; i < myParty.length; i++) {
        if (myParty[i].currentHp > 0) {
          currentPokemonIndex = i;
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
        alert('❌ Не удалось сохранить (переполнен localStorage).');
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
