import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4173/portfolio/';
await fs.mkdir('qa/mobile-menu',{recursive:true});
for(const [name,engine] of [['chrome',chromium],['webkit',webkit]]){
 const browser=await engine.launch(name==='chrome'?{channel:'chrome'}:{});
 try{
  const page=await browser.newPage({...devices['iPhone 13']});
  await page.goto(base);await page.waitForFunction(()=>!document.documentElement.hasAttribute('data-startup-loading'));await page.waitForTimeout(600);
  const button=page.locator('.menu-toggle'),panel=page.locator('.mobile-menu');
  assert.equal(await panel.evaluate(el=>el.inert),true);
  const y=await page.evaluate(()=>scrollY);
  await button.click();await page.waitForTimeout(1200);
  assert.equal(await button.getAttribute('aria-expanded'),'true');
  await page.waitForFunction(()=>Math.abs(document.querySelector('.mobile-menu').getBoundingClientRect().y-96)<1);const bounds=await panel.boundingBox();assert.equal(Math.round(bounds.y),96);assert.ok(bounds.height>500);
  assert.equal(await page.locator('main').evaluate(el=>el.inert),true);
  assert.equal(await page.locator('body').evaluate(el=>el.style.overflow),'hidden');
  await page.screenshot({path:`qa/mobile-menu/${name}-open.png`});
  await page.mouse.move(180,120);await page.mouse.down();await page.mouse.move(180,270,{steps:8});await page.mouse.up();await page.waitForTimeout(1200);
  assert.equal(await button.getAttribute('aria-expanded'),'false');assert.equal(await page.locator('main').evaluate(el=>el.inert),false);assert.equal(await page.evaluate(()=>scrollY),y);
  await button.click();await page.waitForTimeout(1200);await page.keyboard.press('Enter');assert.equal(await button.getAttribute('aria-expanded'),'false');await page.waitForTimeout(1000);
  await button.click();await button.click();await page.waitForTimeout(1200);assert.equal(await button.getAttribute('aria-expanded'),'false');
  await button.click();await page.keyboard.press('Escape');assert.equal(await button.getAttribute('aria-expanded'),'false');
  await button.click();await page.waitForTimeout(1200);await panel.locator('a').first().click();await page.waitForTimeout(1800);assert.equal(await button.getAttribute('aria-expanded'),'false');
  const card=page.locator('#project-0');
  const box=await card.boundingBox(),screen=await card.locator('.inline-preview').boundingBox(),preview=await card.locator('.preview-toggle').boundingBox(),title=await card.locator('.card-footer').boundingBox();
  assert.ok(screen.width/box.width>.91);assert.ok(screen.y>=preview.y+preview.height+8);assert.ok(screen.y+screen.height<=title.y-8);
  await page.screenshot({path:`qa/mobile-menu/${name}-card.png`});
  await card.locator('.preview-toggle').click();await page.waitForTimeout(400);assert.equal(await card.locator('.inline-preview').getAttribute('class'),'inline-preview is-playing');assert.equal(page.url(),base);
  console.log(`${name}: panel, swipe, cross, Escape, scroll lock, navigation and expanded inline preview passed`);
  if(name==='chrome'){
   await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(500);assert.equal(await button.isVisible(),false);assert.ok(await page.locator('.navigation').isVisible());assert.equal(await panel.isVisible(),false);
   await page.setViewportSize({width:320,height:640});await page.waitForTimeout(500);await button.click();await page.waitForTimeout(1200);assert.ok(await panel.locator('a').last().isVisible());assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),320);
  }
 }finally{await browser.close()}
}
