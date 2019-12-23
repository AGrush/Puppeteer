const puppeteer = require("puppeteer");
const fs = require('fs');

async function main() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://jaxenter.com/')

    let myelement = (await page.$x('//*[@id="text-36"]/p'))[0];
    let title = await(await myelement.getProperty('innerText')).jsonValue();
    await page.screenshot({ path: './myScreenshot.png'});
    fs.writeFileSync('./myData.txt', title);

}

main();