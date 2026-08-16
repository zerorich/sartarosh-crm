# Деплой Sartarosh API на Railway

Инструкция для сервиса `server/` — общий backend для **client**, **crm** и **admin**.

> В репозитории **нет** `railway.toml`, `Dockerfile` или `Procfile`. Настройки сервиса задаются в панели Railway.

---

## 1. Настройка сервиса в Railway

| Параметр | Значение |
|----------|----------|
| **Root Directory** | `server` |
| **Build Command** | `npm install && npm run prisma:generate && npm run build` |
| **Start Command** | `npm start` |
| **Healthcheck** (опционально) | `GET /health` |

### Порт

Приложение слушает `process.env.PORT` (по умолчанию `4000` локально). Railway **автоматически** выставляет переменную `PORT` — **не переопределяйте её вручную**, если только Railway не требует иного.

---

## 2. Подключённые сервисы

Добавьте в проект Railway:

1. **PostgreSQL** — для `DATABASE_URL`
2. **Redis** — для `REDIS_URL`, OTP, rate-limit и фоновых задач (BullMQ)

Секреты (`JWT_*`, `OTP_SECRET`, `PAYMENT_SECRET`, `STORAGE_SECRET`) генерируйте через **Generate Secret** или `${{ secret() }}` в Railway — минимум **16 символов** (рекомендуется 32+).

---

## 3. Таблица переменных окружения

Полный список из `src/config/env.ts` и `.env.example`.

