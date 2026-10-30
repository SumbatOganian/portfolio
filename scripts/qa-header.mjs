import {chromium,webkit,devices} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const base=process.env.QA_BASE_URL||'http://127.0.0.1:5173';
await fs.mkdir('qa/v13',{recursive:true});const results=[],errors=[];
async function at(page,progress){await page.evaluate(p=>{const el=document.querySelector('#person');scrollTo(0,el.offsetTop+(el.offsetHeight-innerHeight)*p)},progress);await page.waitForFunction(p=>Math.abs(+document.querySelector('.journey-stage').dataset.progress-p)<.002,progress);await page.waitForTimeout(300)}
async function whiteHeader(page){assert.ok(await page.locator('.site-header .monogram,.site-header .navigation a').evaluateAll(els=>els.every(el=>getComputedStyle(el).color==='rgb(255, 255, 255)'&&getComputedStyle(el).backgroundImage==='none')))}
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  const ctx=await browser.newContext({viewport:{width,height}}),page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(600);
  assert.equal(await page.locator('.header-role,.header-availability,.portrait-initials,.initial-letter').count(),0);
  assert.equal(await page.locator('.site-header a').count(),4);
  await whiteHeader(page);
  if(name==='desktop'){
   const nav=await page.locator('.navigation').boundingBox();assert.ok(nav.x>width*.65&&width-(nav.x+nav.width)<width*.065);assert.equal(await page.locator('.navigation').evaluate(el=>getComputedStyle(el).gap),'22px');
  }else{const button=await page.locator('.menu-toggle').boundingBox();assert.ok(button.x>width*.80)}
  await page.screenshot({path:`qa/v13/${name}-hero.png`});const original=await page.locator('.monogram').screenshot({path:`qa/v13/${name}-logo.png`});
  const {data:ink,info}=await sharp(original).removeAlpha().raw().toBuffer({resolveWithObject:true});let rightmost=-1;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const i=(y*info.width+x)*3;if(ink[i]>220&&ink[i+1]>220&&ink[i+2]>220)rightmost=Math.max(rightmost,x)}
  assert.ok(rightmost>0&&rightmost<info.width-1);results.push(`${name}: complete logo ink has ${info.width-1-rightmost}px of space before the right edge`);
  await at(page,.64);await whiteHeader(page);
  const a=await page.locator('.monogram').screenshot();await page.waitForTimeout(1800);const b=await page.locator('.monogram').screenshot();
  const before=await sharp(original).removeAlpha().raw().toBuffer(),colour=await sharp(b).removeAlpha().raw().toBuffer();let count=0,spread=0;
  for(let i=0;i<before.length;i+=3){if(before[i]>220&&before[i+1]>220&&before[i+2]>220){count++;spread+=Math.max(colour[i],colour[i+1],colour[i+2])-Math.min(colour[i],colour[i+1],colour[i+2])}}
  assert.ok(count>40&&spread/count<3);assert.deepEqual(a,b);
  if(name==='mobile')await page.locator('.menu-toggle').click();
  await page.screenshot({path:`qa/v13/${name}-portrait-header.png`});
  await page.locator('.navigation a[href="#contact"]').click();await page.waitForFunction(()=>+document.querySelector('.journey-stage').dataset.pan>.999);await page.waitForTimeout(250);await whiteHeader(page);
  await page.screenshot({path:`qa/v13/${name}-finale-header.png`});
  await at(page,.64);await whiteHeader(page);await at(page,0);await whiteHeader(page);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  results.push(`${name}: two-sided header, removed status/role and photo initials; logo/menu stay white through portrait and finale; tighter menu spacing; contacts and reverse scroll work`);
  await ctx.close();
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();await fs.writeFile('qa/v13/results.json',JSON.stringify({results,errors},null,2))}
const safari=await webkit.launch();try{
 const ctx=await safari.newContext({...devices['iPhone 13']}),page=await ctx.newPage();await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);await at(page,.64);await page.locator('.menu-toggle').click();await page.screenshot({path:'qa/v13/webkit-colour-header.png'});await page.locator('.navigation a[href="#contact"]').click();await page.waitForFunction(()=>+document.querySelector('.journey-stage').dataset.pan>.999);await whiteHeader(page);await ctx.close();results.push('WebKit iPhone: white logo/menu and mobile contact navigation verified');
}finally{await safari.close();await fs.writeFile('qa/v13/results.json',JSON.stringify({results,errors},null,2))}
console.log(results.join('\n'));
