const puppeteer = require('puppeteer');
// const download = require('image-downloader');

(async() => {

    //open file
    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream('data.in')
    });

    lineReader.on('line', function(line) {
        console.log('Line from file:', line);
    });
    //open browser
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();

    page.setViewport({ width: 1280, height: 720 });

    const url = 'http://tracuunnt.gdt.gov.vn/tcnnt/mstcn.jsp';
    await page.goto(url);

    console.log('Page loaded');

    await page.waitFor('#module3Content > div > form > table > tbody > tr:nth-child(2) > td:nth-child(2) > input[type="text"]');

    let mst = ['12345678', '87654321'];
    let close = false;

    for (let j = 0; j <= mst.length; j++) {
        await page.type('#module3Content > div > form > table > tbody > tr:nth-child(2) > td:nth-child(2) > input[type="text"]', "");
        await page.type('#module3Content > div > form > table > tbody > tr:nth-child(2) > td:nth-child(2) > input[type="text"]', mst[j]);
        var i = 1;

        while (await page.evaluate(() => { return document.querySelector('#captcha').value; }) != null) {
            t = await page.evaluate(() => { return document.querySelector('#captcha').value; });
            console.log('Please fill captcha in 15s. if not, the browser will close in 15 seconds!');
            i++;
            if (t.length >= 5) {
                close = false;
                break;
            }
            if (i > 7000) {
                close = true;
                if (t.length >= 5)
                    close = false;
                break;
            }
        }

        if (close === false) {
            await page.click('#module3Content > div > form > table > tbody > tr:nth-child(7) > td:nth-child(2) > div > input.subBtn');

            await page.reload();
        } else {
            await browser.close();
        }
    }

})();