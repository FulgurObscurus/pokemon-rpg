// =======================================================================
// ИНИЦИАЛИЗАЦИЯ
// =======================================================================

// Глобальная функция для генерации дикого покемона
function generateWildPokemon() {
    if (typeof allPokemon === 'undefined') {
        console.error('allPokemon не определён');
        return null;
    }
    
    if (!allPokemon || allPokemon.length === 0) {
        console.error('allPokemon пуст');
        return null;
    }
    
    // Выбираем случайного покемона (только первые 151 - Gen 1)
    var maxId = Math.min(allPokemon.length, 151);
    var randomIndex = Math.floor(Math.random() * maxId);
    var pokemonData = allPokemon[randomIndex];
    
    if (!pokemonData || !pokemonData.id) {
        console.error('Некорректные данные покемона:', pokemonData);
        return null;
    }
    
    // Случайный уровень 2-5
    var level = Math.floor(Math.random() * 4) + 2;
    
    // Создаём экземпляр через класс Poke
    var wild = new Poke(pokemonData.id, level);
    
    console.log('Сгенерирован дикий покемон:', wild.getName(), '(ID:', pokemonData.id, '), уровень', level);
    
    return wild;
}

// Глобальная функция для кнопки "Исследовать"
function startExplore() {
    console.log('[DEBUG] startExplore вызвана');
    console.log('allPokemon:', typeof allPokemon !== 'undefined' ? allPokemon.length : 'undefined');
    
    if (typeof inBattle !== 'undefined' && inBattle) {
        addMessage('Уже в бою!');
        return;
    }
    
    var wild = generateWildPokemon();
    if (!wild) {
        addMessage('❌ Не удалось создать дикого покемона!');
        return;
    }
    
    var canvasEl = document.querySelector('canvas');
    if (canvasEl) canvasEl.style.display = 'none';
    document.getElementById('controls').style.display = 'none';
    
    document.getElementById('battle-screen').style.display = 'block';
    document.getElementById('battle-screen').innerHTML = '';
    document.getElementById('hp-bars').style.display = 'flex';
    document.getElementById('actions').style.display = 'grid';
    
    startBattle(wild);
}

document.addEventListener('DOMContentLoaded', async function() {
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

    // Кнопка сохранения
    document.getElementById('btn-save').addEventListener('click', function() {
        saveGame();
        addMessage('💾 Игра сохранена!');
    });

    // Кнопка экспорта
    document.getElementById('btn-export').addEventListener('click', function() {
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

    // Кнопка импорта
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
                    addMessage('📥 Сохранение импортировано! Перезагрузите страницу.');
                } catch(err) {
                    addMessage('❌ Ошибка импорта: неверный файл');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    });

    // Привязка кнопки "Инвентарь"
    document.getElementById('btn-bag').onclick = openInventory;

    startAutoSave();

    document.getElementById('btn-fight').disabled = false;
    document.getElementById('btn-bag').disabled = true;
    document.getElementById('btn-switch').disabled = true;
    document.getElementById('btn-run').disabled = true;
});
