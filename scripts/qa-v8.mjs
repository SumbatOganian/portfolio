import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('qa/v8/videos',{recursive:true});
const results=[],errors=[],base='http://127.0.0.1:4173';
async function stageAt(page,progress){
 await page.evaluate(p=>{const el=document.querySelector('.scroll-track');scrollTo(0,el.offsetTop+(el.offsetHeight-innerHeight)*p)},progress);
 await page.waitForFunction(p=>Math.abs(+document.querySelector('.stage').dataset.progress-p)<.002,progress);
 await page.waitForTimeout(150);
}
async function skillState(page){return page.locator('.skills').evaluate(el=>({y:el.getBoundingClientRect().top,opacity:+getComputedStyle(el).opacity,visibility:getComputedStyle(el).visibility}))}
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:'qa/v8/videos',size:{width,height}}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(800);
  assert.equal(await page.locator('.gallery a').count(),5);
  assert.equal(await page.locator('.card-footer h3').count(),5);
  assert.equal(await page.locator('.inline-screen h3').count(),0);
  for(let i=0;i<5;i++){
   const card=page.locator(`#project-${i}`),toggle=card.locator('.preview-toggle');
   await toggle.focus();await page.waitForTimeout(650);
   await card.locator('.inline-poster').evaluate(img=>img.decode());
   assert.equal(await card.locator('.inline-scroll-image').count(),0);
   const title=await card.locator('.card-footer h3').evaluate(el=>({color:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor}));
   assert.equal(title.bg,'rgba(0, 0, 0, 0)');
   await toggle.click();
   await page.waitForFunction(i=>document.querySelector(`#project-${i} .inline-scroll-image`)?.getAnimations().some(a=>a.playState==='running'),i);
   assert.equal(await card.locator('.inline-poster').isVisible(),false);
   assert.equal(await card.locator('.card-footer h3').evaluate(el=>getComputedStyle(el).color),title.color);
   if(i===2){await page.waitForTimeout(1800);await page.screenshot({path:`qa/v8/${name}-active.png`})}
   await toggle.click();assert.equal(await card.locator('.inline-scroll-image').count(),0);
   assert.ok(await card.locator('.inline-poster').isVisible());
  }
  results.push(`${name}: all five cards show real first frames; Preview on/off works inside the card; titles remain below with no badge; only arrows link out`);
  await page.locator('#project-2 .preview-toggle').focus();await page.waitForTimeout(700);await page.screenshot({path:`qa/v8/${name}-idle.png`});
  await stageAt(page,.90);const start=await skillState(page);
  await stageAt(page,.95);const middle=await skillState(page);
  await stageAt(page,.995);const end=await skillState(page);
  assert.ok(start.y>middle.y&&middle.y>end.y);
  assert.ok([start,middle,end].every(s=>s.opacity===1&&s.visibility==='visible'));
  const before=await page.locator('.scene-curtain').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m42);
  assert.equal(before,0);
  await page.screenshot({path:`qa/v8/${name}-skills-end.png`});
  await page.evaluate(()=>{const el=document.querySelector('.scroll-track');scrollTo(0,el.offsetTop+el.offsetHeight-innerHeight+180)});
  await page.waitForTimeout(750);const pushed=await skillState(page);
  assert.ok(pushed.y<end.y-150&&pushed.opacity===1);
  await page.screenshot({path:`qa/v8/${name}-next-section.png`});
  await stageAt(page,.90);assert.ok(Math.abs((await skillState(page)).y-start.y)<2);
  results.push(`${name}: curtain rises first, all skills move up without fading, next section carries the chapter upward; reverse scroll restores it`);
  // Record a slow continuous handoff, including natural document scrolling.
  await stageAt(page,.85);await page.waitForTimeout(500);
  await page.evaluate(()=>new Promise(resolve=>{const el=document.querySelector('.scroll-track'),from=el.offsetTop+(el.offsetHeight-innerHeight)*.85,to=el.offsetTop+el.offsetHeight-innerHeight+innerHeight*.9,start=performance.now();function draw(now){const p=Math.min(1,(now-start)/8500);scrollTo(0,from+(to-from)*p);if(p<1)requestAnimationFrame(draw);else resolve()}requestAnimationFrame(draw)}));
  await page.waitForTimeout(700);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const video=page.video();await context.close();await video.saveAs(`qa/v8/${name}-cards-skills.webm`);await video.delete();
 }
 const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await reduced.goto(base);await reduced.locator('#project-0 .preview-toggle').click();
 await reduced.waitForFunction(()=>document.querySelector('.inline-scroll-image')?.getAnimations().length>0);
 assert.equal(await reduced.locator('.inline-scroll-image').evaluate(el=>el.getAnimations()[0].playState),'paused');await reduced.close();
 results.push('Reduced motion keeps the full Preview paused and the skills section in normal document flow');
 assert.deepEqual(errors,[]);
}finally{await browser.close();await fs.writeFile('qa/v8/results.json',JSON.stringify({results,errors},null,2))}
const wk=await webkit.launch();try{
 const context=await wk.newContext({...devices['iPhone 13']});const page=await context.newPage();await page.goto(base);await page.waitForTimeout(900);
 await page.locator('#project-0 .preview-toggle').focus();await page.waitForTimeout(700);await page.locator('#project-0 .inline-poster').evaluate(img=>img.decode());
 await page.locator('#project-0 .preview-toggle').click();await page.waitForFunction(()=>document.querySelector('.inline-scroll-image')?.getAnimations().some(a=>a.playState==='running'));
 await stageAt(page,.995);assert.equal((await skillState(page)).opacity,1);await page.screenshot({path:'qa/v8/webkit-skills.png'});await context.close();
 results.push('WebKit iPhone: first frame, inline playback and opaque upward skills exit verified');
}finally{await wk.close();await fs.writeFile('qa/v8/results.json',JSON.stringify({results,errors},null,2))}
console.log(results.join('\n'));
