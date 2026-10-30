# Sumbat Oganian — Portfolio

Личный сайт-портфолио веб-разработчика: реальные проекты, навыки и рассказ обо мне.

**Сайт:** https://sumbatoganian.github.io/portfolio/

## Разработка

```sh
npm ci
npm run dev
```

Локальный адрес: http://127.0.0.1:5173/

## Сборка

```sh
npm run build
npm run preview
```

Production preview: http://127.0.0.1:4173/portfolio/

React + TypeScript + Vite, Three.js, GSAP. Статический сайт, серверная часть не требуется. Пути публичных ресурсов учитывают base `/portfolio/`. Контент редактируется в `data/`, интерфейс — в `src/`, фотографии, превью и 3D-ассеты — в `public/`.

## Публикация

GitHub Pages бесплатно публикует `dist/`. Workflow `.github/workflows/deploy.yml` устанавливает зависимости, собирает сайт и обновляет его при каждом push в `main`.

## Проверки и доступность

Предусмотрены reduced motion, отключение анимации, статический fallback без WebGL, клавиатурная навигация. Скрипты браузерных проверок находятся в `scripts/`; для них нужны Playwright и установленный Chrome. Кадры и видео локальных проверок в репозиторий не включены.

Лицензии сторонних шрифтов и ассетов: [notes/THIRD_PARTY_LICENSES.md](notes/THIRD_PARTY_LICENSES.md).
