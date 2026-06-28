// =======================================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// =======================================================================

let allPokemon = []; // Инициализируем пустым массивом сразу
let myParty = [];
let currentPokemonIndex = 0;
let inBattle = false;
let canvas = null;
let ctx = null;

const gameState = {
    money: 0,
    items: {},
    badges: [],
    currentLocation: 'Маршрут 1'
};

// Автосохранение
let autoSaveInterval = null;

function startAutoSave() {
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    autoSaveInterval = setInterval(saveGame, 60000); // Каждую минуту
}

function saveGame() {
    const saveData = {
        myParty: myParty,
        currentPokemonIndex: currentPokemonIndex,
        gameState: gameState
    };
    localStorage.setItem('pokemonRPG_save', JSON.stringify(saveData));
}

function loadGame() {
    const data = localStorage.getItem('pokemonRPG_save');
    if (data) {
        const saveData = JSON.parse(data);
        myParty = saveData.myParty || [];
        currentPokemonIndex = saveData.currentPokemonIndex || 0;
        Object.assign(gameState, saveData.gameState || {});
    }
}

function addMessage(text) {
    const battleScreen = document.getElementById('battle-screen');
    if (battleScreen) {
        battleScreen.innerHTML += '<br>' + text;
        battleScreen.scrollTop = battleScreen.scrollHeight;
    }
}

function updateHpBars() {
    if (myParty.length > 0 && currentPokemonIndex < myParty.length) {
        const pokemon = myParty[currentPokemonIndex];
        const maxHp = pokemon.getMaxHp();
        const currentHp = pokemon.hp;
        const hpPercent = (currentHp / maxHp) * 100;
        
        document.getElementById('p-name').textContent = pokemon.getName();
        document.getElementById('p-level').textContent = pokemon.level;
        document.getElementById('p-hp-text').textContent = currentHp + '/' + maxHp;
        document.getElementById('p-hp-bar').style.width = hpPercent + '%';
        
        if (hpPercent < 25) {
            document.getElementById('p-hp-bar').classList.add('low');
        } else {
            document.getElementById('p-hp-bar').classList.remove('low');
        }
    }
}

function updateInfoPanel() {
    document.getElementById('money').textContent = gameState.money;
    document.getElementById('location').textContent = gameState.currentLocation;
    document.getElementById('party-count').textContent = myParty.length;
}
