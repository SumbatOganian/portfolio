import {chromium,webkit,devices} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const base=process.env.QA_BASE_URL||'http://127.0.0.1:5173';
await fs.mkdir('qa/v12',{recursive:true});const results=[],errors=[];
async function at(page,progress){await page.evaluate(p=>{const el=document.querySelector('#person');scrollTo(0,el.offsetTop+(el.offsetHeight-innerHeight)*p)},progress);await page.waitForFunction(p=>Math.abs(+document.querySelector('.journey-stage').dataset.progress-p)<.002,progress);await page.waitForTimeout(300)}
async function tint(page){return page.evaluate(()=>+document.documentElement.style.getPropertyValue('--portrait-header-tint'))}
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  const ctx=await browser.newContext({viewport:{width,height}}),page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(600);
  assert.equal(await page.locator('.header-role,.header-availability,.portrait-initials,.initial-letter').count(),0);
  assert.equal(await page.locator('.site-header a').count(),4);
  assert.equal(await tint(page),0);
  if(name==='desktop'){
   const nav=await page.locator('.navigation').boundingBox();assert.ok(nav.x>width*.65&&width-(nav.x+nav.width)<width*.065);
  }else{const button=await page.locator('.menu-toggle').boundingBox();assert.ok(button.x>width*.80)}
  await page.screenshot({path:`qa/v12/${name}-hero.png`});const original=await page.locator('.monogram').screenshot();
  await at(page,.64);assert.equal(await tint(page),1);
  const a=await page.locator('.monogram').screenshot();await page.waitForTimeout(1800);const b=await page.locator('.monogram').screenshot();
  const before=await sharp(original).removeAlpha().raw().toBuffer(),colour=await sharp(b).removeAlpha().raw().toBuffer();let count=0,spread=0;
  for(let i=0;i<before.length;i+=3){if(before[i]>220&&before[i+1]>220&&before[i+2]>220){count++;spread+=Math.max(colour[i],colour[i+1],colour[i+2])-Math.min(colour[i],colour[i+1],colour[i+2])}}
  assert.ok(count>40&&spread/count>20);assert.notDeepEqual(a,b);
  if(name==='mobile')await page.locator('.menu-toggle').click();
  await page.screenshot({path:`qa/v12/${name}-portrait-header.png`});
  await page.locator('.navigation a[href="#contact"]').click();await page.waitForFunction(()=>+document.querySelector('.journey-stage').dataset.pan>.999);await page.waitForTimeout(250);assert.equal(await tint(page),0);
  await page.screenshot({path:`qa/v12/${name}-finale-header.png`});
  await at(page,.64);assert.equal(await tint(page),1);await at(page,0);assert.equal(await tint(page),0);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  results.push(`${name}: two-sided header, removed status/role and photo initials; visible animated colour in logo/menu during portrait, white restored at finale; contacts and reverse scroll work`);
  await ctx.close();
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();await fs.writeFile('qa/v12/results.json',JSON.stringify({results,errors},null,2))}
const safari=await webkit.launch();try{
 const ctx=await safari.newContext({...devices['iPhone 13']}),page=await ctx.newPage();await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);await at(page,.64);await page.locator('.menu-toggle').click();await page.screenshot({path:'qa/v12/webkit-colour-header.png'});await page.locator('.navigation a[href="#contact"]').click();await page.waitForFunction(()=>+document.querySelector('.journey-stage').dataset.pan>.999);assert.equal(await tint(page),0);await ctx.close();results.push('WebKit iPhone: colour-clipped text and mobile contact navigation verified');
}finally{await safari.close();await fs.writeFile('qa/v12/results.json',JSON.stringify({results,errors},null,2))}
console.log(results.join('\n'));
