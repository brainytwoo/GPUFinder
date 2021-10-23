

$("#modalSourceSave").click(function() {
  scrapeProduct($("#modalSourceSource").val());
});

async function scrapeProduct(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const [el1] = await page.$x('//*[@id="landingImage"]');
  const src = await el1.getProperty('src');
  const imgURL = await src.jsonValue();

  $(`<p>${imgURL}</p>`).appendTo('#productContainer');

  const [el2] = await page.$x('//*[@id="productTitle"]');
  const title = await el2.getProperty('textContent');
  const titleTxt = await title.jsonValue();

  $(`<p>${titleTxt}</p>`).appendTo('#productContainer');

  const [el3] = await page.$x('//*[@id="price_inside_buybox"]');
  const price = await el3.getProperty('textContent');
  const priceTxt = await price.jsonValue();

  $(`<p>${priceTxt}</p>`).appendTo('#productContainer');

  console.log({imgURL, titleTxt, priceTxt});

  browser.close();
}
