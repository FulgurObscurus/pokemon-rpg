// =======================================================================
// ИНИЦИАЛИЗАЦИЯ
// =======================================================================
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

    // Привязка кнопки "Инвентарь" к openInventory
    document.getElementById('btn-bag').onclick = openInventory;

    // Привязка кнопки "Исследовать" к бою
    document.getElementById('btn-action').addEventListener('click', function() {
        if (!inBattle) {
            var wild = generateWildPokemon();
            if (wild) {
                canvas.style.display = 'none';
                document.getElementById('controls').style.display = 'none';
                document.getElementById('battle-screen').style.display = 'block';
                document.getElementById('hp-bars').style.display = 'flex';
                document.getElementById('actions').style.display = 'grid';
                document.getElementById('info-panel').style.display = 'flex';
                startBattle(wild);
                document.getElementById('btn-fight').textContent = '⚔️ Бой';
            }
        }
    });

    startAutoSave();

    document.getElementById('btn-fight').disabled = false;
    document.getElementById('btn-bag').disabled = true;
    document.getElementById('btn-switch').disabled = true;
    document.getElementById('btn-run').disabled = true;
});
