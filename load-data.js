// =======================================================================
// ЗАГРУЗКА ДАННЫХ ИЗ ВСТРОЕННОГО ФАЙЛА pokedex.js
// =======================================================================

function loadAllPokemon() {
 document.getElementById('loading').textContent = '⏳ Шаг 1: функция loadAllPokemon вызвана...';
 console.log('loadAllPokemon вызвана');

 document.getElementById('loading').textContent = '⏳ Шаг 2: проверка ALL_POKEMON_DATA...';
 if (typeof ALL_POKEMON_DATA === 'undefined') {
 document.getElementById('loading').textContent = '❌ Ошибка: файл pokedex.js не загружен!';
 console.error('ALL_POKEMON_DATA не определён');
 return;
 }

 document.getElementById('loading').textContent = '⏳ Шаг 3: копирование данных...';
 allPokemonData = ALL_POKEMON_DATA;
 const count = Object.keys(allPokemonData).length;
 document.getElementById('loading').textContent = `✅ Шаг 4: загружено ${count} покемонов!`;
 console.log(`Загружено ${count} покемонов`);

 try {
 localStorage.setItem('pokemonData151', JSON.stringify(allPokemonData));
 document.getElementById('loading').textContent = `✅ Шаг 5: данные сохранены в кэш (${count} покемонов)`;
 } catch(e) {
 console.warn('Не удалось сохранить в localStorage:', e);
 document.getElementById('loading').textContent = '⚠️ Шаг 5: кэш не сохранён, но данные загружены';
 }
 document.getElementById('loading').textContent = `✅ Готово! (${count} покемонов)`;
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
