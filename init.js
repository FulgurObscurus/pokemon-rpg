// =======================================================================
// ИНИЦИАЛИЗАЦИЯ С ДИАГНОСТИКОЙ
// =======================================================================
function debug(msg) {
    const el = document.getElementById('debug');
    if (el) {
        el.textContent += msg + '\n';
        el.scrollTop = el.scrollHeight;
    }
    console.log(msg);
}

document.addEventListener('DOMContentLoaded', function() {
    debug('⏳ Инициализация...');

    // 1. Проверяем, определён ли ALL_POKEMON_DATA (из pokedex.js)
    if (typeof ALL_POKEMON_DATA !== 'undefined') {
        debug('✅ ALL_POKEMON_DATA определён. Количество: ' + Object.keys(ALL_POKEMON_DATA).length);
    } else {
        debug('❌ ALL_POKEMON_DATA не определён! pokedex.js не загружен.');
    }

    // 2. Загружаем данные (если ALL_POKEMON_DATA есть, они скопируются в allPokemonData)
    try {
        loadAllPokemon();
        debug('✅ Функция loadAllPokemon() выполнена');
    } catch(e) {
        debug('❌ Ошибка в loadAllPokemon(): ' + e.message);
    }

    // 3. Проверяем, что данные скопировались
    if (typeof allPokemonData !== 'undefined' && Object.keys(allPokemonData).length > 0) {
        debug('✅ allPokemonData загружено: ' + Object.keys(allPokemonData).length + ' покемонов');
    } else {
        debug('❌ allPokemonData пусто или не определено!');
    }

    // 4. Проверяем класс Poke
    if (typeof Poke !== 'undefined') {
        debug('✅ Класс Poke определён');
    } else {
        debug('❌ Класс Poke не определён! Проверьте pokemon-class.js');
        return;
    }

    // 5. Создаём стартового покемона, если его нет
    if (!myParty || myParty.length === 0) {
        try {
            const starter = new Poke(25, 5);
            myParty = [starter];
            currentPokemonIndex = 0;
            gameState.money = 300;
            gameState.items = { potion: 5, pokeball: 3 };
            saveGame();
            debug('✅ Создан стартовый покемон: ' + starter.name);
        } catch(e) {
            debug('❌ Ошибка создания покемона: ' + e.message);
            return;
        }
    } else {
        debug('✅ Покемон уже есть: ' + myParty[0].name);
    }

    // 6. Показываем интерфейс
    document.getElementById('loading').style.display = 'none';
    document.getElementById('battle-screen').style.display = 'block';
    document.getElementById('hp-bars').style.display = 'flex';
    document.getElementById('actions').style.display = 'grid';
    document.getElementById('info-panel').style.display = 'flex';

    // 7. Обновляем отображение
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
    // Возврат на карту
    document.getElementById("battle-screen").style.display = "none";
    document.getElementById("hp-bars").style.display = "none";
    document.getElementById("actions").style.display = "none";
    document.getElementById("info-panel").style.display = "none";
    if (window._canvas) window._canvas.style.display = "block";
    if (document.getElementById("controls")) document.getElementById("controls").style.display = "grid";
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

    debug('✅ Инициализация завершена');
    document.getElementById('loading').textContent = '✅ Игра полностью готова!';
});

// Прямая привязка обработчика клика с диагностикой
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('btn-fight');
    debug('🔘 Элемент btn-fight найден? ' + (btn !== null));
    if (btn) {
        btn.addEventListener('click', function(e) {
            debug('🖱️ Клик по Исследовать (через addEventListener)');
            if (inBattle) {
                debug('⚠️ Уже в бою');
                return;
            }
            try {
                const wild = generateWildPokemon();
                debug('✅ Дикий покемон создан: ' + wild.name);
                startBattle(wild);
                btn.textContent = '⚔️ Бой';
            } catch(err) {
                debug('❌ Ошибка: ' + err.message);
            }
        });
    }
});

// Принудительная привязка кнопки "Бой" к показу приёмов
document.addEventListener('DOMContentLoaded', function() {
    const btnFight = document.getElementById('btn-fight');
    if (btnFight) {
        btnFight.addEventListener('click', function(e) {
            if (inBattle) {
                onFight();
            }
        });
    }
});

// Проверка: существует ли кнопка btn-action?
document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('btn-action');
    if (btn) {
        alert('✅ Кнопка btn-action найдена в DOM!');
    } else {
        alert('❌ Кнопка btn-action НЕ найдена!');
    }
});



// Единственный обработчик кнопки "Исследовать"
document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('btn-action');
    if (btn) {
        btn.onclick = function() {
            alert('Кнопка нажата!');
            if (inBattle) {
                alert('Уже в бою');
                return;
            }
            var wild = generateWildPokemon();
            alert('Дикий покемон: ' + (wild ? wild.name : 'null'));
            if (wild) {
                var canvas = document.querySelector('canvas');
                if (canvas) canvas.style.display = 'none';
                document.getElementById('controls').style.display = 'none';
                document.getElementById('battle-screen').style.display = 'block';
                document.getElementById('hp-bars').style.display = 'flex';
                document.getElementById('actions').style.display = 'grid';
                document.getElementById('info-panel').style.display = 'flex';
                startBattle(wild);
                document.getElementById('btn-fight').textContent = '⚔️ Бой';
            }
        };
    }
});

// Единственный обработчик кнопки "Исследовать" с обработкой ошибок
document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('btn-action');
    if (btn) {
        btn.onclick = function() {
            alert('Кнопка нажата!');
            if (inBattle) {
                alert('Уже в бою');
                return;
            }
            try {
                var wild = generateWildPokemon();
                alert('Дикий покемон: ' + (wild ? wild.name : 'null'));
                if (wild) {
                    var canvas = document.querySelector('canvas');
                    if (canvas) canvas.style.display = 'none';
                    document.getElementById('controls').style.display = 'none';
                    document.getElementById('battle-screen').style.display = 'block';
                    document.getElementById('hp-bars').style.display = 'flex';
                    document.getElementById('actions').style.display = 'grid';
                    document.getElementById('info-panel').style.display = 'flex';
                    startBattle(wild);
                    document.getElementById('btn-fight').textContent = '⚔️ Бой';
                }
            } catch(e) {
                alert('Ошибка: ' + e.message);
            }
        };
    }
});
