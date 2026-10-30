import sharp from 'sharp';import fs from 'node:fs/promises';
for(const file of await fs.readdir('public/project-previews')){if(!file.endsWith('.png'))continue;await sharp(`public/project-previews/${file}`).resize({width:file.includes('mobile')?780:1440,withoutEnlargement:true}).webp({quality:86}).toFile(`public/project-previews/${file.replace('.png','.webp')}`)}
