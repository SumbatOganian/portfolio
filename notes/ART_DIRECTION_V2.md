# Новое направление — 30 октября 2026

Пользователь попросил приблизить Hero к приложенному референсу: более сложный хром, фактурный базальт, контрастное освещение, крупный каменный передний план и тонкие заголовки с засечками. Карточки теперь — тёмное стекло, название и стрелка. Это явное новое указание отменяет прежнее требование отображать скриншоты в карточках. Ссылки и механика галереи / мобильного стека сохраняются.

## Изменения

- Новые GLB: три переплетённые сужающиеся и скрученные хромированные ленты, центральная сфера; два тонких пространственных контура.
- Базальтовые фрагменты с многомасштабной деформацией, крупный асимметричный передний план, мелкие осколки по глубине.
- Карта цвета и высоты камня, локальный студийный свет и фотографическое HDRI-окружение Studio Small 09 (Poly Haven, CC0), мягкий ограниченный световой шлейф.
- Cormorant Garamond (SIL OFL), локальный шрифт с кириллицей.
- Стеклянные карточки без изображений и индексов. PNG / WebP старых захватов сохранены как исходные материалы.

## Сгенерированный ассет

Использован встроенный ImageGen, без CLI / API-ключа. Мастер: `public/textures/basalt-source.png`; веб-текстура: `public/textures/basalt-albedo.webp`; карта высоты: `public/textures/basalt-height.png`. Изображение используется только как материал 3D-камней.

Полный промпт:

> Use case: photorealistic-natural. Asset type: seamless square PBR base-color texture for a real-time 3D basalt rock material. Extreme close macro scan of fractured dark charcoal basalt and black slate, sharp irregular angular mineral fissures and tiny broken shards, subtle silver-grey quartz grain, nonmetallic. Entire image is only rock surface, no objects, no silhouette, no background. Orthographic flat texture map with even diffuse neutral lighting and no directional shadows or highlights, edge-to-edge seamlessly tileable mineral detail. Mostly very dark graphite grey with fine slightly lighter fracture edges. Natural geological surface, NOT smooth blobs, NOT polygon facets, NOT lava, no glowing cracks, no text or labels. High resolution, square 2048x2048.

Результат генерации квадратный 1254 px; для веба подготовлена копия 1024 px. HDRI сохранено локально: `public/environment/studio_small_09_1k.hdr`; источник https://polyhaven.com/a/studio_small_09 . Геометрия и отражения остаются реальным 3D; весь интерфейс — HTML.
