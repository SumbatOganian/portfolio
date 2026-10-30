import sharp from 'sharp';import fs from 'node:fs/promises';
const files=(await fs.readdir('public/project-previews')).filter(f=>f.endsWith('.webp'));
const items=await Promise.all(files.map(async(f,i)=>({input:await sharp(`public/project-previews/${f}`).resize(300,230,{fit:'contain',background:'#23272e'}).toBuffer(),left:i%5*300,top:Math.floor(i/5)*230})));
await sharp({create:{width:1500,height:460,channels:3,background:'#23272e'}}).composite(items).png().toFile('qa/project-previews-sheet.png');