| Variable | Value for Railway | Notes |
|----------|-------------------|-------|
| `NODE_ENV` | `production` | **Обязательно** для prod. |
| `PORT` | *(не задавать)* | Railway подставляет автоматически. |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Ссылка на Postgres-сервис. Не копируйте URL вручную — используйте reference. |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` | **Используйте reference**, не вставляйте `redis.railway.internal` вручную. Railway подставит актуальный URL с паролем. |
| `JWT_SECRET` | `${{ secret() }}` | Случайная строка ≥16 символов. |
| `JWT_REFRESH_SECRET` | `${{ secret() }}` | Отдельный секрет от access-токена. |
| `OTP_SECRET` | `${{ secret() }}` | Для хеширования OTP-кодов. |
| `PAYMENT_SECRET` | `${{ secret() }}` | Для платёжной интеграции. |
| `ACCESS_TOKEN_TTL` | `15m` | **Длительность, не секрет.** Формат: `15m`, `1h`, `7d`. **Исправьте**, если сейчас стоит `${{ secret() }}`. |
| `REFRESH_TOKEN_TTL` | `30d` | **Длительность, не секрет.** **Заполните** — сейчас пусто. |
| `OTP_TTL_SECONDS` | `300` | Время жизни OTP в секундах (5 минут). |
| `OTP_MAX_ATTEMPTS` | `5` | Макс. попыток ввода OTP. |
| `CORS_ORIGIN` | см. ниже | URL фронтендов через запятую, **без** `/api` и без trailing slash. |
| `PUBLIC_URL` | `https://<ваш-railway-домен>` | Публичный URL **этого** API-сервиса (без `/api`). Для абсолютных ссылок `/uploads/*`. |
| `RESEND_API_KEY` | `re_...` | **Обязательно на Hobby.** Railway блокирует исходящий SMTP; OTP уходит через HTTPS [Resend](https://resend.com/api-keys). |
| `RESEND_FROM` | `Sartarosh <hello@yourdomain.com>` | Только **верифицированный** домен Resend. Пока домена нет — оставьте пустым (`onboarding@resend.dev`, письма только на email аккаунта Resend). |
| `GMAIL_USER` | `your@gmail.com` | Для **локальной** разработки, или если сервис на плане **Pro** (SMTP открыт). |
| `GMAIL_APP_PASSWORD` | *(App Password)* | [App Password](https://myaccount.google.com/apppasswords). На Hobby **не сработает**. |
| `SMTP_FROM` | `Sartarosh <your@gmail.com>` | Отправитель Gmail SMTP. Если пусто — используется `GMAIL_USER`. |
| `STORAGE_URL` | *(пусто)* | Опционально. Можно оставить пустым — загрузки идут в локальную папку `uploads/`. |
| `STORAGE_KEY` | *(пусто)* | Опционально. |
| `STORAGE_SECRET` | `${{ secret() }}` или *(пусто)* | Опционально. Можно оставить пустым, если внешнее хранилище не используется. |

---

## 4. Исправления по вашему текущему конфигу

| Проблема | Что сделать |
|----------|-------------|
| `ACCESS_TOKEN_TTL = ${{ secret() }}` | Заменить на **`15m`** — это TTL, не секрет. |
| `REFRESH_TOKEN_TTL` пусто | Задать **`30d`**. |
| `NODE_ENV` не задан | Задать **`production`**. |
| `REDIS_URL` вручную из Redis-сервиса | Заменить на **`${{Redis.REDIS_URL}}`** в Variables API-сервиса. |
| `CORS_ORIGIN`, `PUBLIC_URL` пусты | Заполнить после получения доменов (см. ниже). |

---

## 5. REDIS — reference, не copy-paste

В Variables **API-сервиса** (не Redis-сервиса):

```
REDIS_URL = ${{Redis.REDIS_URL}}
```

**Почему не копировать** `redis://default:PASSWORD@redis.railway.internal:6379`:

- При пересоздании Redis пароль меняется — reference обновится автоматически.
- Internal hostname работает только внутри Railway-сети; reference всегда актуален.
- Ручной paste пароля в чат/скриншоты — риск утечки. **Рекомендуется ротация пароля Redis** в Railway, если пароль уже светился.

То же правило для Postgres: `${{Postgres.DATABASE_URL}}`.

---

## 6. CORS_ORIGIN — URL фронтендов

`CORS_ORIGIN` — список origin'ов через **запятую**. Каждый origin = схема + домен + порт (если не 443/80), **без** пути и **без** `/api`.

Фронтенды в монорепо (деploy обычно на Vercel):

| Приложение | Папка | Локальный порт | Env на фронте |
|------------|-------|----------------|---------------|
| Client | `client/` | 3000 | `NEXT_PUBLIC_API_URL` |
| CRM (barber) | `crm/` | 3000 | `NEXT_PUBLIC_API_URL` |
| Admin | `admin/` | 3001 | `NEXT_PUBLIC_API_URL` |

**Пример** (подставьте свои домены после деплоя фронтов):

```
CORS_ORIGIN=https://sartarosh-client.vercel.app,https://sartarosh-crm.vercel.app,https://sartarosh-admin.vercel.app
```

Если есть custom domain:

```
CORS_ORIGIN=https://app.example.com,https://crm.example.com,https://admin.example.com
```

На каждом фронте задайте:

```
NEXT_PUBLIC_API_URL=https://<ваш-railway-домен>/api
```

---

## 7. PUBLIC_URL

Публичный домен **самого API** из Railway → Settings → Networking → Generate Domain:

```
PUBLIC_URL=https://sartarosh-api-production.up.railway.app
```

- **Без** `/api` на конце.
- **С** `https://`.
- Используется для построения абсолютных URL загрузок (`/uploads/...`).

Проверка после деплоя:

```bash
curl https://<ваш-домен>/health
# {"success":true,"data":{"status":"ok"}}
```

---

## 8. OTP / почта на Railway

На **Hobby** исходящий SMTP (`gmail:587/465`) **заблокирован**. Gmail App Password на проде не использовать.

1. Заведите бесплатный ключ на [resend.com/api-keys](https://resend.com/api-keys).
2. В Variables API-сервиса задайте `RESEND_API_KEY=re_...`.
3. Чтобы слать OTP **любым** клиентам — подтвердите свой домен в Resend и задайте `RESEND_FROM=Sartarosh <hello@yourdomain.com>`.
4. Пока домена нет, Resend шлёт только на email аккаунта Resend (удобно для проверки логина).

Локально по-прежнему работает `GMAIL_*`. SMTP Gmail на Railway появится только на плане **Pro**.

---

## 9. STORAGE_* (можно оставить пустым)

`STORAGE_URL`, `STORAGE_KEY`, `STORAGE_SECRET` — для внешнего object storage (S3-совместимое). Если не используете — оставьте пустыми; файлы сохраняются в `uploads/` на диске контейнера (эфемерно при redeploy).

---

## 10. Шаги после деплоя

### 10.1. Миграции БД (обязательно)

Один раз после первого успешного деплоя (Railway CLI или одноразовая Job):

```bash
railway run --service <api-service-name> npm run prisma:deploy
```

Или локально с `DATABASE_URL` из Railway:

```bash
cd server
DATABASE_URL="..." npm run prisma:deploy
```

`prisma migrate deploy` применяет все миграции из `prisma/migrations/` без интерактива.

### 10.2. Seed (опционально)

Только для dev/staging — **не** для production с реальными пользователями:

```bash
railway run --service <api-service-name> npm run prisma:seed
```

Seed создаёт тестовых пользователей `@sartarosh.test`.

### 10.3. Worker (опционально, для фоновых задач)

API запускает repeatable jobs при старте, но для надёжной обработки очередей BullMQ можно добавить **второй Railway-сервис** с тем же root `server` и переменными:

| Start Command |
|---------------|
| `npm run worker` |

Те же `DATABASE_URL`, `REDIS_URL` и секреты.

### 10.4. Чеклист

- [ ] `/health` отвечает 200
- [ ] `prisma migrate deploy` выполнен
- [ ] OTP-письмо приходит на реальный email
- [ ] Фронты открываются без CORS-ошибок
- [ ] `NEXT_PUBLIC_API_URL` на фронтах указывает на Railway API

---

## 11. Безопасность

- Не коммитьте `.env` — только `.env.example`.
- Секреты только через Railway Variables / `${{ secret() }}`.
- Если пароль Redis или JWT попали в скриншот/чат — **ротируйте** в Railway (Regenerate / новый secret).
