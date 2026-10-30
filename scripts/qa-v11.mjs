import {chromium,webkit,devices} from 'playwright';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import assert from 'node:assert/strict';
const base=process.env.QA_BASE_URL||'http://127.0.0.1:5173';
await fs.mkdir('qa/v11/videos',{recursive:true});const previous=process.env.QA_REMAINING_ONLY?JSON.parse(await fs.readFile('qa/v11/results.json','utf8')):null;const results=previous?.results||[],errors=previous?.errors||[];
async function at(page,p){
 await page.evaluate(p=>{const el=document.querySelector('#person');scrollTo(0,el.offsetTop+(el.offsetHeight-innerHeight)*p)},p);
 await page.waitForFunction(p=>Math.abs(+document.querySelector('.journey-stage').dataset.progress-p)<.002,p);await page.waitForTimeout(250);
}
async function finalFits(page){
 const box=await page.locator('#contact').boundingBox(),{width,height}=page.viewportSize();
 assert.ok(Math.abs(box.x)<1&&Math.abs(box.y)<1&&Math.abs(box.width-width)<1&&Math.abs(box.height-height)<1);
 assert.equal(await page.locator('#contact').evaluate(el=>el.inert),false);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
}
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const [name,width,height] of (process.env.QA_REMAINING_ONLY?[]:[['desktop',1440,900],['mobile',390,844]])){
  const ctx=await browser.newContext({viewport:{width,height},recordVideo:{dir:'qa/v11/videos',size:{width,height}}}),page=await ctx.newPage();
  page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(700);
  await at(page,.85);await page.screenshot({path:`qa/v11/${name}-portrait.png`});const first=await page.locator('.portrait-frame').boundingBox();
  await at(page,.925);const middle=await page.locator('#contact').boundingBox();assert.ok(Math.abs(middle.x-width*.5)<2&&Math.abs(middle.y)<1);assert.equal(await page.locator('#contact').evaluate(el=>el.inert),true);
  const image=await page.screenshot({path:`qa/v11/${name}-midway.png`});
  if(name==='desktop'){
   const raw=await sharp(image).removeAlpha().raw().toBuffer(),line=width/2;
   let sum=0;for(let y=350;y<550;y++)for(let c=0;c<3;c++)sum+=Math.abs(raw[(y*width+line-2)*3+c]-raw[(y*width+line+2)*3+c]);
   const difference=sum/600;assert.ok(difference<12);results.push(`Colour panorama seam mean difference: ${difference.toFixed(2)}/255`);
  }
  await at(page,1);await finalFits(page);await page.screenshot({path:`qa/v11/${name}-finale.png`});
  await at(page,.85);const reverse=await page.locator('.portrait-frame').boundingBox();assert.ok(Math.abs(first.x-reverse.x)<1&&Math.abs(first.y-reverse.y)<1);
  // Native vertical wheel drives the horizontal finale.
  await page.mouse.wheel(0,280);await page.waitForTimeout(1100);assert.ok(+(await page.locator('.journey-stage').getAttribute('data-pan'))>0);
  await page.locator('.navigation a[href="#contact"]').evaluate(el=>el.click());await page.waitForFunction(()=>+document.querySelector('.journey-stage').dataset.pan>.999);await page.waitForTimeout(300);await finalFits(page);
  await page.locator('.back-to-start').click();await page.waitForFunction(()=>scrollY<2);await page.waitForTimeout(200);
  results.push(`${name}: horizontal movement at constant screen height; reverse scroll, native wheel, Contact navigation and up arrow work; no horizontal page overflow`);
  await at(page,.85);await page.waitForTimeout(800);
  await page.evaluate(()=>new Promise(resolve=>{const el=document.querySelector('#person'),from=el.offsetTop+(el.offsetHeight-innerHeight)*.85,to=el.offsetTop+el.offsetHeight-innerHeight,start=performance.now();function draw(now){const p=Math.min(1,(now-start)/6800);scrollTo(0,from+(to-from)*p);if(p<1)requestAnimationFrame(draw);else resolve()}requestAnimationFrame(draw)}));await page.waitForTimeout(1100);
  const video=page.video();await ctx.close();await video.saveAs(`qa/v11/${name}-horizontal-finale.webm`);await video.delete();
 }
 const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await reduced.goto(base);await reduced.evaluate(()=>document.fonts.ready);await reduced.waitForTimeout(500);assert.equal(await reduced.locator('#contact').evaluate(el=>el.inert),false);
 await reduced.locator('.navigation a[href="#contact"]').evaluate(el=>el.click());await reduced.waitForFunction(()=>Math.abs(document.querySelector('#contact').getBoundingClientRect().y)<2);assert.ok(Math.abs((await reduced.locator('#contact').boundingBox()).y)<2);assert.ok(Math.abs(await reduced.evaluate(()=>document.documentElement.scrollHeight-innerHeight-scrollY))<2);assert.ok(await reduced.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await reduced.screenshot({path:'qa/v11/reduced-motion.png'});await reduced.close();results.push('Reduced motion keeps the final screen in normal vertical flow and contact navigation accessible');assert.deepEqual(errors,[]);
}finally{await browser.close();await fs.writeFile('qa/v11/results.json',JSON.stringify({results,errors},null,2))}
const safari=await webkit.launch();try{
 const ctx=await safari.newContext({...devices['iPhone 13']}),page=await ctx.newPage();await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(600);await at(page,.925);assert.ok(Math.abs((await page.locator('#contact').boundingBox()).x-page.viewportSize().width*.5)<2);await at(page,1);await finalFits(page);await page.screenshot({path:'qa/v11/webkit-finale.png'});await ctx.close();results.push('WebKit iPhone: sideways transition and complete final screen verified');
}finally{await safari.close();await fs.writeFile('qa/v11/results.json',JSON.stringify({results,errors},null,2))}
console.log(results.join('\n'));
