# Источники и лицензии реализации

- Manrope через @fontsource/manrope — SIL Open Font License 1.1. Шрифты локальные; файл лицензии: node_modules/@fontsource/manrope/LICENSE.
- Simple Icons — CC0 1.0, https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md. Иконки используются как обозначения соответствующих технологий; торговые марки остаются у правообладателей.
- Three.js — MIT; React — MIT; Vite — MIT.
- GSAP — Standard License, https://gsap.com/standard-license/ ; лицензия поставляется с npm-пакетом.
- Новые GLB в public/models созданы процедурно скриптом scripts/generate-sculpture.mjs для этого проекта. Сторонние модели не использованы; HDRI для v2 указан ниже.
- Изображения проектов — реальный захват публичных сайтов из data/projects.json, указанных пользователем как свои. PNG — мастер, WebP — оптимизированная копия без изменения интерфейса.

Обновление v2: Cormorant Garamond через @fontsource/cormorant-garamond — SIL OFL 1.1. Текстура basalt-source.png сгенерирована встроенным ImageGen специально для этого проекта; промпт и производные файлы перечислены в ART_DIRECTION_V2.md.

HDRI v2: Studio Small 09, Sergej Majboroda / Poly Haven, CC0. Источник: https://polyhaven.com/a/studio_small_09 . Локальная копия 1K: public/environment/studio_small_09_1k.hdr, внешних запросов во время просмотра сайта нет.

Версия 4: Roboto Flex Variable — Copyright 2017 The Roboto Flex Project Authors, SIL Open Font License 1.1; источник пакета @fontsource-variable/roboto-flex, лицензия node_modules/@fontsource-variable/roboto-flex/LICENSE. Предыдущие шрифты остаются в архивных зависимостях, но не загружаются интерфейсом v4.
