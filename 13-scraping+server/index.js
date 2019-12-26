const puppeteer = require('puppeteer')
const fs = require('fs-extra')
const express = require('express')
const app = express()
const port = 8888

const username = 'grushevskiy@gmail.com';
const password = 'xxx';

(async () => {

    app.get('/instascraper/user/:userID', async (request, response) => {
        const profile = request.params.userID
        const content = await scrapeImages (profile)

        //fix CORS issues
        response.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'text/plain'
        })

        response.send(content)
    })

    app.listen(port, () => {
        console.log(`Instascraper server listening on port ${port}!`)
    })

    const scrapeImages = async profile => {

        const browser = await puppeteer.launch()
        const [page] = await browser.pages()

        await page.goto('https://www.instagram.com/accounts/login/', {waitUntil: 'networkidle0', timeout: 0})

        await page.waitForSelector('[name=username]', {timeout: 0})
        await page.type('[name=username]', username)
        await page.waitForSelector('[name=password]', {timeout: 0})
        await page.type('[name=password]',password)

        await Promise.all([
            page.waitForNavigation(),
            page.click('[type=submit]')
        ])

        await page.waitForSelector('input[placeholder="Search"]', {timeout: 0})
        await page.goto(`https://www.instagram.com/${profile}`, {waitUntil: 'networkidle0', timeout: 0})

        await page.waitForSelector('body section > main > div > header ~ div ~ div > article a[href] img[srcset]', {visible:true, timeout: 0})

        const data = await page.evaluate( () => {
            const images = document.querySelectorAll('body section > main > div > header ~ div ~ div > article a[href] img[srcset]')
            const urls = Array.from(images).map(img => img.src )
            return urls;
        })

        await browser.close()

        return `{
            "images" : "${data}"
        }`
    }

})()