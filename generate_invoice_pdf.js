const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const htmlPath = path.resolve(__dirname, 'invoice_DB_NHCSPL_2026.html');
  await page.goto(`file:///${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });
  // Allow web fonts to finish rendering
  await page.evaluateHandle('document.fonts.ready');

  await page.pdf({
    path: path.resolve(__dirname, 'invoice_DB_NHCSPL_2026.pdf'),
    format: 'A4',
    printBackground: true,
    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
  });

  await browser.close();
  console.log('PDF generated: invoice_DB_NHCSPL_2026.pdf');
})();
