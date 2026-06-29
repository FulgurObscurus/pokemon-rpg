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

let gameState = {
    money: 300,
    items: { potion: 5, pokeball: 3 },
};

function saveGame() {

 try {
  const state = {
   version: SAVE_VERSION,
   money: gameState.money,
   items: gameState.items,
   log: gameLog.slice(-50),
   party: myParty.map(p => ({
    speciesId: p.speciesId,
    level: p.level,
    exp: p.exp,
    currentHp: p.currentHp,
    status: p.status,

    // важные "стабильные" поля — чтобы после F5 не переролливались
    ability: p.ability,
    shiny: !!p.shiny,
    gender: p.gender,
    heldItem: p.heldItem,
    friendship: p.friendship,

    moves: (p.moves || []).map(m => ({
     id: (m && m.id) ? m.id : null,
     name: (m && m.name) ? m.name : null,
     pp: (m && typeof m.pp === 'number') ? m.pp : null
    })),
    statPoints: p.statPoints || {hp:0,attack:0,defense:0,spAttack:0,spDefense:0,speed:0},
   })),
   currentPokemonIndex: currentPokemonIndex,
   ts: Date.now()
  };

  localStorage.setItem('pokemonRPG_save_v3', JSON.stringify(state));
  console.log('Игра сохранена');
  return true;
 } catch (e) {
  console.error('Ошибка сохранения:', e);
  return false;
 }
}
function loadGame() {

 try {
  var raw = localStorage.getItem('pokemonRPG_save_v3');
  if (!raw) return false;

  var state = null;
  try { state = JSON.parse(raw); } catch(e) {
   localStorage.removeItem('pokemonRPG_save_v3');
   return false;
  }

  if (!state || !state.version) {
   localStorage.removeItem('pokemonRPG_save_v3');
   return false;
  }

  // ВАЖНО: не удаляем сохранение только из-за версии — пробуем загрузить
  if (state.version < SAVE_VERSION) {
   console.warn('Старое сохранение: версия ' + state.version + ', текущая ' + SAVE_VERSION);
  }

  // ВАЖНО: не удаляем сохранение, если данные покемонов ещё не готовы
  if (typeof allPokemonData === 'undefined' || !allPokemonData || Object.keys(allPokemonData).length === 0) {
   return false;
  }

  if (!state.party || !Array.isArray(state.party) || state.party.length === 0) {
   localStorage.removeItem('pokemonRPG_save_v3');
   return false;
  }

  // деньги
  var mny = parseInt(state.money, 10);
  gameState.money = (isNaN(mny) ? 300 : mny);

  // предметы
  if (state.items && typeof state.items === 'object') {
   gameState.items = Object.assign({ potion: 0, pokeball: 0 }, state.items);
   gameState.items.potion = Math.max(0, parseInt(gameState.items.potion || 0, 10));
   gameState.items.pokeball = Math.max(0, parseInt(gameState.items.pokeball || 0, 10));
  } else {
   gameState.items = { potion: 5, pokeball: 3 };
  }

  // лог
  if (state.log && Array.isArray(state.log)) gameLog = state.log.slice(-50);
  else gameLog = [];

  var newParty = [];

  for (var i = 0; i < state.party.length; i++) {
   try {
    var p = state.party[i];
    if (!p || !p.speciesId) continue;
    if (!allPokemonData[p.speciesId]) continue;

    var lvl = parseInt(p.level, 10);
    if (isNaN(lvl) || lvl < 1) lvl = 5;

    var pokemon = new Poke(p.speciesId, lvl);

    var exp = parseInt(p.exp, 10);
    pokemon.exp = (isNaN(exp) ? 0 : exp);

    if (p.statPoints && typeof p.statPoints === 'object') {
     pokemon.statPoints = {hp:0,attack:0,defense:0,spAttack:0,spDefense:0,speed:0};
     for (var k in pokemon.statPoints) {
      if (Object.prototype.hasOwnProperty.call(p.statPoints, k)) {
       var v = parseInt(p.statPoints[k], 10);
       pokemon.statPoints[k] = isNaN(v) ? 0 : v;
      }
     }
    }

    var maxHp = pokemon.maxHp;
    var chp = (typeof p.currentHp === 'number') ? p.currentHp : parseInt(p.currentHp, 10);
    if (isNaN(chp) || chp <= 0) chp = maxHp;
    pokemon.currentHp = Math.min(chp, maxHp);
    pokemon.status = p.status || null;

    // восстановление стабильных полей
    if (typeof p.ability === 'string' && p.ability) pokemon.ability = p.ability;
    if (typeof p.gender === 'string' && p.gender) pokemon.gender = p.gender;
    pokemon.shiny = !!p.shiny;
    pokemon.heldItem = (typeof p.heldItem !== 'undefined') ? p.heldItem : null;
    var fr = parseInt(p.friendship, 10);
    if (!isNaN(fr)) pokemon.friendship = fr;

    // приёмы + PP
    if (p.moves && Array.isArray(p.moves) && p.moves.length > 0) {
     var loadedMoves = [];
     for (var j = 0; j < p.moves.length; j++) {
      try {
       var sm = p.moves[j];
       var mv = null;
       if (sm && sm.id) mv = buildMoveFromEntry({ move: sm.id, learnLevel: 1 });
       else if (sm && sm.name) mv = buildMoveFromEntry({ name: sm.name, learnLevel: 1 });

       if (mv && mv.id) {
        var pp = (typeof sm.pp === 'number') ? sm.pp : parseInt(sm.pp, 10);
        var cap = (typeof mv.max_pp === 'number' && mv.max_pp > 0) ? mv.max_pp : mv.pp;
        if (!isNaN(pp) && typeof cap === 'number') mv.pp = Math.max(0, Math.min(pp, cap));
        loadedMoves.push(mv);
       }
      } catch(me) { }
     }
     if (loadedMoves.length > 0) pokemon.moves = loadedMoves;
    }

    newParty.push(pokemon);
   } catch(pe) { }
  }

  if (newParty.length === 0) {
   localStorage.removeItem('pokemonRPG_save_v3');
   return false;
  }

  myParty = newParty;

  var idx = parseInt(state.currentPokemonIndex, 10);
  if (isNaN(idx) || idx < 0 || idx >= myParty.length) idx = 0;
  currentPokemonIndex = idx;

  return true;
 } catch (e) {
  localStorage.removeItem('pokemonRPG_save_v3');
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
