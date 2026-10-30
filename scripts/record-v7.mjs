import {chromium} from 'playwright';
import fs from 'node:fs/promises';
await fs.mkdir('qa/v7/videos',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:'qa/v7/videos',size:{width,height}}});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4173');await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>scrollTo(0,document.querySelector('#person').offsetTop));await page.waitForTimeout(1400);
  await page.evaluate(()=>new Promise(resolve=>{const el=document.querySelector('#person'),start=performance.now();function draw(now){const p=Math.min(1,(now-start)/11500);scrollTo(0,el.offsetTop+(el.offsetHeight-innerHeight)*(.82*p));if(p<1)requestAnimationFrame(draw);else resolve()}requestAnimationFrame(draw)}));
  await page.waitForTimeout(1800);
  await page.evaluate(()=>new Promise(resolve=>{const from=scrollY,to=document.querySelector('#contact').offsetTop,start=performance.now();function draw(now){const p=Math.min(1,(now-start)/1800);scrollTo(0,from+(to-from)*p);if(p<1)requestAnimationFrame(draw);else resolve()}requestAnimationFrame(draw)}));
  await page.waitForTimeout(1600);const video=page.video();await context.close();await video.saveAs(`qa/v7/${name}-portrait-motion.webm`);await video.delete();
  console.log(`${name}: qa/v7/${name}-portrait-motion.webm`);
 }
}finally{await browser.close()}
