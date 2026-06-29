document.addEventListener('DOMContentLoaded', function() {
  const loadingEl = document.getElementById('loading');

  try { localStorage.removeItem('pokemonData151'); } catch (e) {}

  let pokedexOk = false;
  try { pokedexOk = (loadAllPokemon() === true); } catch (e) { pokedexOk = false; }

  if (!pokedexOk || !allPokemonData || Object.keys(allPokemonData).length === 0) {
    if (loadingEl) {
      loadingEl.style.display = 'block';
      loadingEl.textContent = '❌ Не удалось загрузить покедекс.';
    }
    return;
  }

  ['pokemonRPG_save', 'pokemonRPG_save_v1', 'pokemonRPG_save_v2'].forEach(function(key) {
    try { var _t = localStorage.getItem(key); if (_t) JSON.parse(_t); } catch(e) { localStorage.removeItem(key); }
  });

  const hasSave = !!localStorage.getItem('pokemonRPG_save_v3');

  let loaded = false;
  try { loaded = loadGame(); } catch(e) { loaded = false; }

  if (!loaded || !myParty || myParty.length === 0) {
    if (hasSave) {
      if (loadingEl) {
        loadingEl.style.display = 'block';
        loadingEl.textContent = '❌ Сейв найден, но загрузить не удалось.';
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
    } catch(e) { myParty = []; }
  }

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
    if (inBattle) { onFight(); return; }
    const wild = generateWildPokemon();
    if (!wild) { addMessage('Не удалось создать дикого покемона'); return; }
    showBattleScreen();
    if (btnFight) btnFight.textContent = 'Бой';
    startBattle(wild);
  }

  function onFightClick() {
    var hasAlive = false;
    for (var i = 0; i < myParty.length; i++) {
      if (myParty[i].currentHp > 0) { hasAlive = true; break; }
    }
    if (!hasAlive) {
      addMessage('Все ваши покемоны без сознания! Используйте зелье или посетите центр покемонов.');
      return;
    }
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
  if (btnAction) {
    btnAction.onclick = onFightClick;
  }

  if (btnBag) { btnBag.onclick = openInventory; btnBag.disabled = true; }
  if (btnSwitch) { btnSwitch.disabled = true; btnSwitch.onclick = function() { switchPokemon(); }; }
  if (btnRun) btnRun.disabled = true;

  var btnSave = document.getElementById('btn-save');
  if (btnSave) {
    btnSave.addEventListener('click', function() {
      const ok = saveGame();
      if (!ok) {
        addMessage('❌ Не удалось сохранить.');
        alert('❌ Не удалось сохранить игру.');
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

  // === ПОДДЕРЖКА СТРЕЛОК (внутри DOMContentLoaded) ===
  document.addEventListener('keydown', function(e) {
    const k = e.key;
    if (k === 'ArrowUp')    { if (typeof keys !== 'undefined') keys.w = true; e.preventDefault(); }
    if (k === 'ArrowDown')  { if (typeof keys !== 'undefined') keys.s = true; e.preventDefault(); }
    if (k === 'ArrowLeft')  { if (typeof keys !== 'undefined') keys.a = true; e.preventDefault(); }
    if (k === 'ArrowRight') { if (typeof keys !== 'undefined') keys.d = true; e.preventDefault(); }
  });

  document.addEventListener('keyup', function(e) {
    const k = e.key;
    if (k === 'ArrowUp')    { if (typeof keys !== 'undefined') keys.w = false; }
    if (k === 'ArrowDown')  { if (typeof keys !== 'undefined') keys.s = false; }
    if (k === 'ArrowLeft')  { if (typeof keys !== 'undefined') keys.a = false; }
    if (k === 'ArrowRight') { if (typeof keys !== 'undefined') keys.d = false; }
  });

  startAutoSave();
});
