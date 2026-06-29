#!/bin/bash

GAME_DIR="/storage/emulated/0/Моя RPG"
TMP_DIR="/storage/emulated/0/DeepScripts/tmp"

mkdir -p "$TMP_DIR"

# Ссылка на Gofile (я буду менять её при каждом обновлении)
GOFILE_URL="https://api.gofile.io/servers"

# Получаем сервер для загрузки
SERVER=$(curl -s $GOFILE_URL | jq -r '.data.servers[0].name')
if [ -z "$SERVER" ]; then
    echo "❌ Не удалось получить сервер"
    exit 1
fi

# Ссылка на файл (я буду давать новую ссылку)
FILE_URL="https://$SERVER.gofile.io/download/ВАШ_ИДЕНТИФИКАТОР/update.zip"

echo "⏳ Скачиваю обновление..."
curl -L -o "$TMP_DIR/update.zip" "$FILE_URL"

if [ $? -ne 0 ]; then
    echo "❌ Ошибка скачивания"
    exit 1
fi

echo "⏳ Распаковываю в $GAME_DIR..."
unzip -o "$TMP_DIR/update.zip" -d "$GAME_DIR"

if [ $? -ne 0 ]; then
    echo "❌ Ошибка распаковки"
    exit 1
fi

rm -rf "$TMP_DIR"
echo "✅ Обновление завершено!"
