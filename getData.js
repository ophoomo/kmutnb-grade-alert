const puppeteer = require("puppeteer");

const puppeteer_config = {
  args: [
    "--enable-features=NetworkService",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-setuid-sandbox",
  ],
  ignoreHTTPSErrors: true,
  headless: true,
  ignoreDefaultArgs: ["--disable-extensions"],
  width: 800,
  height: 600,
  deviceScaleFactor: 2,
};

module.exports.scraping_kmutnb_grade = async (username, password) => {
  const url = "https://grade-report.icit.kmutnb.ac.th/auth/data";
  const browser = await puppeteer.launch(puppeteer_config);
  const page = await browser.newPage();
  await page.goto(url);
  await page.type("#username", username);
  await page.type("#password", password);
  await page.click('[type="submit"]');
  const result = [];
  const account = await page.waitForSelector(
    `#bs-example-navbar-collapse-1 > ul.nav.navbar-nav.navbar-right > li.navbar-brand`
  );
  const accountText = await page.evaluate((element) => element.textContent.trimStart(), account);
  const term = await page.waitForSelector("body > div:nth-child(2)");
  const termText = await page.evaluate((element) => element.textContent.trimStart(), term);
  const table = await page.waitForSelector(
    `body > div.tableTemplate > table > tbody`
  );
  const table_length =
    (await page.evaluate((element) => element.children.length, table)) + 1;

  for (let i = 2; i < table_length; i++) {
    const tr = await page.waitForSelector(
      `body > div.tableTemplate > table > tbody > tr:nth-child(${i})`
    );
    const format_data = await page.evaluate((element) => {
      let texts = [];
      for (let text of element.children) {
        texts.push(text.textContent.trim());
      }
      return texts;
    }, tr);
    result.push(format_data);
  }
  await browser.close();

  return [result, termText, accountText];
};
