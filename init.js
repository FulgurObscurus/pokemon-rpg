// =======================================================================
// ИНИЦИАЛИЗАЦИЯ
// =======================================================================
document.addEventListener('DOMContentLoaded', function() {
    loadAllPokemon();
    
    // ИСПРАВЛЕНИЕ: Автоочистка ВСЕХ старых сломанных сохранений (включая v2)
    ['pokemonRPG_save', 'pokemonRPG_save_v1', 'pokemonRPG_save_v2'].forEach(function(key) {
        try { 
            var _t = localStorage.getItem(key); 
            if(_t) JSON.parse(_t); 
        } catch(e) { 
            localStorage.removeItem(key); 
            console.warn('Сломанное сохранение удалено:', key); 
        }
    });

    var loaded = false;
    try {
        loaded = loadGame();
    } catch(e) {
        console.error('Ошибка загрузки:', e);
        localStorage.removeItem('pokemonRPG_save_v3');
    }

    // ИСПРАВЛЕНИЕ: БЕЗОПАСНОЕ создание стартера с try/catch
    if (!loaded || !myParty || myParty.length === 0) {
        try {
            const starter = new Poke(25, 5);
            myParty = [starter];
            currentPokemonIndex = 0;
            gameState.money = 300;
            gameState.items = { potion: 5, pokeball: 3 };
            saveGame();
        } catch(e) {
            console.error('Не удалось создать стартера:', e);
            localStorage.removeItem('pokemonRPG_save_v3');
            myParty = [];
        }
    }

    const loadingEl = document.getElementById('loading');
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
        if (inBattle) {
            onFight();
            return;
        }

        const wild = generateWildPokemon();
        if (!wild) {
            addMessage('Не удалось создать дикого покемона');
            return;
        }

        showBattleScreen();

        if (btnFight) btnFight.textContent = 'Бой';
        startBattle(wild);
    }

    if (btnFight) {
        btnFight.disabled = false;
        btnFight.onclick = startWildBattle;
    }

    if (btnAction) {
        btnAction.onclick = startWildBattle;
    }

    if (btnBag) {
        btnBag.onclick = openInventory;
        btnBag.disabled = true;
    }

    if (btnSwitch) {
        btnSwitch.disabled = true;
        btnSwitch.onclick = function() { switchPokemon(); };
    }
    if (btnRun) btnRun.disabled = true;

    var btnSave = document.getElementById('btn-save');
    if (btnSave) {
        btnSave.addEventListener('click', function() {
            saveGame();
            addMessage('Сохранено!');
        });
    }

    var btnTraining = document.getElementById('btn-training');
    if (btnTraining) {
        btnTraining.addEventListener('click', function() {
            openTraining();
        });
    }

    var trainCloseBtn = document.getElementById('train-close-btn');
    if (trainCloseBtn) {
        trainCloseBtn.addEventListener('click', function() {
            closeTraining();
        });
    }

    var trainConfirmBtn = document.getElementById('train-confirm-btn');
    if (trainConfirmBtn) {
        trainConfirmBtn.addEventListener('click', function() {
            confirmTraining();
        });
    }

    startAutoSave();
});
