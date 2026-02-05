#!/bin/bash

# MySQL Health Check Script
# Проверяет состояние подключений к MySQL и отправляет предупреждения

# Конфигурация
THRESHOLD_WARNING=100
THRESHOLD_CRITICAL=150
MAX_CONNECTIONS=200

# Цвета для вывода
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Загрузить переменные окружения из .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Функция для получения количества подключений
get_connections() {
    if command -v docker &> /dev/null && docker ps | grep -q juice-website-mysql; then
        # Docker
        docker exec juice-website-mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" -N -e "SHOW STATUS LIKE 'Threads_connected';" 2>/dev/null | awk '{print $2}'
    else
        # Локальный MySQL
        mysql -u root -p"$MYSQL_ROOT_PASSWORD" -N -e "SHOW STATUS LIKE 'Threads_connected';" 2>/dev/null | awk '{print $2}'
    fi
}

# Функция для получения максимального использования
get_max_used() {
    if command -v docker &> /dev/null && docker ps | grep -q juice-website-mysql; then
        docker exec juice-website-mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" -N -e "SHOW STATUS LIKE 'Max_used_connections';" 2>/dev/null | awk '{print $2}'
    else
        mysql -u root -p"$MYSQL_ROOT_PASSWORD" -N -e "SHOW STATUS LIKE 'Max_used_connections';" 2>/dev/null | awk '{print $2}'
    fi
}

# Функция для получения конфигурации max_connections
get_max_connections_config() {
    if command -v docker &> /dev/null && docker ps | grep -q juice-website-mysql; then
        docker exec juice-website-mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" -N -e "SHOW VARIABLES LIKE 'max_connections';" 2>/dev/null | awk '{print $2}'
    else
        mysql -u root -p"$MYSQL_ROOT_PASSWORD" -N -e "SHOW VARIABLES LIKE 'max_connections';" 2>/dev/null | awk '{print $2}'
    fi
}

# Основная проверка
echo "=== MySQL Health Check ==="
echo "Date: $(date)"
echo ""

CURRENT=$(get_connections)
MAX_USED=$(get_max_used)
MAX_CONFIG=$(get_max_connections_config)

if [ -z "$CURRENT" ]; then
    echo -e "${RED}❌ ERROR: Cannot connect to MySQL${NC}"
    exit 1
fi

echo "Current connections: $CURRENT"
echo "Max used connections: $MAX_USED"
echo "Max connections configured: $MAX_CONFIG"
echo ""

# Расчет процента использования
PERCENT=$((CURRENT * 100 / MAX_CONFIG))

# Определение статуса
if [ "$CURRENT" -ge "$THRESHOLD_CRITICAL" ]; then
    echo -e "${RED}🚨 CRITICAL: $CURRENT connections (${PERCENT}% of ${MAX_CONFIG})${NC}"
    STATUS="CRITICAL"
elif [ "$CURRENT" -ge "$THRESHOLD_WARNING" ]; then
    echo -e "${YELLOW}⚠️  WARNING: $CURRENT connections (${PERCENT}% of ${MAX_CONFIG})${NC}"
    STATUS="WARNING"
else
    echo -e "${GREEN}✅ OK: $CURRENT connections (${PERCENT}% of ${MAX_CONFIG})${NC}"
    STATUS="OK"
fi

# Показать активные процессы если есть проблемы
if [ "$STATUS" != "OK" ]; then
    echo ""
    echo "=== Active Processes ==="
    if command -v docker &> /dev/null && docker ps | grep -q juice-website-mysql; then
        docker exec juice-website-mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "SHOW PROCESSLIST;" 2>/dev/null | head -n 20
    else
        mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "SHOW PROCESSLIST;" 2>/dev/null | head -n 20
    fi
fi

# Опционально: отправить уведомление в Telegram (если настроен)
if [ "$STATUS" = "CRITICAL" ] && [ ! -z "$TELEGRAM_BOT_TOKEN" ] && [ ! -z "$TELEGRAM_CHAT_ID" ]; then
    MESSAGE="🚨 CRITICAL: MySQL connections: $CURRENT/$MAX_CONFIG (${PERCENT}%)"
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d chat_id="${TELEGRAM_CHAT_ID}" \
        -d text="${MESSAGE}" > /dev/null
fi

echo ""
echo "=== Recommendations ==="
if [ "$PERCENT" -gt 75 ]; then
    echo "- Consider increasing MYSQL_CONNECTION_LIMIT in .env"
    echo "- Check for slow queries: docker-compose logs nextjs-app | grep 'slow'"
    echo "- Review application logs for connection leaks"
fi

exit 0
