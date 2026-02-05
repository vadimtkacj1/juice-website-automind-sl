# Scripts Directory

Коллекция утилит для управления и мониторинга базы данных Juice Website.

## Мониторинг и диагностика

### check-mysql-health.sh
Проверяет состояние подключений к MySQL и отправляет предупреждения.

**Использование:**
```bash
# Однократная проверка
./scripts/check-mysql-health.sh

# Автоматическая проверка каждые 5 минут (добавить в crontab)
*/5 * * * * cd /path/to/juice-website && ./scripts/check-mysql-health.sh >> logs/mysql-health.log 2>&1
```

**Выводит:**
- Текущее количество подключений
- Максимальное использованное количество
- Процент использования
- Статус: OK / WARNING / CRITICAL
- Активные процессы (при проблемах)

**Пороги:**
- WARNING: 100+ подключений
- CRITICAL: 150+ подключений

### check-db.js
Проверяет подключение к базе данных.

```bash
node scripts/check-db.js
```

### debug-server.sh
Отладочный скрипт для диагностики проблем на сервере.

```bash
./scripts/debug-server.sh
```

## Управление базой данных

### init-database.js
Инициализирует структуру базы данных.

```bash
node scripts/init-database.js
```

### reset-database.js
**⚠️ ОПАСНО**: Сбрасывает базу данных к начальному состоянию.

```bash
node scripts/reset-database.js
```

### migrate-locations.js
Миграция данных локаций.

```bash
node scripts/migrate-locations.js
```

## Управление пользователями

### create-admin.js
Создает администратора.

```bash
node scripts/create-admin.js
```

### reset-admin-password.js
Сбрасывает пароль администратора.

```bash
node scripts/reset-admin-password.js
```

## Наполнение данными

### reseed-menu.js
Перезаполняет меню демо-данными.

```bash
node scripts/reseed-menu.js
```

### seed-demo-data.js
Заполняет базу демо-данными.

```bash
node scripts/seed-demo-data.js
```

### seed-locations.js
Заполняет таблицу локаций.

```bash
node scripts/seed-locations.js
```

### seed-business-hours.js
Заполняет часы работы.

```bash
node scripts/seed-business-hours.js
```

### seed-contacts.js
Заполняет контактную информацию.

```bash
node scripts/seed-contacts.js
```

### seed-news.js
Заполняет новости.

```bash
node scripts/seed-news.js
```

## Утилиты для изображений

### optimize-existing-images.js
Оптимизирует существующие изображения.

```bash
node scripts/optimize-existing-images.js
```

## Telegram Bot

### check-telegram-service.js
Проверяет состояние Telegram сервиса.

```bash
node scripts/check-telegram-service.js
```

## Фиксы и миграции

### fix-menu-visibility.js
Исправляет видимость элементов меню.

```bash
node scripts/fix-menu-visibility.js
```

### fix-server-db.sh
Исправляет проблемы с базой данных на сервере.

```bash
./scripts/fix-server-db.sh
```

### fix-server-login.sh
Исправляет проблемы со входом на сервере.

```bash
./scripts/fix-server-login.sh
```

## Серверные скрипты (удаленный запуск)

### check-server-db.sh
Проверяет базу данных на удаленном сервере.

```bash
./scripts/check-server-db.sh
```

### init-db-server.sh
Инициализирует базу данных на сервере.

```bash
./scripts/init-db-server.sh
```

### init-db-manual.sh
Ручная инициализация базы данных.

```bash
./scripts/init-db-manual.sh
```

## SQL скрипты

### init-db.sh
Shell скрипт для инициализации БД.

```bash
./scripts/init-db.sh
```

### run-sql-init.js
Запускает SQL инициализацию.

```bash
node scripts/run-sql-init.js
```

## Лучшие практики

1. **Всегда делайте бэкап** перед запуском деструктивных скриптов
2. **Проверяйте права доступа** для shell скриптов: `chmod +x script.sh`
3. **Используйте правильные переменные окружения** из `.env`
4. **Тестируйте на dev** окружении перед продакшеном

## Автоматизация

Рекомендуемые задачи для crontab:

```bash
# Проверка здоровья MySQL каждые 5 минут
*/5 * * * * cd /path/to/juice-website && ./scripts/check-mysql-health.sh >> logs/mysql-health.log 2>&1

# Ежедневная проверка базы в 2:00 AM
0 2 * * * cd /path/to/juice-website && node scripts/check-db.js >> logs/daily-check.log 2>&1

# Telegram сервис проверка каждые 15 минут
*/15 * * * * cd /path/to/juice-website && node scripts/check-telegram-service.js >> logs/telegram-check.log 2>&1
```

## Troubleshooting

### Скрипт не запускается
```bash
# Проверить права
ls -la scripts/

# Дать права на выполнение
chmod +x scripts/*.sh
```

### Ошибка подключения к MySQL
```bash
# Проверить что MySQL запущен
docker-compose ps

# Проверить переменные окружения
cat .env | grep MYSQL

# Проверить логи MySQL
docker-compose logs mysql
```

### Node.js скрипт падает
```bash
# Установить зависимости
npm install

# Проверить версию Node
node --version

# Запустить с подробным выводом
NODE_DEBUG=* node scripts/your-script.js
```
