const fs = require('fs');
const https = require('https');

// =======================================================================
// 1. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ HTTP-ЗАПРОСОВ
// =======================================================================
function getJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch(e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function getText(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

// =======================================================================
// 2. ЗАГРУЗКА ВСЕХ ПОКЕМОНОВ (1025)
// =======================================================================
async function loadAllPokemon() {
    console.log('⏳ Загрузка списка покемонов...');
    const list = await getJSON('https://pokeapi.co/api/v2/pokemon?limit=1025');
    const results = list.results;
    const total = results.length;
    console.log(`📦 Всего найдено: ${total} покемонов`);

    const pokedex = {};
    let count = 0;

    for (const item of results) {
        const id = parseInt(item.url.split('/').slice(-2, -1)[0]);
        const pokemonData = await getJSON(item.url);
        const speciesData = await getJSON(pokemonData.species.url);

        // Русское имя
        const ruNameEntry = speciesData.names.find(n => n.language.name === 'ru');
        const nameRu = ruNameEntry ? ruNameEntry.name : pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);

        // Типы
        const types = pokemonData.types.map(t => t.type.name);

        // Характеристики
        const stats = {
            hp: pokemonData.stats[0].base_stat,
            attack: pokemonData.stats[1].base_stat,
            defense: pokemonData.stats[2].base_stat,
            spAttack: pokemonData.stats[3].base_stat,
            spDefense: pokemonData.stats[4].base_stat,
            speed: pokemonData.stats[5].base_stat
        };

        // Способности (берём все, но можно ограничить)
        const abilities = pokemonData.abilities.map(a => a.ability.name);

        // Приёмы (берём первые 4, которые изучаются по уровню)
        const moves = pokemonData.moves
            .filter(m => m.version_group_details.some(v => v.move_learn_method.name === 'level-up'))
            .slice(0, 4)
            .map(m => {
                const moveName = m.move.name;
                // Базовая заглушка – в реальной игре нужно будет парсить приёмы отдельно
                return {
                    name: moveName,
                    type: 'normal',
                    power: 40,
                    accuracy: 100,
                    category: 'physical',
                    max_pp: 35,
                    learnLevel: 1
                };
            });

        // Эволюции – опускаем для простоты, но можно добавить позже

        pokedex[id] = {
            name: { ru: nameRu },
            types: types,
            stats: stats,
            abilities: abilities,
            moves: moves,
            evolutions: [] // можно заполнить, но пока пусто
        };

        count++;
        if (count % 50 === 0) console.log(`⏳ Загружено ${count}/${total}`);
    }

    console.log(`✅ Загружено ${count} покемонов`);
    return pokedex;
}

// =======================================================================
// 3. СОХРАНЕНИЕ В ФАЙЛ pokedex.js
// =======================================================================
async function savePokedex() {
    try {
        const data = await loadAllPokemon();
        const content = `// =======================================================================\n` +
                        `// АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННЫЙ ФАЙЛ – НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ\n` +
                        `// =======================================================================\n` +
                        `const ALL_POKEMON_DATA = ${JSON.stringify(data, null, 2)};\n`;
        fs.writeFileSync('pokedex.js', content);
        console.log('📁 Файл pokedex.js успешно создан!');
    } catch(err) {
        console.error('❌ Ошибка при создании pokedex.js:', err.message);
        process.exit(1);
    }
}

// =======================================================================
// 4. ЗАПУСК ЛОКАЛЬНОГО СЕРВЕРА
// =======================================================================
function startServer() {
    const http = require('http');
    const path = require('path');
    const server = http.createServer((req, res) => {
        let filePath = req.url === '/' ? '/index.html' : req.url;
        filePath = path.join(__dirname, filePath);
        const ext = path.extname(filePath);
        const contentType = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json'
        }[ext] || 'text/plain';

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });

    const PORT = 8080;
    server.listen(PORT, () => {
        console.log(`🌐 Сервер запущен на http://localhost:${PORT}`);
        console.log('🔄 Откройте этот адрес в браузере на телефоне или ПК');
    });
}

// =======================================================================
// 5. ГЛАВНАЯ ФУНКЦИЯ
// =======================================================================
(async function main() {
    console.log('🚀 Запуск setup.js');
    // Проверим, есть ли уже pokedex.js
    if (fs.existsSync('pokedex.js')) {
        console.log('⚠️ Файл pokedex.js уже существует. Перезаписать? (y/n)');
        // В Node.js в интерактивном режиме мы не можем ждать ввода, поэтому просто перезапишем без спроса.
        // Можно сделать параметр командной строки --force
        console.log('🔄 Перезаписываю pokedex.js');
    }
    await savePokedex();
    console.log('✅ Готово! Запускаю сервер...');
    startServer();
})();