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

function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    // Частая причина: переполнен localStorage из-за огромного кэша (pokemonData151)
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

function safeJSONParse(txt) {
  try { return JSON.parse(txt); } catch (_) { return null; }
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
      party: (myParty || []).map(p => {
        const sp = p && p.statPoints ? p.statPoints : {};
        const moves = (p && Array.isArray(p.moves)) ? p.moves : [];
        return {
          speciesId: p ? p.speciesId : null,
          level: toInt(p && p.level, 5),
          exp: toInt(p && p.exp, 0),
          currentHp: toInt(p && p.currentHp, 0),
          status: p ? (p.status || null) : null,

          // стабильные поля (чтобы после F5 не “переролливались”)
          ability: p ? (p.ability || null) : null,
          shiny: !!(p && p.shiny),
          gender: p ? (p.gender || null) : null,
          heldItem: (p && typeof p.heldItem !== 'undefined') ? p.heldItem : null,
          friendship: toInt(p && p.friendship, 70),

          moves: moves.map(m => ({
            id: (m && m.id) ? m.id : null,
            name: (m && m.name) ? m.name : null,
            pp: (m && typeof m.pp === 'number') ? m.pp : toInt(m && m.pp, null),
          })),

          statPoints: {
            hp: toInt(sp.hp, 0),
            attack: toInt(sp.attack, 0),
            defense: toInt(sp.defense, 0),
            spAttack: toInt(sp.spAttack, 0),
            spDefense: toInt(sp.spDefense, 0),
            speed: toInt(sp.speed, 0),
          },
        };
      }),
      currentPokemonIndex: toInt(currentPokemonIndex, 0),
      ts: Date.now(),
    };

    return safeLocalStorageSet(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Ошибка сохранения:', e);
    return false;
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      window.__LAST_LOAD_ERROR = 'NO_SAVE';
      return false;
    }

    const state = safeJSONParse(raw);
    if (!state || !state.version) {
      localStorage.removeItem(SAVE_KEY);
      window.__LAST_LOAD_ERROR = 'BAD_JSON';
      return false;
    }

    // ВАЖНО: не трогаем сейв, если покедекс ещё не готов
    if (!allPokemonData || Object.keys(allPokemonData).length === 0) {
      window.__LAST_LOAD_ERROR = 'POKEDEX_NOT_READY';
      return false;
    }

    if (!state.party || !Array.isArray(state.party) || state.party.length === 0) {
      window.__LAST_LOAD_ERROR = 'EMPTY_PARTY';
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
      const p = state.party[i];
      if (!p || !p.speciesId) continue;
      if (!allPokemonData[p.speciesId]) continue;

      const lvl = clampInt(p.level, 1, 100, 5);
      const pokemon = new Poke(p.speciesId, lvl);

      pokemon.exp = Math.max(0, toInt(p.exp, 0));

      if (p.statPoints && typeof p.statPoints === 'object') {
        pokemon.statPoints = {
          hp: Math.max(0, toInt(p.statPoints.hp, 0)),
          attack: Math.max(0, toInt(p.statPoints.attack, 0)),
          defense: Math.max(0, toInt(p.statPoints.defense, 0)),
          spAttack: Math.max(0, toInt(p.statPoints.spAttack, 0)),
          spDefense: Math.max(0, toInt(p.statPoints.spDefense, 0)),
          speed: Math.max(0, toInt(p.statPoints.speed, 0)),
        };
      }

      // стабильные поля
      if (typeof p.ability === 'string' && p.ability) pokemon.ability = p.ability;
      if (typeof p.gender === 'string' && p.gender) pokemon.gender = p.gender;
      pokemon.shiny = !!p.shiny;
      pokemon.heldItem = (typeof p.heldItem !== 'undefined') ? p.heldItem : null;
      pokemon.friendship = Math.max(0, toInt(p.friendship, 70));

      // HP/статус
      const maxHp = pokemon.maxHp;
      const chp = toInt(p.currentHp, maxHp);
      pokemon.currentHp = Math.max(0, Math.min(chp, maxHp));
      pokemon.status = p.status || null;

      // moves + PP
      if (p.moves && Array.isArray(p.moves) && p.moves.length > 0) {
        const loadedMoves = [];
        for (let j = 0; j < p.moves.length; j++) {
          const sm = p.moves[j];
          const key = sm && (sm.id || sm.name);
          if (!key) continue;

          try {
            const mv = buildMoveFromEntry({ move: key, learnLevel: 1 });
            if (!mv || !mv.id) continue;

            const cap = (typeof mv.max_pp === 'number' && mv.max_pp > 0) ? mv.max_pp : mv.pp;
            const savedPP = (sm && (typeof sm.pp === 'number' || typeof sm.pp === 'string')) ? toInt(sm.pp, mv.pp) : mv.pp;
            mv.pp = clampInt(savedPP, 0, cap, mv.pp);

            loadedMoves.push(mv);
          } catch (_) {}
        }
        if (loadedMoves.length > 0) pokemon.moves = loadedMoves;
      }

      newParty.push(pokemon);
    }

    if (newParty.length === 0) {
      window.__LAST_LOAD_ERROR = 'NO_VALID_POKEMON';
      return false;
    }

    myParty = newParty;
    currentPokemonIndex = clampInt(state.currentPokemonIndex, 0, myParty.length - 1, 0);

    window.__LAST_LOAD_ERROR = null;
    return true;
  } catch (e) {
    console.error('Ошибка загрузки сохранения:', e);
    window.__LAST_LOAD_ERROR = 'EXCEPTION';
    return false;
  }
}

let saveInterval = null;

function startAutoSave() {
  if (saveInterval) clearInterval(saveInterval);
  saveInterval = setInterval(() => { saveGame(); }, 10000);
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
