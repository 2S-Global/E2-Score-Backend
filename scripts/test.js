import puppeteer from "puppeteer";

try {
  const browser = await puppeteer.launch({
    headless: true,
  });

  console.log("Browser launched successfully!");

  const page = await browser.newPage();
  await page.goto("https://example.com");

  console.log(await page.title());

  await browser.close();
} catch (err) {
  console.error(err);
}