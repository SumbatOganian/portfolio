# PROMPTS — 3D generator (Tripo / Meshy / any text-to-3D platform)

## Main sculpture — EN

> Create a **single standalone watertight 3D sculptural object**, designed for a luxury creative-developer portfolio hero. An abstract intertwined structure of three continuous flowing **polished cold-silver chrome ribbons** with elegant asymmetric loops and a large central negative space. Fluid, parametric, museum-quality shape, smooth elongated curves, refined industrial design, dynamic silhouette, substantial but slender ribbon cross-section, no thin fragile wires. Reflective chrome PBR material: metallic 1.0, roughness 0.12, subtle blue-gray reflections, neutral base. Balanced from front three-quarter camera angle, readable silhouette. Isolated object centered at origin, no ground, no environment, **no rocks**, no text, no typography, no logo, no person, no animation. Export **clean optimized GLB mesh** with proper normals and named objects, separate PBR material, suitable for WebGL/Three.js, low-to-medium polygon count. Avoid self-intersecting broken surfaces and fused holes. This must feel like a collectible contemporary kinetic metal sculpture, not a default torus knot.

## Main sculpture — RU

> Создай один самостоятельный качественный 3D-объект: абстрактная скульптура из трёх непрерывных переплетённых **холодных серебристо-хромированных лент**, красивые асимметричные петли с выразительным пустым центром, современная музейная инсталляция. Плавные широкие металлические ленты, естественный объём, без тонких проводов и острых концов. Материал PBR: metallic 1, roughness ~0.12, с холодными голубовато-серыми отражениями. Композиция убедительна в ракурсе 3/4. Отдельная геометрия в центре координат, **без камней, без пола, без фона, без текста, без логотипов, без людей**. Экспорт оптимизированного `.glb` с чистыми нормалями для Three.js. Не генерируй обычный тор или запутанный сломанный меш.

## Rocks — EN

> Generate a small reusable 3D asset set of **9 irregular dark graphite/obsidian stone fragments** suitable for an abstract black editorial portfolio hero, dramatically chipped/angular silhouettes, slightly matte rough surface, low specular response, almost black with neutral cool edge highlights. Sizes varied from large foreground slab to small background pebbles. Each rock is a separate named mesh with independent transform, no glowing lava, no asteroid fire, no floating dust baked in, no environment, no background. PBR GLB, optimized geometry and material. Dark stone, **not metallic chrome**.

## Negative prompt

> no planets, no space ships, no fantasy game HUD, no starscape, no gold, no neon gradients, no crystalline rainbow, no over-detailed greebles, no ringed planet, no characters, no typography, no watermark, no camera baked into model, no fake image card surfaces.

## Visual rating rubric

1. Readable silhouette & negative space (40%).
2. Chrome material under proper environment lighting (25%).
3. Smooth valid GLB geometry (20%).
4. Polygon/material budgets/mobile usability (15%).

Если результат получает < 7/10 по любому критерию, лучше исправить в Blender, чем пускать сомнительный ассет в production.
