
var newSourceModal = document.getElementById('newSourceModal')
//var myInput = document.getElementById('myInput')

newSourceModal.addEventListener('shown.bs.modal', function () {
  ipcRenderer.invoke('loadURL', 'https://www.newegg.com/msi-geforce-rtx-3060-ti-rtx-3060-ti-gaming-x-8g-lhr/p/N82E16814137672?Description=3060&cm_re=3060-_-14-137-672-_-Product&quicklink=true');
});

$("#modalSourceSave").click(function() {
  //scrapeProduct($("#modalSourceSource").val());
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
