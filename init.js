// =======================================================================
// ИНИЦИАЛИЗАЦИЯ
// =======================================================================

// Глобальная функция для генерации дикого покемона
window.generateWildPokemon = function() {
    if (typeof allPokemon === 'undefined') {
        console.error('allPokemon не определён');
        return null;
    }
    
    if (!allPokemon || allPokemon.length === 0) {
        console.error('allPokemon пуст');
        return null;
    }
    
    var maxId = Math.min(allPokemon.length, 151);
    var randomIndex = Math.floor(Math.random() * maxId);
    var pokemonData = allPokemon[randomIndex];
    
    if (!pokemonData || !pokemonData.id) {
        console.error('Некорректные данные покемона:', pokemonData);
        return null;
    }
    
    var level = Math.floor(Math.random() * 4) + 2;
    var wild = new Poke(pokemonData.id, level);
    
    console.log('Сгенерирован дикий покемон:', wild.getName(), '(ID:', pokemonData.id, '), уровень', level);
    
    return wild;
};

// Глобальная функция для кнопки "Исследовать"
window.startExplore = function() {
    console.log('[startExplore] Вызвана');
    console.log('[startExplore] inBattle:', typeof inBattle !== 'undefined' ? inBattle : 'undefined');
    console.log('[startExplore] allPokemon:', typeof allPokemon !== 'undefined' ? allPokemon.length : 'undefined');
    
    if (typeof inBattle !== 'undefined' && inBattle) {
        addMessage('Уже в бою!');
        return false;
    }
    
    var wild = window.generateWildPokemon();
    if (!wild) {
        addMessage('❌ Не удалось создать дикого покемона!');
        return false;
    }
    
    var canvasEl = document.querySelector('canvas');
    if (canvasEl) canvasEl.style.display = 'none';
    
    var controlsEl = document.getElementById('controls');
    if (controlsEl) controlsEl.style.display = 'none';
    
    var battleScreenEl = document.getElementById('battle-screen');
    if (battleScreenEl) {
        battleScreenEl.style.display = 'block';
        battleScreenEl.innerHTML = '';
    }
    
    var hpBarsEl = document.getElementById('hp-bars');
    if (hpBarsEl) hpBarsEl.style.display = 'flex';
    
    var actionsEl = document.getElementById('actions');
    if (actionsEl) actionsEl.style.display = 'grid';
    
    if (typeof startBattle === 'function') {
        startBattle(wild);
    } else {
        addMessage('❌ startBattle не найден!');
    }
    
    return false;
};

// Делаем функции глобально доступными
window.addEventListener('DOMContentLoaded', async function() {
    await loadAllPokemon();

    if (!myParty || myParty.length === 0) {
        const starter = new Poke(25, 5);
        myParty = [starter];
        currentPokemonIndex = 0;
        gameState.money = 300;
        gameState.items = { potion: 5, pokeball: 3 };
        saveGame();
    }

    var loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.style.display = 'none';
    
    var battleScreenEl = document.getElementById('battle-screen');
    if (battleScreenEl) battleScreenEl.style.display = 'none';
    
    var hpBarsEl = document.getElementById('hp-bars');
    if (hpBarsEl) hpBarsEl.style.display = 'none';
    
    var actionsEl = document.getElementById('actions');
    if (actionsEl) actionsEl.style.display = 'none';
    
    var infoPanelEl = document.getElementById('info-panel');
    if (infoPanelEl) infoPanelEl.style.display = 'flex';
    
    var controlsEl = document.getElementById('controls');
    if (controlsEl) controlsEl.style.display = 'grid';

    updateHpBars();
    updateInfoPanel();

    var btnSave = document.getElementById('btn-save');
    if (btnSave) btnSave.addEventListener('click', function() {
        saveGame();
        addMessage('💾 Игра сохранена!');
    });

    var btnExport = document.getElementById('btn-export');
    if (btnExport) btnExport.addEventListener('click', function() {
        const data = localStorage.getItem('pokemonRPG_save');
        if (!data) { addMessage('❌ Нет сохранения для экспорта'); return; }
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pokemon_save.json';
        a.click();
        URL.revokeObjectURL(url);
        addMessage('📤 Сохранение экспортировано!');
    });

    var btnImport = document.getElementById('btn-import');
    if (btnImport) btnImport.addEventListener('click', function() {
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
                } catch(err) {
                    addMessage('❌ Ошибка импорта: неверный файл');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    });

    var btnBag = document.getElementById('btn-bag');
    if (btnBag && typeof openInventory === 'function') {
        btnBag.onclick = openInventory;
    }

    // Принудительно привязываем обработчик к кнопке
    var btnAction = document.getElementById('btn-action');
    if (btnAction) {
        // Удаляем старый onclick
        btnAction.removeAttribute('onclick');
        // Добавляем новый
        btnAction.onclick = window.startExplore;
        console.log('[init] Обработчик btn-action привязан');
    }

    startAutoSave();

    var btnFight = document.getElementById('btn-fight');
    if (btnFight) btnFight.disabled = false;
    if (btnBag) btnBag.disabled = true;
    var btnSwitch = document.getElementById('btn-switch');
    if (btnSwitch) btnSwitch.disabled = true;
    var btnRun = document.getElementById('btn-run');
    if (btnRun) btnRun.disabled = true;
    
    console.log('[init] Инициализация завершена');
    console.log('[init] window.startExplore:', typeof window.startExplore);
    console.log('[init] window.generateWildPokemon:', typeof window.generateWildPokemon);
});
