// =======================================================================
// ИНИЦИАЛИЗАЦИЯ
// =======================================================================

// Глобальная функция для генерации дикого покемона
window.generateWildPokemon = function() {
    if (!allPokemon || allPokemon.length === 0) {
        console.error('allPokemon пуст');
        return null;
    }
    
    var maxId = Math.min(allPokemon.length, 151);
    var randomIndex = Math.floor(Math.random() * maxId);
    var pokemonData = allPokemon[randomIndex];
    
    if (!pokemonData || !pokemonData.id) {
        console.error('Некорректные данные:', pokemonData);
        return null;
    }
    
    var level = Math.floor(Math.random() * 4) + 2;
    var wild = new Poke(pokemonData.id, level);
    
    console.log('Дикий покемон:', wild.getName(), 'уровень', level);
    return wild;
};

// Глобальная функция для кнопки "Исследовать"
window.startExplore = function() {
    console.log('[startExplore] Вызвана');
    
    if (typeof inBattle !== 'undefined' && inBattle) {
        addMessage('Уже в бою!');
        return false;
    }
    
    // Проверяем, стоит ли игрок на траве (шанс 30%)
    var onGrass = Math.random() < 0.3;
    
    if (!onGrass) {
        addMessage('Здесь нет диких покемонов...');
        return false;
    }
    
    var wild = window.generateWildPokemon();
    if (!wild) {
        addMessage('❌ Не удалось создать покемона!');
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

// Инициализация
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

    document.getElementById('loading').style.display = 'none';
    document.getElementById('battle-screen').style.display = 'none';
    document.getElementById('hp-bars').style.display = 'none';
    document.getElementById('actions').style.display = 'none';
    document.getElementById('info-panel').style.display = 'flex';
    document.getElementById('controls').style.display = 'grid';

    updateHpBars();
    updateInfoPanel();

    // Кнопки
    document.getElementById('btn-save').addEventListener('click', function() {
        saveGame();
        addMessage('💾 Игра сохранена!');
    });

    document.getElementById('btn-export').addEventListener('click', function() {
        const data = localStorage.getItem('pokemonRPG_save');
        if (!data) { addMessage('❌ Нет сохранения'); return; }
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pokemon_save.json';
        a.click();
        URL.revokeObjectURL(url);
        addMessage('📤 Экспортировано!');
    });

    document.getElementById('btn-import').addEventListener('click', function() {
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
                    addMessage('📥 Импортировано! Перезагрузите.');
                } catch(err) {
                    addMessage('❌ Ошибка импорта');
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

    // Перепривязываем кнопку "Исследовать" через 200мс
    setTimeout(function() {
        var btnAction = document.getElementById('btn-action');
        if (btnAction) {
            var newBtn = btnAction.cloneNode(true);
            btnAction.parentNode.replaceChild(newBtn, btnAction);
            newBtn.onclick = window.startExplore;
            console.log('[init] Кнопка перепривязана на startExplore');
        }
    }, 200);

    startAutoSave();

    document.getElementById('btn-fight').disabled = false;
    document.getElementById('btn-bag').disabled = true;
    document.getElementById('btn-switch').disabled = true;
    document.getElementById('btn-run').disabled = true;
});
