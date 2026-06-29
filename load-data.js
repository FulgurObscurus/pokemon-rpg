// =======================================================================
// ЗАГРУЗКА ДАННЫХ ИЗ ВСТРОЕННОГО ФАЙЛА pokedex.js
// =======================================================================

function loadAllPokemon() {
  const loadingEl = document.getElementById('loading');

  if (loadingEl) loadingEl.textContent = '⏳ Загрузка данных покемонов...';
  console.log('loadAllPokemon вызвана');

  // Освобождаем место: в старых версиях здесь кэшировался весь покедекс
  try { localStorage.removeItem('pokemonData151'); } catch(e) {}

  if (typeof ALL_POKEMON_DATA === 'undefined') {
    if (loadingEl) loadingEl.textContent = '❌ Ошибка: файл pokedex.js не загружен!';
    console.error('ALL_POKEMON_DATA не определён');
    return false;
  }

  allPokemonData = ALL_POKEMON_DATA;

  const count = Object.keys(allPokemonData).length;
  if (loadingEl) loadingEl.textContent = `✅ Загружено ${count} покемонов (кэш localStorage отключён)`;
  console.log(`Загружено ${count} покемонов`);

  // ВАЖНО: не кэшируем allPokemonData в localStorage:
  // JSON.stringify(покедекса) может фризить страницу и ломать сохранения из-за квоты.
  return true;
}
// Заглушки для старых функций
function fetchWithTimeout() { console.warn('fetchWithTimeout не используется'); }
function getRussianName() { console.warn('getRussianName не используется'); }

function normalizeMoveKey(name) {
 return String(name || '')
 .trim()
 .toLowerCase()
 .replace(/ё/g, 'е')
 .replace(/[—–]/g, '-')
 .replace(/\s+/g, '-');
}

function findMoveByAnyKey(name) {
 if (typeof MOVES === 'undefined' || !name) return null;

 if (MOVES[name]) return MOVES[name];

 const normalized = normalizeMoveKey(name);

 if (MOVES[normalized]) return MOVES[normalized];

 for (const key in MOVES) {
  const move = MOVES[key];
  if (!move) continue;

  if (key === name || key === normalized) return move;

  if (move.id === name || move.id === normalized) return move;

  if (move.name === name) return move;

  if (normalizeMoveKey(move.name) === normalized) return move;
 }

 return null;
}

function getMoveData(name) {
 const found = findMoveByAnyKey(name);

 if (found) {
 return { ...found };
 }

 return {
 id: name,
 name: name,
 description: "Описание пока не добавлено.",
 type: "normal",
 power: 40,
 accuracy: 100,
 category: "physical",
 max_pp: 35,
 priority: 0,
 target: "enemy",
 effect: "damage"
 };
}
