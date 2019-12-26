const puppeteer = require("puppeteer");
const fs = require('fs');

async function scrapeImages (username) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.instagram.com/accounts/login/')

    // Login form
    await page.screenshot({path: '1.png'})

    //.type method selects an element on the dom and simulates typing into that form
    await page.type('[name=username]','grushevskiy@gmail.com')
    await page.type('[name=password]','Intercom111.')

    await page.screenshot({path: '2.png'})
    await page.click('[type=submit]')

    // Social Page

    //manual wait in ms
    await page.waitFor(5000);

    await page.goto(`https://www.instagram.com/${username}`);

    
    //wait for any img to load
    await page.waitForSelector('img', {
        visible: true,
    })

    //keep scrolling down 
    await page.evaluate(scrollToBottom);
    async function scrollToBottom() {
        await new Promise(resolve => {
        const distance = 100; // should be less than or equal to window.innerHeight
        const delay = 100;
        const timer = setInterval(() => {
            document.scrollingElement.scrollBy(0, distance);
            // if window offset + window height = total scrollable distance, clear interval & resolve
            if (document.scrollingElement.scrollTop + window.innerHeight >= document.scrollingElement.scrollHeight) {
            clearInterval(timer);
            resolve();
            }
        }, delay);
        });
    }

    await page.screenshot({path: '3.png'});

    //Execute code in the dom | .evalueate gives us a callback function which gives us access to the dom API (we can use vanila js to get anything we want here) | i.e. pause the browser at any time and scrape whatever code we want from the html
    const data = await page.evaluate( () => {
        const images = document.querySelectorAll('img');
        //turn images into array, map over that array and change the elements into the elemens src.
        const urls = Array.from(images).map(v => v.src + '||');
        return urls;
    } );

    fs.writeFileSync('./myData2.txt', data);

    console.log(data)

    return data;
}

scrapeImages('tor88a');
