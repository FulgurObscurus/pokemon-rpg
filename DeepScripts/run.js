const { exec } = require('child_process');

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
    console.log(`
Использование:
  node run.js start       - запустить сервер
  node run.js update      - обновить pokedex.js (полная перезагрузка)
  node run.js evolutions  - добавить эволюции в pokedex.js
  node run.js moves       - добавить реальные приёмы в pokedex.js
  node run.js help        - показать эту справку
    `);
    return;
}

if (command === 'start') {
    exec('node start-server.js', { stdio: 'inherit' });
} else if (command === 'update') {
    exec('node update-pokedex.js', { stdio: 'inherit' });
} else if (command === 'evolutions') {
    exec('node update-evolutions.js', { stdio: 'inherit' });
} else if (command === 'moves') {
    exec('node update-moves.js', { stdio: 'inherit' });
} else {
    console.log('Неизвестная команда. Используйте: start, update, evolutions, moves');
}
