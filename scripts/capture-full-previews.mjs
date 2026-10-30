import {chromium} from 'playwright';import fs from 'node:fs/promises';import sharp from 'sharp';
const projects=JSON.parse(await fs.readFile('data/projects.json','utf8'));await fs.mkdir('public/project-scrolls',{recursive:true});await fs.mkdir('qa/v4',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const selected=process.argv[2];let report=[];if(selected){try{report=JSON.parse(await fs.readFile('public/project-scrolls/manifest.json','utf8')).filter(x=>x.id!==selected)}catch{}}
try{for(const project of projects.filter(p=>!selected||p.id===selected)){const ctx=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:'reduce',locale:'ru-RU'});try{
 const page=await ctx.newPage();const response=await page.goto(project.url,{waitUntil:'domcontentloaded',timeout:45000});if(!response||response.status()>=400)throw Error(`HTTP ${response?.status()}`);await page.evaluate(()=>document.fonts.ready);await page.waitForLoadState('networkidle',{timeout:10000}).catch(()=>{});
 // Traverse the actual page to load lazy assets and trigger real entrance animations.
 let height=await page.evaluate(()=>document.documentElement.scrollHeight);for(let y=0;y<Math.min(height,24000);y+=720){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(170);height=await page.evaluate(()=>document.documentElement.scrollHeight)}
 await page.waitForTimeout(1000);await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(500);
 const info=await page.evaluate(()=>({title:document.title,height:document.documentElement.scrollHeight,text:document.body.innerText.length}));if(info.text<35)throw Error('Insufficient real content '+JSON.stringify(info));
 const file=`public/project-scrolls/${project.id}.png`;await page.screenshot({path:file,fullPage:true,animations:'disabled',timeout:60000});const meta=await sharp(file).metadata();await sharp(file).resize({width:1440,withoutEnlargement:true}).webp({quality:84}).toFile(`public/project-scrolls/${project.id}.webp`);
 report.push({id:project.id,url:project.url,status:response.status(),title:info.title,width:meta.width,height:meta.height,capturedAt:new Date().toISOString()});console.log('CAPTURED FULL',project.id,meta.width,meta.height);
 }catch(e){report.push({id:project.id,url:project.url,error:e.message});console.error('FAILED',project.id,e.message)}finally{await ctx.close()}}
}finally{await browser.close();await fs.writeFile('public/project-scrolls/manifest.json',JSON.stringify(report,null,2))}
if(report.some(p=>p.error))process.exitCode=1;
