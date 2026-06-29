// =======================================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И СОСТОЯНИЕ ИГРЫ
// =======================================================================

let allPokemonData = {};
let myParty = [];
let currentPokemonIndex = 0;

let enemyPokemon = null;
let inBattle = false;
let gameLog = [];

let moveSelectionMode = false;

const SAVE_VERSION = 3;
const SAVE_KEY = 'pokemonRPG_save_v3';

let gameState = {
  money: 300,
  items: { potion: 5, pokeball: 3 },
};

function toInt(v, def) {
  const n = (typeof v === 'number') ? v : parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
}

function clampInt(v, min, max, def) {
  let n = toInt(v, def);
  if (!Number.isFinite(n)) n = def;
  if (n < min) n = min;
  if (n > max) n = max;
  return n;
}

function safeJSONParse(txt) {
  try { return JSON.parse(txt); } catch (_) { return null; }
}

function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    // частая причина: localStorage забит pokemonData151 из старых версий
    console.warn('localStorage.setItem failed, trying to free space:', e);
    try { localStorage.removeItem('pokemonData151'); } catch (_) {}

    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e2) {
      console.error('localStorage.setItem failed again:', e2);
      return false;
    }
  }
}

function saveGame() {
  try {
    const items = (gameState && gameState.items) ? gameState.items : {};

    const state = {
      version: SAVE_VERSION,
      money: toInt(gameState.money, 300),
      items: {
        potion: Math.max(0, toInt(items.potion, 0)),
        pokeball: Math.max(0, toInt(items.pokeball, 0)),
      },
      log: Array.isArray(gameLog) ? gameLog.slice(-50) : [],
      party: (myParty || []).map(p => ({
        speciesId: p.speciesId,
        level: toInt(p.level, 5),
        exp: toInt(p.exp, 0),
        currentHp: toInt(p.currentHp, 0),
        status: p.status || null,

        // стабильные поля
        ability: p.ability || null,
        shiny: !!p.shiny,
        gender: p.gender || null,
        heldItem: (typeof p.heldItem !== 'undefined') ? p.heldItem : null,
        friendship: toInt(p.friendship, 70),

        moves: (p.moves || []).map(m => ({
          id: (m && m.id) ? m.id : null,
          name: (m && m.name) ? m.name : null,
          pp: (m && typeof m.pp === 'number') ? m.pp : toInt(m && m.pp, null),
        })),

        statPoints: p.statPoints || {hp:0,attack:0,defense:0,spAttack:0,spDefense:0,speed:0},
      })),
      currentPokemonIndex: toInt(currentPokemonIndex, 0),
      ts: Date.now(),
    };

    const ok = safeLocalStorageSet(SAVE_KEY, JSON.stringify(state));
    if (ok) console.log('Игра сохранена');
    return ok;
  } catch (e) {
    console.error('Ошибка сохранения:', e);
    return false;
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;

    const state = safeJSONParse(raw);
    if (!state || !state.version) {
      // сейв битый JSON — НЕ удаляем автоматически (чтобы не терять прогресс)
      console.error('Сейв не распарсился (битый JSON).');
      return false;
    }

    // версию не считаем фатальной — просто предупреждаем
    if (state.version < SAVE_VERSION) {
      console.warn('Старое сохранение: версия ' + state.version + ', текущая ' + SAVE_VERSION);
    }

    // покедекс должен быть готов
    if (!allPokemonData || Object.keys(allPokemonData).length === 0) {
      console.error('Покедекс не загружен — загрузка сейва отложена.');
      return false;
    }

    if (!state.party || !Array.isArray(state.party) || state.party.length === 0) {
      console.error('В сейве нет партии.');
      return false;
    }

    gameState.money = toInt(state.money, 300);
    if (state.items && typeof state.items === 'object') {
      gameState.items = {
        potion: Math.max(0, toInt(state.items.potion, 0)),
        pokeball: Math.max(0, toInt(state.items.pokeball, 0)),
      };
    } else {
      gameState.items = { potion: 5, pokeball: 3 };
    }

    gameLog = (state.log && Array.isArray(state.log)) ? state.log.slice(-50) : [];

    const newParty = [];

    for (let i = 0; i < state.party.length; i++) {
      try {
        const p = state.party[i];
        if (!p || !p.speciesId) continue;
        if (!allPokemonData[p.speciesId]) continue;

        const lvl = clampInt(p.level, 1, 100, 5);
        const pokemon = new Poke(p.speciesId, lvl);

        pokemon.exp = Math.max(0, toInt(p.exp, 0));

        // statPoints -> числа
        if (p.statPoints && typeof p.statPoints === 'object') {
          pokemon.statPoints = { hp:0, attack:0, defense:0, spAttack:0, spDefense:0, speed:0 };
          for (const k in pokemon.statPoints) {
            if (Object.prototype.hasOwnProperty.call(p.statPoints, k)) {
              pokemon.statPoints[k] = Math.max(0, toInt(p.statPoints[k], 0));
            }
          }
        }

        // стабильные поля
        if (typeof p.ability === 'string' && p.ability) pokemon.ability = p.ability;
        if (typeof p.gender === 'string' && p.gender) pokemon.gender = p.gender;
        pokemon.shiny = !!p.shiny;
        pokemon.heldItem = (typeof p.heldItem !== 'undefined') ? p.heldItem : null;
        pokemon.friendship = Math.max(0, toInt(p.friendship, 70));

        // HP/статус (0 HP допустим — покемон может быть без сознания)
        const maxHp = pokemon.maxHp;
        const chp = toInt(p.currentHp, maxHp);
        pokemon.currentHp = Math.max(0, Math.min(chp, maxHp));
        pokemon.status = p.status || null;

        // moves + PP
        if (p.moves && Array.isArray(p.moves) && p.moves.length > 0) {
          const loadedMoves = [];
          for (let j = 0; j < p.moves.length; j++) {
            const sm = p.moves[j];
            if (!sm) continue;

            try {
              let mv = null;
              if (sm.id) mv = buildMoveFromEntry({ move: sm.id, learnLevel: 1 });
              else if (sm.name) mv = buildMoveFromEntry({ name: sm.name, learnLevel: 1 });

              if (mv && mv.id) {
                const cap = (typeof mv.max_pp === 'number' && mv.max_pp > 0) ? mv.max_pp : mv.pp;
                const savedPP = (typeof sm.pp === 'number' || typeof sm.pp === 'string') ? toInt(sm.pp, mv.pp) : mv.pp;
                mv.pp = clampInt(savedPP, 0, cap, mv.pp);
                loadedMoves.push(mv);
              }
            } catch (_) {}
          }
          if (loadedMoves.length > 0) pokemon.moves = loadedMoves;
        }

        newParty.push(pokemon);
      } catch (_) {}
    }

    if (newParty.length === 0) {
      console.error('Не удалось восстановить ни одного покемона из сейва.');
      return false;
    }

    myParty = newParty;

    const idx = clampInt(state.currentPokemonIndex, 0, myParty.length - 1, 0);
    currentPokemonIndex = idx;

    return true;
  } catch (e) {
    console.error('Ошибка загрузки сохранения:', e);
    return false;
  }
}

let saveInterval = null;

function startAutoSave() {
  if (saveInterval) clearInterval(saveInterval);
  saveInterval = setInterval(saveGame, 10000);
}

function stopAutoSave() {
  if (saveInterval) {
    clearInterval(saveInterval);
    saveInterval = null;
  }
}

function updateInfoPanel() {
  const moneyEl = document.getElementById('money');
  const locationEl = document.getElementById('location');
  const partyCountEl = document.getElementById('party-count');

  if (moneyEl) moneyEl.textContent = gameState.money;
  if (locationEl) locationEl.textContent = 'Маршрут 1';
  if (partyCountEl) partyCountEl.textContent = myParty.length;
}
