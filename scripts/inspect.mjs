import {chromium} from 'playwright';
const b=await chromium.launch({channel:'chrome',headless:true});
const page=await b.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>console.log('ERROR',e.message));page.on('console',m=>{if(m.type()==='error')console.log(m.text())});
await page.goto('http://127.0.0.1:5173');await page.waitForTimeout(4500);await page.screenshot({path:'qa/desktop-hero.png'});
console.log(await page.evaluate(()=>({canvas:!!document.querySelector('canvas'),flat:!!document.querySelector('.flat'),body:document.body.scrollWidth,inner:innerWidth})));
await page.evaluate(()=>scrollTo(0,(document.querySelector('.scroll-track').offsetHeight-innerHeight)*.48));await page.waitForTimeout(1300);await page.screenshot({path:'qa/desktop-gallery.png'});
await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(1800);await page.screenshot({path:'qa/mobile-hero.png'});
await page.evaluate(()=>scrollTo(0,(document.querySelector('.scroll-track').offsetHeight-innerHeight)*.29));await page.waitForTimeout(1300);await page.screenshot({path:'qa/mobile-stack.png'});
await b.close();
