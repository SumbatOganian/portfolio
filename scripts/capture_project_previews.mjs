#!/usr/bin/env node
/** Real screenshots only. Do not synthesize pictures or replace DOM with mockups. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const projects = JSON.parse(await fs.readFile(path.join(root, 'data', 'projects.json'),'utf8'));
const output = path.join(root,'public','project-previews');
await fs.mkdir(output,{recursive:true});
const browser = await chromium.launch({headless:true,channel:'chrome'});
let failures=0;
const report=[];
const captures=[
  {suffix:'desktop',width:1440,height:900,deviceScaleFactor:1.4,isMobile:false,hasTouch:false},
  {suffix:'mobile',width:390,height:844,deviceScaleFactor:1.5,isMobile:true,hasTouch:true}
];
try {
  for (const project of projects) {
    if (!/^https:\/\//i.test(project.url)) {console.error('INVALID URL',project.id);failures++;continue;}
    for (const mode of captures) {
      let ctx;
      try {
        ctx=await browser.newContext({viewport:{width:mode.width,height:mode.height},deviceScaleFactor:mode.deviceScaleFactor,isMobile:mode.isMobile,hasTouch:mode.hasTouch,locale:'ru-RU',reducedMotion:'reduce'});
        const page=await ctx.newPage();
        const response=await page.goto(project.url,{waitUntil:'domcontentloaded',timeout:45000});
        if (!response || response.status()>=400) throw Error(`HTTP status ${response?.status()}`);
        await page.evaluate(async()=>{await document.fonts.ready;});
        // Give images, hero loaders, and lazy content an opportunity to settle.
        await page.waitForLoadState('networkidle',{timeout:12000}).catch(()=>{});
        await page.waitForTimeout(1400);
        // Ensure captured page contains visible content, not a loading spinner or 404.
        const info=await page.evaluate(()=>({title:document.title,text:document.body.innerText.slice(0,1600),images:[...document.images].slice(0,20).map(im=>({src:im.currentSrc,loaded:im.complete&&im.naturalWidth>0}))}));
        if(info.text.trim().length<50) throw Error('Insufficient page text (possibly blank/blocked)');
        if(/access denied|site can't be reached|not found|403 forbidden|err_blocked_by_administrator/i.test(info.title+' '+info.text.slice(0,400))) throw Error('Browser error page instead of project');
        await page.screenshot({path:path.join(output,`${project.id}-${mode.suffix}.png`),fullPage:false,animations:'disabled'});
        report.push({project:project.id,mode:mode.suffix,url:project.url,status:response.status(),title:info.title,capturedAt:new Date().toISOString()});
        console.log('CAPTURED',project.id,mode.suffix,project.url,info.title,'images:',info.images.filter(x=>x.loaded).length+'/'+info.images.length);
      } catch(e){failures++;console.error('FAILED',project.id,mode.suffix,String(e.message||e));}
      finally {if(ctx) await ctx.close();}
    }
  }
} finally {await browser.close();await fs.writeFile(path.join(output,'capture-report.json'),JSON.stringify(report,null,2));}
if(failures){console.error(`Preview capture incomplete: ${failures} failures. Never replace missing shots with AI fake UI.`);process.exitCode=1;}
