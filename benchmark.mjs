import puppeteer from 'puppeteer';

(async () => {
  console.log('Lancement du navigateur Chromium pour les tests E2E/Performance...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  console.log('\n--- TEST 1: Sans Lazy Hydration (Standard React) ---');
  await page.goto('http://localhost:6006/iframe.html?id=benchmarks-lazy-vs-normal-hydration--without-lazy-hydration&viewMode=story', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 2000)); 

  const withoutLazyResult = await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div'));
    const labelDiv = divs.find(d => d.textContent === 'Initial Mount / Hydrate Time');
    if (labelDiv && labelDiv.nextElementSibling) {
      return labelDiv.nextElementSibling.textContent;
    }
    return 'Introuvable';
  });
  console.log(`Temps d'hydratation (Bloquant) : ${withoutLazyResult}`);

  console.log('\n--- TEST 2: Avec Lazy Hydration (useStatic) ---');
  await page.goto('http://localhost:6006/iframe.html?id=benchmarks-lazy-vs-normal-hydration--with-lazy-hydration&viewMode=story', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 1000));

  const withLazyResult = await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div'));
    const labelDiv = divs.find(d => d.textContent === 'Initial Mount / Hydrate Time');
    if (labelDiv && labelDiv.nextElementSibling) {
      return labelDiv.nextElementSibling.textContent;
    }
    return 'Introuvable';
  });
  console.log(`Temps d'hydratation (Optimisé) : ${withLazyResult}`);

  console.log('\n--- Interaction Test sur Lazy Hydration ---');
  console.log('Survol du premier bouton...');
  
  const buttons = await page.$$('button');
  // Hover over the first valid interactive button
  for (const btn of buttons) {
      const box = await btn.boundingBox();
      if (box && box.width > 0 && box.height > 0) {
          await btn.hover();
          break;
      }
  }
  
  await new Promise(r => setTimeout(r, 1000)); // Wait for hydration to complete after hover
  
  const activeStatus = await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div'));
    const labelDiv = divs.find(d => d.textContent === 'Status (Active vs Static)');
    if (labelDiv && labelDiv.nextElementSibling) {
      return labelDiv.nextElementSibling.textContent.trim().replace(/\s+/g, ' ');
    }
    return 'Introuvable';
  });
  console.log(`Statut après survol : ${activeStatus}`);

  await browser.close();
  console.log('\nTests terminés !');
})();
