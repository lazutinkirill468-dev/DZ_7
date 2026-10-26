# Board Ads

Простой React проект для доски объявлений.

## Запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

## GitHub Pages

Пушим в main и включаем GitHub Actions в настройках репозитория:

Settings -> Pages -> Source: GitHub Actions

Workflow уже есть в `.github/workflows/deploy.yml`.

## API

Сайт работает с API:

- GET https://inai-col1.fishrungames.com/ads
- POST https://inai-col1.fishrungames.com/ads

Для создания объявления отправляется FormData с title, description, price и опционально image.

Если что-то не работает, смотрим в консоль и Network в браузере. Скорее всего проблема с CORS.
