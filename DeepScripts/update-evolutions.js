const fs = require('fs');
const https = require('https');
const { PATHS } = require('./config.js');

// =======================================================================
// Вспомогательные функции
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

async function getEvolutionChain(chainUrl) {
    const chainData = await getJSON(chainUrl);
    const evolutions = [];

    let current = chainData.chain;
    while (current) {
        const speciesId = parseInt(current.species.url.split('/').slice(-2, -1)[0]);
        const details = current.evolution_details[0] || {};

        if (details.min_level) {
            evolutions.push({
                targetId: speciesId,
                method: 'level-up',
                minLevel: details.min_level
            });
        } else if (details.item) {
            evolutions.push({
                targetId: speciesId,
                method: 'item',
                item: details.item.name
            });
        } else if (details.held_item) {
            evolutions.push({
                targetId: speciesId,
                method: 'trade',
                held_item: details.held_item.name
            });
        } else if (details.gender) {
            evolutions.push({
                targetId: speciesId,
                method: 'gender',
                gender: details.gender
            });
        } else if (details.known_move) {
            evolutions.push({
                targetId: speciesId,
                method: 'move',
                move: details.known_move.name
            });
        } else if (details.trigger && details.trigger.name === 'use-item') {
            // Если используется предмет
            if (details.item) {
                evolutions.push({
                    targetId: speciesId,
                    method: 'item',
                    item: details.item.name
                });
            }
        } else if (details.trigger && details.trigger.name === 'trade') {
            evolutions.push({
                targetId: speciesId,
                method: 'trade'
            });
        } else if (details.trigger && details.trigger.name === 'level-up') {
            // Если есть другие условия уровня (например, с дружбой)
            if (details.min_level) {
                evolutions.push({
                    targetId: speciesId,
                    method: 'level-up',
                    minLevel: details.min_level
                });
            }
        }

        // Переходим к следующей эволюции
        if (current.evolves_to && current.evolves_to.length > 0) {
            current = current.evolves_to[0];
        } else {
            break;
        }
    }

    return evolutions;
}

async function updateEvolutions() {
    try {
        const pokedexPath = PATHS.GAME_DIR + '/' + PATHS.POKEDEX_FILE;
        console.log(`📂 Читаю файл: ${pokedexPath}`);
        const content = fs.readFileSync(pokedexPath, 'utf-8');
        // Извлекаем объект ALL_POKEMON_DATA
        const match = content.match(/const ALL_POKEMON_DATA = (.*?);/s);
        if (!match) {
            throw new Error('Не удалось найти ALL_POKEMON_DATA в файле');
        }
        const pokedex = JSON.parse(match[1]);
        const ids = Object.keys(pokedex);
        console.log(`📦 Всего покемонов: ${ids.length}`);

        let count = 0;
        for (const id of ids) {
            const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${id}`;
            try {
                const species = await getJSON(speciesUrl);
                if (species.evolution_chain) {
                    const evolutions = await getEvolutionChain(species.evolution_chain.url);
                    pokedex[id].evolutions = evolutions;
                }
                count++;
                if (count % 50 === 0) console.log(`⏳ Обработано ${count}/${ids.length}`);
            } catch(err) {
                console.warn(`❌ Ошибка для покемона #${id}: ${err.message}`);
            }
        }

        console.log(`✅ Эволюции добавлены для ${count} покемонов`);

        // Сохраняем обновлённый pokedex.js
        const newContent = `// =======================================================================\n` +
                          `// АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННЫЙ ФАЙЛ – НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ\n` +
                          `// =======================================================================\n` +
                          `const ALL_POKEMON_DATA = ${JSON.stringify(pokedex, null, 2)};\n`;
        fs.writeFileSync(pokedexPath, newContent);
        console.log(`📁 Файл ${pokedexPath} обновлён!`);
    } catch(err) {
        console.error('❌ Ошибка:', err.message);
        process.exit(1);
    }
}

updateEvolutions();
