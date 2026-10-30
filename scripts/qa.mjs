import {chromium,webkit,devices} from 'playwright';
import fs from 'node:fs/promises';import assert from 'node:assert/strict';
await fs.mkdir('qa/videos',{recursive:true});
const results=[],errors=[];
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.QA_URL||'http://127.0.0.1:4173';
async function go(page,p){await page.bringToFront();await page.evaluate(p=>window.scrollTo(0,(document.querySelector('.scroll-track').offsetHeight-innerHeight)*p),p);console.log('STATE',page.viewportSize().width,p);await page.waitForFunction(p=>Math.abs(Number(document.querySelector('.stage').dataset.progress)-p)<.006,p,{timeout:15000});await page.waitForTimeout(250)}
async function setup(options={}){const ctx=await browser.newContext(options),page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.waitForFunction(()=>document.querySelector('.stage')?.dataset.progress!==undefined||document.querySelector('.flat'));await page.waitForTimeout(1200);return{ctx,page}}
try{
 const {ctx,page}=await setup({viewport:{width:1440,height:900}});
 for(const [name,p] of [['hero',0],['emergence',.255],['gallery',.55],['skills',.85],['contact',.99]]){await go(page,p);await page.screenshot({path:`qa/desktop-${name}.png`});}
 for(let i=0;i<5;i++){
  await page.locator(`#project-${i}`).focus();await page.waitForTimeout(800);
  const link=page.locator(`#project-${i}`);assert.equal(await link.getAttribute('target'),'_blank');assert.match(await link.getAttribute('rel'),/noopener/);
  assert.ok(await link.evaluate(el=>{const r=el.getBoundingClientRect();return r.left<innerWidth&&r.right>0&&r.top<innerHeight&&r.bottom>0}));
  const popupPromise=page.waitForEvent('popup');await link.press('Enter');const popup=await popupPromise;await popup.close();await page.bringToFront();
 }
 results.push('Desktop: five keyboard-focused project links open new tabs; focus scrolls each card into view');
 // Native scroll reversibility.
 await go(page,.66);await go(page,.39);assert.ok(await page.locator('#project-0').evaluate(el=>Number(getComputedStyle(el).opacity)>.9));results.push('Timeline reverses to first project');
 for(const width of [320,375,390,768,1024,1440,1920]){await page.setViewportSize({width,height:900});await page.waitForTimeout(350);for(const p of [0,.44,.85,.99]){await go(page,p);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`horizontal overflow ${width}`)}}
 results.push('No horizontal overflow at 320,375,390,768,1024,1440,1920, across four scene states');
 await ctx.close();
 const mob=await setup({...devices['Pixel 7'],viewport:{width:390,height:844}});
 for(const [name,p] of [['hero',0],['stack-first',.21],['stack-mid',.291],['stack-last',.69],['skills',.85],['contact',.99]]){await go(mob.page,p);await mob.page.screenshot({path:`qa/mobile-${name}.png`});}
 await go(mob.page,.291);const overlap=await mob.page.locator('.project-card').evaluateAll(cards=>cards.slice(0,2).map(el=>({rect:el.getBoundingClientRect().toJSON(),transform:getComputedStyle(el).transform,z:getComputedStyle(el).zIndex})));
 assert.ok(overlap[1].rect.top>overlap[0].rect.top&&overlap[1].rect.top<overlap[0].rect.bottom);assert.ok(+overlap[1].z>+overlap[0].z);assert.ok(overlap[0].rect.width<overlap[1].rect.width);results.push('Android Chrome emulation: next card overlaps shrunken previous card, ordered z-index');
 await mob.page.locator('.menu-toggle').click();assert.equal(await mob.page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');await mob.page.locator('.navigation a').nth(1).click();await mob.page.waitForTimeout(1500);assert.ok(Math.abs(Number(await mob.page.locator('.stage').getAttribute('data-progress'))-.84)<.02);results.push('Mobile menu and skills navigation');await mob.ctx.close();
 const reduced=await setup({viewport:{width:390,height:844},reducedMotion:'reduce'});assert.equal(await reduced.page.locator('canvas').count(),0);assert.equal(await reduced.page.locator('.project-card:visible').count(),5);await reduced.page.screenshot({path:'qa/reduced-motion.png',fullPage:true});await reduced.ctx.close();results.push('Reduced motion: no canvas/pinning, five normal readable links');
 const off=await browser.newContext({viewport:{width:1440,height:900}});await off.addInitScript(()=>{const native=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.startsWith('webgl'))return null;return native.call(this,type,...args)}});const offpage=await off.newPage();await offpage.goto(base);await offpage.waitForSelector('.flat');assert.equal(await offpage.locator('.project-card:visible').count(),5);await off.close();results.push('WebGL disabled: complete static accessible fallback');
 const nojs=await browser.newContext({javaScriptEnabled:false});const nj=await nojs.newPage();await nj.goto(base);assert.equal(await nj.locator('noscript a').count(),6);await nojs.close();results.push('JavaScript disabled: five projects and GitHub');
 for(const mode of ['desktop','mobile']){
  const vp=mode==='desktop'?{width:1440,height:900}:{width:390,height:844};const ctx=await browser.newContext({viewport:vp,isMobile:mode==='mobile',hasTouch:mode==='mobile',recordVideo:{dir:'qa/videos',size:vp}});const p=await ctx.newPage();await p.goto(base);await p.waitForTimeout(1700);
  const range=mode==='desktop'?[0,1]:[.19,.73];
  await p.evaluate(async([start,end])=>{const track=document.querySelector('.scroll-track');const max=track.offsetHeight-innerHeight;await new Promise(resolve=>{const t0=performance.now();function frame(now){const t=Math.min(1,(now-t0)/11000);window.scrollTo(0,max*(start+(end-start)*t));if(t<1)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)})},range);await p.waitForTimeout(1200);const video=p.video();await ctx.close();await video.saveAs(`qa/${mode}-transitions.webm`);results.push(`${mode}: recorded native scroll transition video`);
 }
 assert.deepEqual(errors,[]);results.push('No uncaught browser errors');
}finally{await browser.close();await fs.writeFile('qa/results.json',JSON.stringify({timestamp:new Date().toISOString(),results,errors},null,2));console.log(results.join('\n'));}
try{const b=await webkit.launch();const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();await p.goto(base);await p.waitForTimeout(1500);assert.equal(await p.locator('.project-card').count(),5);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await go(p,.291);await p.screenshot({path:'qa/webkit-mobile-stack.png'});await ctx.close();await b.close();results.push('WebKit iPhone emulation: loaded, no horizontal overflow, stack rendered');await fs.writeFile('qa/results.json',JSON.stringify({timestamp:new Date().toISOString(),results,errors},null,2))}catch(e){console.error('WebKit validation unavailable/failed',e.message);process.exitCode=1}
