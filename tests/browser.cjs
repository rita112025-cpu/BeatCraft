const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req,res)=>{
 const target = path.join(root, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
 if (!target.startsWith(root + path.sep)) {res.writeHead(403).end();return;}
 fs.readFile(target,(error,body)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',target.endsWith('.js')?'text/javascript':target.endsWith('.html')?'text/html':'text/plain');res.end(body);});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch();
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('https://fonts.googleapis.com/**',route=>route.abort());
 await page.clock.install();
 const url=`http://127.0.0.1:${server.address().port}`;
 try {
 await page.goto(url);
 await page.getByRole('button',{name:'開始遊戲 ▶'}).click();
 assert.equal(await page.getByRole('button',{name:/^Lv\d/}).count(),12);
 assert.equal(await page.getByRole('button',{name:/^Lv\d/}).locator(':scope:disabled').count(),11);
 await page.getByRole('checkbox').check();
 assert.equal(await page.locator('button:disabled').count(),0);
 await page.getByRole('button',{name:/^Lv1\s/}).click();
 await page.clock.runFor(3200);
 // Repeated settings changes must not keep resetting a partial second.
 for (let i=0;i<4;i++) {
  await page.clock.runFor(350);
  await page.locator('label').filter({hasText:'背景音樂'}).getByRole('button').click();
 }
 const timeLeft=await page.evaluate(()=>Number.parseInt([...document.querySelectorAll('div')].find(el=>el.textContent==='TIME').nextElementSibling.textContent));
 assert.ok(timeLeft<=29,'settings changes preserve elapsed active time');
 await page.getByRole('button',{name:/暫停 \/ 空白鍵/}).click();
 await page.getByRole('dialog',{name:'遊戲已暫停'}).waitFor();
 const pausedText=await page.locator('body').innerText();
 await page.clock.runFor(5000);
 assert.equal(await page.locator('body').innerText(),pausedText);
 await page.getByRole('button',{name:'繼續遊戲 ▶'}).click();
 await page.clock.runFor(14000);
 assert.ok(await page.getByRole('button',{name:/暫停 \/ 空白鍵/}).isVisible(),'practice survives misses');
 await page.getByRole('button',{name:/暫停 \/ 空白鍵/}).click();
 await page.getByRole('button',{name:'返回選關'}).click();
 await page.getByRole('checkbox').uncheck();
 await page.getByRole('button',{name:/^Lv1\s/}).click();
 // Play the standard run by reading note positions and pressing their lane keys.
 await page.evaluate(()=>{
 const seen=new WeakSet();window.autoPlay=setInterval(()=>{
  for(const note of document.querySelectorAll('div.absolute')){
   const top=parseFloat(note.style.top),left=note.style.left;
   if(!left.startsWith('calc(')||top<83||top>89||seen.has(note))continue;
   seen.add(note);const center=parseFloat(left.slice(5));const key=['d','f','j','k'][Math.round((center-12.5)/25)];
   if(key)window.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));
  }
 },16);
 });
 await page.clock.runFor(34000);
 await page.getByRole('button',{name:'再玩一次'}).waitFor();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('beatcraft.progress.v3')));
 assert.ok(saved[0].best>400,'standard run earns and saves at least one star');
 await page.reload();await page.getByRole('button',{name:'開始遊戲 ▶'}).click();
 assert.ok(await page.getByRole('button',{name:/^Lv2\s/}).isEnabled(),'next level stays unlocked after reload');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile layout has no horizontal overflow');
 // In versus, let blue lose its lives while pink keeps hitting notes.
 await page.getByRole('button',{name:'雙人對戰'}).click();
 await page.getByRole('button',{name:/^Lv1\s/}).click();
 await page.evaluate(()=>{
  window.autoplayKeys=['j','k'];
  const seen=new WeakSet();window.autoPlay=setInterval(()=>{
   for(const note of document.querySelectorAll('div.absolute')){
    const top=parseFloat(note.style.top),left=note.style.left;
    if(!left.startsWith('calc(')||top<83||top>89||seen.has(note))continue;
    const lane=Math.round((parseFloat(left.slice(5))-12.5)/25);
    const key=['d','f','j','k'][lane];
    if(!window.autoplayKeys.includes(key))continue;
    seen.add(note);window.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));
   }
  },16);
 });
 await page.clock.runFor(10000);
 const blue=page.getByText('藍隊 P1 · 已淘汰',{exact:true});
 await blue.waitFor();
 const before=await blue.evaluate(el=>el.nextElementSibling.textContent);
 await page.evaluate(()=>window.autoplayKeys=['d','f','j','k']);
 await page.clock.runFor(5000);
 assert.equal(await blue.evaluate(el=>el.nextElementSibling.textContent),before,'eliminated player cannot score');
 assert.deepEqual(errors,[],'no browser runtime errors');
 console.log('Browser smoke passed: mobile layout, 12 levels, practice, pause, standard scoring, save/reload and unlock.');
 } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
