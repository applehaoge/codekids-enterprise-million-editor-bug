const puppeteer = require('puppeteer');
const fs = require('fs');
(async ()=>{
  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox'], headless: true});
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  await client.send('Network.enable');
  const entries = [];
  client.on('Network.responseReceived', (e)=>{
    try{
      const url = e.response.url || '';
      if(url.includes('/ws') || url.includes('/api')){
        entries.push({url, status: e.response.status, headers: e.response.headers, mimeType: e.response.mimeType});
      }
    }catch(e){ }
  });
  await page.goto('http://localhost:5173', {waitUntil: 'networkidle2', timeout: 30000});
  await new Promise(r=>setTimeout(r,1500));
  const screenshotPath = 'scripts/net_screenshot.png';
  await page.screenshot({path: screenshotPath, fullPage: true});
  const reportPath = 'scripts/net_report.json';
  fs.writeFileSync(reportPath, JSON.stringify({captured: entries}, null, 2));
  console.log('CAPTURED', screenshotPath, reportPath);
  await browser.close();
})();
