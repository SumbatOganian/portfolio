#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const projects=JSON.parse(await fs.readFile(path.join(root,'data/projects.json'),'utf8'));
let errors=0;
for (const p of projects){
  for(const type of ['desktop','mobile']){
    const file=path.join(root,'public','project-previews',`${p.id}-${type}.png`);
    try{
      const bytes=await fs.readFile(file);
      if(bytes.length<18000 || bytes.toString('hex',0,8)!=='89504e470d0a1a0a')throw Error('missing PNG signature or suspiciously tiny screenshot');
      const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
      if(width<350 || height<500)throw Error('unexpected dimensions '+width+'x'+height);
      console.log('OK',path.relative(root,file),width,height,bytes.length);
    }catch(e){console.error('FAIL',path.relative(root,file),e.message);errors++;}
  }
}
if(errors){console.error(`${errors} screenshots missing/invalid; do not claim preview completion.`);process.exitCode=1;}
