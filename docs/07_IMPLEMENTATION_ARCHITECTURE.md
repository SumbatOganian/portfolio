# 07. Техническая архитектура

## Предпочтительный стек

- React + TypeScript, Vite для простого статического SPA, или Next.js (если мотивировано SEO/OG). Не создавать backend ради портфолио.
- `three`, `@react-three/fiber`, `@react-three/drei` для загрузки glTF/GLB и окружения.
- GSAP + ScrollTrigger (одна организованная timeline).
- CSS Modules / современный CSS; сложный 3D не смешивать с десятками хаотичных CSS-анимаций.
- Тесты: Playwright для кликов/скролла/screenshots, браузерные performance профили.

## Рекомендуемая структура нового приложения

```
src/
  app/
    App.tsx
    siteConfig.ts
  scene/
    SceneCanvas.tsx
    ChromeSculpture.tsx
    FloatingRocks.tsx
    SceneLighting.tsx
    sceneMotion.ts
  sections/
    HeroOverlay.tsx
    DesktopSpatialGallery.tsx
    MobileCardStack.tsx
    SkillsOrbit.tsx
    ContactBar.tsx
  components/
    ProjectCard.tsx
    SiteHeader.tsx
    AccessibleFallback.tsx
  data/
    projects.ts
    skills.ts
  styles/
    tokens.css
    globals.css
public/
  models/
  project-previews/
```

## Scene architecture

- `<Canvas>` на фоне/в глубине, DOM overlay спереди. Не создавать canvas на каждую карточку.
- Отдельный слой DOM карточек: изображения `<img>`, реальные `<a>` и клавиатурная навигация.
- Разница с «фейковым 3D»: GLB-скульптура действительно загружается и отражает окружение, реагирует на курсор, имеет 3D transforms. DOM карточки могут использовать 3D CSS/анимацию для доступности и производительности.
- 3D-камни глубинные и не блокируют указатель (`pointer-events: none` для декоративных слоёв).
- Состояние анимации едино: скролл → плавный прогресс 0…1 → сцена/DOM. Не вызывать React setState на каждом кадре WebGL.
- `ScrollTrigger` pinned stage: **не анимировать сам pinned container**, только вложенные слои; корректный cleanup (`gsap.context().revert()`), refresh при resize и ориентации.
- React strict mode: предотвратить создание двух ScrollTrigger или дублирование canvas listeners.
- Загрузку моделей через `useGLTF` с fallback + lazy. Если WebGL недоступен, показать постер из `assets/references/approved_hero.png` **только как запасной фон**, но проектные превью всё равно реальные и HTML.
- При SSR учесть client-only Canvas (для Next.js); избегать hydration mismatch.

## Почему это не «один огромный нарисованный скриншот»

Каждая ссылка, навигация, карточка и навык доступны в DOM, адаптированы и интерактивны. Реальная прокрутка может идти на длинном скрытом scroll-track, но пользователь видит одну stage-сцену. Включены natural scroll и режима reduced motion.

## Простая схема движения для программирования

Desktop master timeline:
`hero → heroExit → cardReveal(1..5) → galleryOrbit(1..5) → cardExit → skillsEnter → contactReveal`

Mobile master timeline:
`heroExit → cardStack(0→1→2→3→4) → skillsEnter → contacts`

Сохранять непрерывность состояния при любом scroll; `scrollTo` из навигации должен делать соответствующий progress, а не телепортировать CSS-части.
