const puppeteer = require('puppeteer');
const download = require('image-downloader');
const jsonfile = require('jsonfile');

// DEFINE
const FILE_INPUT = __dirname + '/data.json';
const FILE_OUTPUT = __dirname + '/result.json';

(async() => {

    //open file get data
    let first = 1;
    let last = 1;
    let run = 1;
    let end = 1;
    try {
        const readfile = jsonfile.readFileSync(FILE_INPUT);
        first = readfile['first'];
        last = readfile['last'];
        run = readfile['run'];
        end = run;
    } catch (err) {
        console.dir(err);
    }
    //open browser
    const browser = await puppeteer.launch({ headless: true, args: [`--window-size=1280,720`] });
    const page = await browser.newPage();

    //page setting
    let url = 'https://mrcong.com/category/nguoi-dep/nguoi-dep-trung-quoc/page/' + first;
    //open page
    await page.goto(url);
    page.setViewport({ width: 1280, height: 720 });
    console.log('Starting ...');

    //get title category url
    let arr = [];
    let articles = {};
    for (let i = run; i <= last; i++) {
        url = 'https://mrcong.com/category/nguoi-dep/nguoi-dep-trung-quoc/page/' + i;
        await page.goto(url);
        articles = await page.evaluate(() => {
            let titleLinks = document.querySelectorAll('article');
            titleLinks = [...titleLinks];
            let articles = titleLinks.map(link => ({
                title: link.children[1].children[0].textContent,
                url: link.children[1].children[0].getAttribute('href'),
                category: link.children[1].children[0].textContent.split(' ')[0],
                thumbnail: link.children[0].children[0].children[0].getAttribute('src'),
                slug: link.children[1].children[0].getAttribute('href').split('/')[3]
            }));
            return articles;
        });
        for (let j = 0; j <= articles.length; j++) {
            if (articles[j] != null)
                arr.push(articles[j]);
        }
        run = i;
        if (i >= 50) {
            break;
        }
    }

    let data = {
        "first": first,
        "last": last,
        "run": run
    };
    // console.dir(articles);
    try {
        await jsonfile.writeFileSync(FILE_INPUT, data);
        // let updateData = jsonfile.readFileSync(FILE_OUTPUT);
        // await jsonfile.writeFileSync(FILE_OUTPUT, { 'data': arr });
    } catch (err) {
        console.dir(err);
    }

    // console.log(arr);
    //get link anh
    try {
        let artiArray = arr;
        // console.log(artiArray);
        // for (let i = end; i <= run; i++) {
        for (let j = 0; j < artiArray.length; j++) {
            // link articles
            let urlArticles = artiArray[j]['url'];
            await page.goto(urlArticles);
            // page size
            let pageSize = await page.evaluate(() => {
                let t = document.querySelectorAll('#fukie2 > div:nth-child(2) > a');
                t = [...t];
                return t.length;
            });
            // console.log(pageSize);
            // get link image

            let limg = [];
            for (let k = 1; k <= pageSize; k++) {
                await page.goto(urlArticles + k);
                link_image = await page.evaluate(() => {
                    let img = document.querySelectorAll('#fukie2 > p > img');
                    img = [...img];
                    let linkImg = img.map(link => ({
                        thumbnail: link.getAttribute('src'),
                    }));
                    return linkImg;
                });
                // console.log(link_image);
                for (let x = 0; x < link_image.length; x++) {
                    // console.log(x + " " + link_image[x]['thumbnail']);
                    // if (link_image[x] != null || link_image[x] != undefined)
                    limg.push(link_image[x]['thumbnail']);
                }
                console.log(j);
            }
            artiArray[j]['link_image'] = limg;
        }
        // }
        // save file
        await jsonfile.writeFileSync(FILE_OUTPUT, { 'data': artiArray });
    } catch (err) {
        console.dir(err);
    }

    console.log('Done !!!');
    await browser.close();
})();