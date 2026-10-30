import {chromium,webkit,devices} from 'playwright';
import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const base=process.env.QA_BASE_URL||'http://127.0.0.1:5173';await fs.mkdir('qa/v14/videos',{recursive:true});const results=[],errors=[];
async function at(page,p,extra=0){await page.evaluate(({p,extra})=>{const el=document.querySelector('.scroll-track');scrollTo(0,el.offsetTop+(el.offsetHeight-innerHeight)*p+extra)},{p,extra});await page.waitForFunction(p=>Math.abs(+document.querySelector('.stage').dataset.progress-p)<.002,p);await page.waitForTimeout(450)}
async function positions(page){return page.locator('.skill').evaluateAll(els=>els.map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y,translate:getComputedStyle(el).translate,rotate:getComputedStyle(el).rotate})))}
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  const ctx=await browser.newContext({viewport:{width,height},recordVideo:{dir:'qa/v14/videos',size:{width,height}}}),page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(600);
  if(name==='mobile')await page.locator('.menu-toggle').click();
  const link=page.locator('.navigation a[href="#projects"]'),box=await link.boundingBox();
  await link.hover();const timing=await link.locator('.nav-shuffle-char').evaluateAll(els=>els.flatMap(el=>el.getAnimations().map(a=>a.effect.getTiming().duration)));assert.ok(timing.length>0&&timing.every(duration=>duration===220));
  await link.locator('.nav-shuffle-char').evaluateAll(els=>els.forEach(el=>el.getAnimations().forEach(a=>{a.pause();a.currentTime=80})));
  assert.ok(await link.locator('.nav-shuffle-char').evaluateAll(els=>els.some(el=>Math.abs(new DOMMatrix(getComputedStyle(el).transform).m41)>3)));
  assert.equal(await link.getAttribute('aria-label'),'Проекты');assert.equal(await link.textContent(),'Проекты');
  await page.screenshot({path:`qa/v14/${name}-nav-shuffle.png`});await link.locator('.nav-shuffle-char').evaluateAll(els=>els.forEach(el=>el.getAnimations().forEach(a=>a.play())));await page.waitForTimeout(300);
  assert.ok(await link.locator('.nav-shuffle-char').evaluateAll(els=>els.every(el=>getComputedStyle(el).transform==='none')));assert.ok(Math.abs((await link.boundingBox()).width-box.width)<1);
  if(name==='mobile')await page.locator('.menu-toggle').click();
  await at(page,.86);const start=await positions(page);await at(page,.96);const end=await positions(page);const travel=end.map((v,i)=>start[i].y-v.y);
  assert.ok(travel.every(v=>v>50));assert.ok(Math.max(...travel)-Math.min(...travel)>35);assert.equal(await page.locator('.skills').evaluate(el=>+getComputedStyle(el).opacity),1);
  await page.screenshot({path:`qa/v14/${name}-weightless-skills.png`});await page.waitForTimeout(1000);const bob=await positions(page);assert.ok(bob.some((v,i)=>Math.abs(v.x-end[i].x)>.3||Math.abs(v.y-end[i].y)>.3));
  await at(page,1,120);const pushed=await positions(page);await at(page,1,240);const farther=await positions(page);assert.ok(farther.every((v,i)=>pushed[i].y-v.y>125));
  await at(page,.86);const back=await positions(page);assert.ok(back.every((v,i)=>Math.abs(v.y-start[i].y)<18));
  results.push(`${name}: independent upward travel ${travel.map(v=>v.toFixed(1)).join(', ')}px, idle bobbing, faster lift during native exit, reverse scroll; nav shuffles for 220ms and restores without changing width`);
  // A clean recording of the five different trajectories.
  await page.evaluate(()=>new Promise(resolve=>{const el=document.querySelector('.scroll-track'),from=el.offsetTop+(el.offsetHeight-innerHeight)*.84,to=el.offsetTop+el.offsetHeight-innerHeight+250,start=performance.now();function draw(now){const p=Math.min(1,(now-start)/7000);scrollTo(0,from+(to-from)*p);if(p<1)requestAnimationFrame(draw);else resolve()}requestAnimationFrame(draw)}));await page.waitForTimeout(600);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const video=page.video();await ctx.close();await video.saveAs(`qa/v14/${name}-weightless.webm`);await video.delete();
 }
 const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await reduced.goto(base);await reduced.evaluate(()=>document.fonts.ready);await reduced.locator('.navigation a[href="#skills"]').hover();await reduced.waitForTimeout(100);assert.equal(await reduced.locator('.nav-shuffle-char').evaluateAll(els=>els.flatMap(el=>el.getAnimations()).length),0);assert.ok(await reduced.locator('.skill').evaluateAll(els=>els.every(el=>getComputedStyle(el).translate==='none'&&getComputedStyle(el).rotate==='none')));await reduced.close();results.push('Reduced motion: no shuffle or skill drift');assert.deepEqual(errors,[]);
}finally{await browser.close();await fs.writeFile('qa/v14/results.json',JSON.stringify({results,errors},null,2))}
const safari=await webkit.launch();try{const ctx=await safari.newContext({...devices['iPhone 13']}),page=await ctx.newPage();await page.goto(base);await page.waitForTimeout(900);await at(page,.86);const start=await positions(page);await at(page,.96);const end=await positions(page);assert.ok(end.every((v,i)=>v.y<start[i].y-50));await page.screenshot({path:'qa/v14/webkit-skills.png'});await page.locator('.menu-toggle').click();await page.locator('.navigation a[href="#contact"]').click();await page.waitForFunction(()=>+document.querySelector('.journey-stage').dataset.pan>.999);await ctx.close();results.push('WebKit iPhone: independent skill translation/rotation and navigation verified')}finally{await safari.close();await fs.writeFile('qa/v14/results.json',JSON.stringify({results,errors},null,2))}
console.log(results.join('\n'));
