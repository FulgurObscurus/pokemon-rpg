// =======================================================================
// ИНИЦИАЛИЗАЦИЯ
// =======================================================================
document.addEventListener('DOMContentLoaded', function() {
    loadAllPokemon();

    if (!myParty || myParty.length === 0) {
        const starter = new Poke(25, 5);
        myParty = [starter];
        currentPokemonIndex = 0;
        gameState.money = 300;
        gameState.items = { potion: 5, pokeball: 3 };
        saveGame();
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
            addMessage('❌ Не удалось создать дикого покемона');
            return;
        }

        showBattleScreen();

        if (btnFight) btnFight.textContent = '⚔️ Бой';
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

    if (btnSwitch) btnSwitch.disabled = true;
    if (btnRun) btnRun.disabled = true;

    const btnSave = document.getElementById('btn-save');
    if (btnSave) {
        btnSave.addEventListener('click', function() {
            saveGame();
            addMessage('💾 Игра сохранена!');
        });
    }

    const btnExport = document.getElementById('btn-export');
    if (btnExport) {
        btnExport.addEventListener('click', function() {
            const data = localStorage.getItem('pokemonRPG_save');
            if (!data) {
                addMessage('❌ Нет сохранения для экспорта');
                return;
            }
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'pokemon_save.json';
            a.click();
            URL.revokeObjectURL(url);
            addMessage('📤 Сохранение экспортировано!');
        });
    }

    const btnImport = document.getElementById('btn-import');
    if (btnImport) {
        btnImport.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = function(ev) {
                    try {
                        const data = ev.target.result;
                        JSON.parse(data);
                        localStorage.setItem('pokemonRPG_save', data);
                        addMessage('📥 Сохранение импортировано! Перезагрузите страницу.');
                    } catch (err) {
                        addMessage('❌ Ошибка импорта: неверный файл');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        });
    }

    startAutoSave();
});
