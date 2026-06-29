#!/bin/bash

GAME_DIR="/storage/emulated/0/Моя RPG"
TMP_DIR="/storage/emulated/0/DeepScripts/tmp"
FILE_ID="$1"

if [ -z "$FILE_ID" ]; then
    echo "❌ Укажите ID файла на Gofile"
    echo "   Пример: ./auto-update.sh abc123"
    exit 1
fi

mkdir -p "$TMP_DIR"

# Получаем ссылку для скачивания через API Gofile
echo "⏳ Получаю ссылку для файла $FILE_ID..."
API_RESPONSE=$(curl -s "https://api.gofile.io/contents/$FILE_ID")
DOWNLOAD_URL=$(echo "$API_RESPONSE" | jq -r '.data.downloadPage')

if [ -z "$DOWNLOAD_URL" ] || [ "$DOWNLOAD_URL" = "null" ]; then
    echo "❌ Файл не найден или недоступен"
    exit 1
fi

# Скачиваем архив
echo "⏳ Скачиваю архив..."
curl -L -o "$TMP_DIR/update.zip" "$DOWNLOAD_URL"

if [ $? -ne 0 ]; then
    echo "❌ Ошибка скачивания"
    exit 1
fi

# Распаковываем
echo "⏳ Распаковываю в $GAME_DIR..."
unzip -o "$TMP_DIR/update.zip" -d "$GAME_DIR"

if [ $? -ne 0 ]; then
    echo "❌ Ошибка распаковки"
    exit 1
fi

rm -rf "$TMP_DIR"
echo "✅ Обновление завершено!"
echo "🔄 Перезапустите сервер: node run.js start"
