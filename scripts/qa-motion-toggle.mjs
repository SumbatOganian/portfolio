import {chromium} from 'playwright';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const p=await browser.newPage({viewport:{width:1440,height:900}});await p.goto('http://127.0.0.1:4173');await p.waitForSelector('canvas');
 await p.evaluate(()=>scrollTo(0,(document.querySelector('.scroll-track').offsetHeight-innerHeight)*.66));await p.waitForFunction(()=>Number(document.querySelector('.stage').dataset.progress)>.65);
 await p.locator('.motion-toggle').click();await p.waitForSelector('.flat');assert.equal(await p.locator('.project-card:visible').count(),5);assert.equal(await p.locator('canvas').count(),0);
 await p.locator('.motion-toggle').click();await p.waitForSelector('.app:not(.flat)');await p.waitForFunction(()=>Number(document.querySelector('.stage').dataset.progress)<.01);
 await p.evaluate(()=>scrollTo(0,(document.querySelector('.scroll-track').offsetHeight-innerHeight)*.55));await p.waitForFunction(()=>Math.abs(Number(document.querySelector('.stage').dataset.progress)-.55)<.006);
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForSelector('.flat');assert.equal(await p.locator('.project-card:visible').count(),5);assert.equal(await p.locator('.motion-toggle').count(),0);assert.equal(await p.locator('.skills').evaluate(el=>getComputedStyle(el).visibility),'visible');
 await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForSelector('.app:not(.flat)');
 const result={timestamp:new Date().toISOString(),passed:['Manual motion toggle off/on from gallery returns to working timeline','Dynamic reduced-motion removes canvas and restores every card and skills','Motion control hidden when system requests reduced motion']};await fs.writeFile('qa/motion-toggle-results.json',JSON.stringify(result,null,2));console.log(result);
}finally{await browser.close()}
