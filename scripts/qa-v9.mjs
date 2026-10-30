import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
await fs.mkdir('qa/v10',{recursive:true});const results=[],errors=[];
async function at(page,progress){
 await page.evaluate(p=>{const el=document.querySelector('#person');scrollTo(0,el.offsetTop+(el.offsetHeight-innerHeight)*p)},progress);
 await page.waitForFunction(p=>Math.abs(+document.querySelector('.journey-stage').dataset.progress-p)<.003,progress);
 await page.waitForTimeout(1100);
}
async function check(page){
 const box=await page.locator('.portrait-initials').boundingBox();const size=page.viewportSize();
 assert.ok(Math.abs(box.x+box.width/2-size.width/2)<1);
 assert.ok(box.y+box.height<=size.height&&size.height-(box.y+box.height)<size.height*.05);
 const letters=await page.locator('.initial-letter').all();const left=await letters[0].boundingBox(),right=await letters[1].boundingBox();
 assert.ok(left.x<right.x&&Math.abs(left.y-right.y)<1);
 assert.ok(await page.locator('.initial-letter').evaluateAll(els=>els.every(el=>getComputedStyle(el).filter==='none')));
 const ink=await page.locator('.initial-glyph-canvas').evaluateAll(els=>els.map(el=>{
  const ctx=el.getContext('2d'),{data}=ctx.getImageData(0,0,el.width,el.height);
  const rows=Array.from({length:el.height},(_,y)=>Array.from({length:el.width},(_,x)=>data[(y*el.width+x)*4+3]).some(alpha=>alpha>0));
  return{first:rows.findIndex(Boolean),last:rows.findLastIndex(Boolean),height:el.height};
 }));
 assert.ok(ink.every(v=>v.first>=6&&v.last<=v.height-7));
 return ink;
}
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);
 for(const [width,height] of [[320,844],[390,844],[1440,900],[1920,1080]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(400);await at(page,.8);const ink=await check(page);
  if(width===390||width===1440)await page.screenshot({path:`qa/v10/centred-SO-${width}.png`});
  results.push(`${width}×${height}: S left, O right, monogram centred horizontally at the bottom; transparent top/bottom margins ${JSON.stringify(ink)}`);
 }
 await at(page,.54);assert.ok(await page.locator('.initial-letter').evaluateAll(els=>els.every(el=>getComputedStyle(el).filter.includes('invert(1)'))));
 await page.screenshot({path:'qa/v10/entering-white.png'});await at(page,.8);
 const first=await page.locator('.initial-glyph-canvas').first().evaluate(el=>el.toDataURL());await page.waitForTimeout(1100);
 assert.notEqual(first,await page.locator('.initial-glyph-canvas').first().evaluate(el=>el.toDataURL()));
 results.push('White rise and continuously changing colour after settling are preserved');assert.deepEqual(errors,[]);
}finally{await browser.close();await fs.writeFile('qa/v10/results.json',JSON.stringify({results,errors},null,2))}
const safari=await webkit.launch();try{
 const context=await safari.newContext({...devices['iPhone 13']});const page=await context.newPage();await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(800);await at(page,.8);await check(page);await page.screenshot({path:'qa/v10/webkit-centred-SO.png'});await context.close();results.push('WebKit iPhone: same low horizontal monogram and safe glyph margins');
}finally{await safari.close();await fs.writeFile('qa/v10/results.json',JSON.stringify({results,errors},null,2))}
console.log(results.join('\n'));
