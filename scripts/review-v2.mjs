import {chromium} from 'playwright';import fs from 'node:fs/promises';
await fs.mkdir('qa/v2',{recursive:true});const b=await chromium.launch({channel:'chrome',headless:true});
const p=await b.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>console.log('ERROR',e.message));await p.goto('http://127.0.0.1:4173');await p.waitForTimeout(2500);
async function go(v){await p.evaluate(v=>scrollTo(0,(document.querySelector('.scroll-track').offsetHeight-innerHeight)*v),v);await p.waitForFunction(v=>Math.abs(+document.querySelector('.stage').dataset.progress-v)<.005,v);await p.waitForTimeout(300)}
await go(0);await p.screenshot({path:'qa/v2/desktop-hero.png'});await go(.55);await p.screenshot({path:'qa/v2/desktop-glass.png'});
await p.setViewportSize({width:390,height:844});await p.waitForTimeout(800);await go(0);await p.screenshot({path:'qa/v2/mobile-hero.png'});await go(.21);await p.screenshot({path:'qa/v2/mobile-glass-active.png'});await go(.291);await p.screenshot({path:'qa/v2/mobile-glass-stack.png'});
console.log(await p.evaluate(()=>({images:document.querySelectorAll('.project-card img').length,links:document.querySelectorAll('.project-card').length,canvas:!!document.querySelector('canvas'),overflow:document.documentElement.scrollWidth>innerWidth})));
await b.close();
