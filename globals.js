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
                moves: (p.moves || []).map(m => ({ id: m.id, name: m.name, pp: m.pp })),
                statPoints: p.statPoints || {hp:0,attack:0,defense:0,spAttack:0,spDefense:0,speed:0},
            })),
            currentPokemonIndex: currentPokemonIndex,
        };
        localStorage.setItem('pokemonRPG_save_v3', JSON.stringify(state));
        console.log('💾 Игра сохранена');
    } catch (e) {
        console.error('Ошибка сохранения:', e);
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

        if (!state || !state.version || state.version < SAVE_VERSION) {
            localStorage.removeItem('pokemonRPG_save_v3');
            return false;
        }

        // ИСПРАВЛЕНИЕ: очищаем localStorage если данные покемонов не загружены
        if (typeof allPokemonData === 'undefined' || !allPokemonData || Object.keys(allPokemonData).length === 0) {
            localStorage.removeItem('pokemonRPG_save_v3');
            return false;
        }

        // ИСПРАВЛЕНИЕ: очищаем localStorage если партия некорректна
        if (!state.party || !Array.isArray(state.party) || state.party.length === 0) {
            localStorage.removeItem('pokemonRPG_save_v3');
            return false;
        }

        gameState.money = state.money || 300;
        gameState.items = state.items || { potion: 5, pokeball: 3 };

        var newParty = [];
        for (var i = 0; i < state.party.length; i++) {
            try {
                var p = state.party[i];
                if (!p || !p.speciesId) continue;
                if (!allPokemonData[p.speciesId]) continue;

                var pokemon = new Poke(p.speciesId, p.level);
                pokemon.exp = p.exp || 0;

                if (p.statPoints) {
                    pokemon.statPoints = {hp:0,attack:0,defense:0,spAttack:0,spDefense:0,speed:0};
                    for (var k in p.statPoints) {
                        if (p.statPoints.hasOwnProperty(k)) pokemon.statPoints[k] = p.statPoints[k];
                    }
                }

                if (p.moves && Array.isArray(p.moves) && p.moves.length > 0) {
                    var loadedMoves = [];
                    for (var j = 0; j < p.moves.length; j++) {
                        try {
                            var m = p.moves[j];
                            if (m && m.id) {
                                var mv = buildMoveFromEntry({move: m.id});
                                if (mv && mv.id) loadedMoves.push(mv);
                            } else if (m && m.name) {
                                var mv2 = buildMoveFromEntry({name: m.name});
                                if (mv2 && mv2.id) loadedMoves.push(mv2);
                            }
                        } catch(me) { /* skip bad move */ }
                    }
                    if (loadedMoves.length > 0) pokemon.moves = loadedMoves;
                }

                var maxHp = pokemon.maxHp;
                // ИСПРАВЛЕНИЕ: не загружаем покемонов с 0 HP
                pokemon.currentHp = (typeof p.currentHp === 'number' && p.currentHp > 0) ? Math.min(p.currentHp, maxHp) : maxHp;
                pokemon.status = p.status || null;

                newParty.push(pokemon);
            } catch(pe) {
                /* skip bad pokemon */
            }
        }

        if (newParty.length === 0) {
            localStorage.removeItem('pokemonRPG_save_v3');
            return false;
        }

        myParty = newParty;
        currentPokemonIndex = (state.currentPokemonIndex && state.currentPokemonIndex < myParty.length) ? state.currentPokemonIndex : 0;
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
