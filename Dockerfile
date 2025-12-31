# Dockerfile для Next.js приложения

# Используем официальный образ Node.js для сборки
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем оставшийся код приложения
COPY . .

# Собираем приложение Next.js
RUN npm run build

# Используем меньший образ для продакшена
FROM node:18-alpine AS runner

WORKDIR /app

# Копируем только необходимые файлы из этапа сборки
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/components ./components
COPY --from=builder /app/app ./app
COPY --from=builder /app/services ./services
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/juice_website.db ./juice_website.db
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/postcss.config.js ./postcss.config.js
COPY --from=builder /app/tailwind.config.js ./tailwind.config.js
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/next-env.d.ts ./next-env.d.ts


# Открываем порт, на котором будет работать Next.js
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]
