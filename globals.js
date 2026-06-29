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

const SAVE_VERSION = 2;

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
        localStorage.setItem('pokemonRPG_save', JSON.stringify(state));
        console.log('💾 Игра сохранена');
    } catch (e) {
        console.error('Ошибка сохранения:', e);
    }
}

function loadGame() {
    try {
        var raw = localStorage.getItem('pokemonRPG_save');
        if (!raw) return false;

        var state = JSON.parse(raw);
        if (!state) { localStorage.removeItem('pokemonRPG_save'); return false; }

        // Проверка версии — несовместимое сохранение удаляем
        if (!state.version || state.version < SAVE_VERSION) {
            console.warn('Сохранение устарело, сбрасываем');
            localStorage.removeItem('pokemonRPG_save');
            return false;
        }

        if (!state.party || state.party.length === 0) return false;

        // Проверяем что данные покемонов загружены
        if (typeof allPokemonData === 'undefined' || Object.keys(allPokemonData).length === 0) return false;

        gameState.money = state.money || 300;
        gameState.items = state.items || { potion: 5, pokeball: 3 };

        myParty = state.party.map(function(p) {
            var pokemon = new Poke(p.speciesId, p.level);
            pokemon.exp = p.exp || 0;
            pokemon.currentHp = (p.currentHp !== undefined ? p.currentHp : pokemon.maxHp);
            pokemon.status = p.status || null;
            if (p.statPoints) pokemon.statPoints = Object.assign({}, p.statPoints);
            if (p.moves && p.moves.length > 0) {
                pokemon.moves = p.moves.map(function(m) {
                    if (m.id) return buildMoveFromEntry({ move: m.id });
                    if (m.name) return buildMoveFromEntry({ name: m.name });
                    return null;
                }).filter(Boolean);
                p.moves.forEach(function(sm, idx) {
                    if (sm.pp !== undefined && pokemon.moves[idx]) pokemon.moves[idx].pp = sm.pp;
                });
            }
            return pokemon;
        });

        currentPokemonIndex = state.currentPokemonIndex || 0;
        if (currentPokemonIndex >= myParty.length) currentPokemonIndex = 0;
        return true;
    } catch (e) {
        console.error('Ошибка загрузки:', e);
        localStorage.removeItem('pokemonRPG_save');
        return false;
    }
}

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
