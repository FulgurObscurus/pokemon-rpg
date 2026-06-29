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

let gameState = {
    money: 300,
    items: { potion: 5, pokeball: 3 },
};

function saveGame() {
    try {
        const state = {
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
        const raw = localStorage.getItem('pokemonRPG_save');
        if (!raw) return false;

        if (typeof allPokemonData === 'undefined' || Object.keys(allPokemonData).length === 0) {
            console.warn('loadGame: данные ещё не загружены');
            return false;
        }

        // Проверяем, загружены ли данные покемонов
        if (typeof allPokemonData === 'undefined' || Object.keys(allPokemonData).length === 0) {
            console.warn('loadGame: данные покемонов ещё не загружены, пропускаем');
            return false;
        }

        const state = JSON.parse(raw);
        gameState.money = state.money || 300;
        gameState.items = state.items || { potion: 5, pokeball: 3 };

        myParty = (state.party || []).map(p => {
            const pokemon = new Poke(p.speciesId, p.level);
            pokemon.exp = p.exp || 0;
            pokemon.currentHp = (p.currentHp !== undefined ? p.currentHp : pokemon.maxHp);
            pokemon.status = p.status || null;

            // Загружаем statPoints
            if (p.statPoints) {
                pokemon.statPoints = { ...p.statPoints };
            }

            // Загружаем приёмы по ID (новый формат)
            if (p.moves && p.moves.length > 0) {
                pokemon.moves = p.moves.map(m => {
                    if (m.id) return buildMoveFromEntry({ move: m.id });
                    if (m.name) return buildMoveFromEntry({ name: m.name });
                    return null;
                }).filter(Boolean);
                p.moves.forEach((sm, idx) => {
                    if (sm.pp !== undefined && pokemon.moves[idx]) {
                        pokemon.moves[idx].pp = sm.pp;
                    }
                });
            }

            return pokemon;
        });

        currentPokemonIndex = state.currentPokemonIndex || 0;
        if (currentPokemonIndex >= myParty.length) currentPokemonIndex = 0;

        console.log('📂 Игра загружена');
        return true;
    } catch (e) {
        console.error('Ошибка загрузки:', e);
        // Сбрасываем сломанное сохранение
        localStorage.removeItem('pokemonRPG_save');
        console.warn('Сломанное сохранение удалено');
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
