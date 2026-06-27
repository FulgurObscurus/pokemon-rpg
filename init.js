// =======================================================================
// ИНИЦИАЛИЗАЦИЯ
// =======================================================================
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('loading').textContent = '⏳ Шаг 0: Инициализация...';

    // 1. Загружаем данные покемонов
    loadAllPokemon();
    document.getElementById('loading').textContent = '⏳ Шаг 1: Данные загружены';

    // 2. Загружаем сохранение
    const loaded = loadGame();
    document.getElementById('loading').textContent = loaded ? '⏳ Шаг 2: Сохранение найдено' : '⏳ Шаг 2: Сохранения нет, создаём нового';

    if (!loaded) {
        // Шаг 2.1: пытаемся создать стартового покемона
        document.getElementById('loading').textContent = '⏳ Шаг 2.1: Создаём стартового покемона (Пикачу)...';
        try {
            const starter = new Poke(25, 5);
            document.getElementById('loading').textContent = '⏳ Шаг 2.2: Покемон создан, добавляем в команду...';
            myParty.push(starter);
            currentPokemonIndex = 0;
            gameState.money = 300;
            gameState.items = { potion: 5, pokeball: 3 };
            document.getElementById('loading').textContent = '⏳ Шаг 2.3: Сохраняем игру...';
            saveGame();
            document.getElementById('loading').textContent = '⏳ Шаг 3: Стартовый покемон создан и игра сохранена';
        } catch(e) {
            document.getElementById('loading').textContent = `❌ Ошибка на шаге 2.1-2.3: ${e.message}`;
            console.error(e);
            return;
        }
    } else {
        document.getElementById('loading').textContent = '⏳ Шаг 3: Сохранение загружено';
    }

    // 3. Проверяем, что есть покемоны
    if (!myParty || myParty.length === 0) {
        document.getElementById('loading').textContent = '❌ Ошибка: нет покемонов!';
        return;
    }

    // 4. Показываем интерфейс
    document.getElementById('loading').textContent = '⏳ Шаг 4: Показываем интерфейс...';
    document.getElementById('loading').style.display = 'none';
    document.getElementById('battle-screen').style.display = 'block';
    document.getElementById('hp-bars').style.display = 'flex';
    document.getElementById('actions').style.display = 'grid';
    document.getElementById('info-panel').style.display = 'flex';

    updateHpBars();
    updateInfoPanel();
    addMessage(`🌟 Добро пожаловать! Ваш покемон - ${getCurrentPokemon().name}!`);
    addMessage(`📍 Вы на Маршруте 1. Нажмите "Исследовать" для битвы.`);

    // Настройка кнопок
    document.getElementById('btn-fight').textContent = '🌲 Исследовать';
    document.getElementById('btn-fight').onclick = () => {
        if (inBattle) return;
        const wild = generateWildPokemon();
        startBattle(wild);
        document.getElementById('btn-fight').textContent = '⚔️ Бой';
    };
    document.getElementById('btn-bag').onclick = useBag;
    document.getElementById('btn-switch').onclick = switchPokemon;
    document.getElementById('btn-run').onclick = () => {
        if (inBattle) {
            if (Math.random() < 0.5) {
                addMessage(`🏃 Вы сбежали!`);
                enemyPokemon = null;
                inBattle = false;
                showActions();
                document.getElementById('btn-fight').textContent = '🌲 Исследовать';
            } else {
                addMessage(`⚠️ Не удалось сбежать!`);
                enemyTurn();
            }
        }
    };

    document.getElementById('btn-save').addEventListener('click', () => {
        saveGame();
        addMessage('💾 Игра сохранена!');
    });
    document.getElementById('btn-export').addEventListener('click', () => {
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
    document.getElementById('btn-import').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
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

    startAutoSave();

    document.getElementById('btn-fight').disabled = false;
    document.getElementById('btn-bag').disabled = true;
    document.getElementById('btn-switch').disabled = true;
    document.getElementById('btn-run').disabled = true;

    document.getElementById('loading').textContent = '✅ Игра полностью готова!';
});