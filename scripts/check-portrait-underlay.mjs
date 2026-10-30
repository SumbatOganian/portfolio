import {chromium} from 'playwright';
import sharp from 'sharp';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('qa/v10',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto('http://127.0.0.1:5173');await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(()=>{const el=document.querySelector('#person');scrollTo(0,el.offsetTop+(el.offsetHeight-innerHeight)*.5)});
 await page.waitForFunction(()=>Math.abs(+document.querySelector('.journey-stage').dataset.progress-.5)<.002);await page.waitForTimeout(1300);
 const box=await page.locator('.portrait-frame').boundingBox();
 const a=await page.screenshot({path:'qa/v10/underlay-rising.png'});await page.waitForTimeout(1100);const b=await page.screenshot({path:'qa/v10/underlay-rising-later.png'});
 const changes={};
 for(const side of ['left','right']){
  const crop={left:Math.round(side==='left'?box.x+30:box.x+box.width-94),top:Math.round(box.y+box.height*.5),width:64,height:80};
  const before=await sharp(a).extract(crop).raw().toBuffer(),after=await sharp(b).extract(crop).raw().toBuffer();
  changes[side]=before.reduce((sum,v,i)=>sum+Math.abs(v-after[i]),0)/before.length;
 }
 assert.ok(changes.left<.2);assert.ok(changes.right>1);
 await page.evaluate(()=>{const el=document.querySelector('#person');scrollTo(0,el.offsetTop+(el.offsetHeight-innerHeight)*.8)});await page.waitForTimeout(2000);await page.screenshot({path:'qa/v10/portrait-grey-colour.png'});
 await fs.writeFile('qa/v10/underlay-results.json',JSON.stringify({changes,passed:true,note:'Actual screenshot comparison while portrait is expanding: left stays grey, right keeps changing colour'},null,2));
 console.log(changes);
}finally{await browser.close()}
