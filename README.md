# Маркет — доска объявлений

Frontend на React + TypeScript + Vite. Иконки — SVG через `lucide-react`. Сборка Vite использует `@vitejs/plugin-react-swc`; Babel не используется.

## Локальный запуск

Требуется Node.js 20+.

```bash
npm install
npm run dev
```

Проверка типов и production-сборка:

```bash
npm run build
npm run preview
```

## Backend API

- `GET https://inai-col1.fishrungames.com/ads` — загрузить объявления.
- `POST https://inai-col1.fishrungames.com/ads` — создать объявление.

Для POST используется `FormData` с полями `title`, `description`, `price` и необязательным `image`. Не задавайте `Content-Type` вручную: браузер добавляет multipart boundary сам.

Фотографии из относительного `image_url` запрашиваются с того же домена, что и API.

Если браузер сообщает об ошибке CORS, серверу API необходимо разрешить запросы с опубликованного домена GitHub Pages. GitHub Pages не является backend и не может исправить CORS на стороне API.

## Публикация на GitHub Pages через Actions

1. Создайте GitHub-репозиторий и загрузите все файлы проекта в ветку `main`.
2. Откройте **Settings → Pages**.
3. В разделе **Build and deployment** выберите **Source: GitHub Actions**.
4. Откройте вкладку **Actions** и дождитесь завершения workflow **Build and deploy to GitHub Pages**.
5. После успешного выполнения адрес сайта появится в **Settings → Pages** или в результате workflow.

Workflow собирает проект из `main` и публикует артефакт `dist`. Ветка `gh-pages` не используется.

## Проверка после публикации

- Откройте адрес Pages из настроек репозитория.
- Убедитесь, что список загружается.
- Проверьте поиск и создание объявления.
- Если GET/POST не работают, откройте DevTools → Network/Console и проверьте ответ API и CORS.
