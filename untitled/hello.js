const puppeteer = require('puppeteer-extra');
const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

puppeteer.use(AdblockerPlugin({
    interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY
    }));

function wait(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

(async () => {

    const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    // 启动浏览器
    const browser = await puppeteer.launch({
        executablePath: executablePath,
        headless: false,
        defaultViewport: {width: 1280, height: 720}
    });

    // open a new page
    const page = await browser.newPage();

    // navigate to the video url
    await page.goto('https://www.youtube.com/watch?v=cAyx-VIgjwk');


    //play video
    const videoPlayButton = await page.$('.ytp-play-button');
    await videoPlayButton.click();


    // Click on the settings button
    const settingsButton = await page.$('.ytp-settings-button');
    await settingsButton.click();

    // add a delay
    await wait(15000);
    // Wait for the settings menu to appear
    await page.waitForSelector('.ytp-panel-menu', {timeout: 60000});


    // Get the quality options
    const qualityOptions = await page.evaluate(() => {
        const options = Array.from(document.querySelectorAll('.ytp-panel-menu .ytp-menuitem'));
        return options.map(option => option.textContent.trim());
    });

    console.log('Quality options: ', qualityOptions[qualityOptions.length - 1]);

    // 已知的 textContent
    const knownTextContent = qualityOptions[qualityOptions.length - 1];

// 使用 $$eval 方法来选择所有匹配给定选择器的元素，并找到第一个 textContent 匹配的元素
    const elementHandle = await page.$$eval('.ytp-menuitem', (nodes, knownTextContent) => {
        return nodes.find(node => node.textContent.trim() === knownTextContent);
    }, knownTextContent);

// 现在，element 是第一个 textContent 匹配已知文本内容的元素
    if (elementHandle) {
        // 现在，element 是第一个 textContent 匹配已知文本内容的元素
        console.log("elementHandle: ", elementHandle)
        await elementHandle.click();
    } else {
        console.log(`No element found with text content: ${knownTextContent}`);
    }

    const lastElementHandle = await page.evaluateHandle(() => {
        const nodeList = document.querySelectorAll('.ytp-menuitem');
        console.log('nodeList: ', nodeList.length)
        return nodeList[nodeList.length - 1];
    });

    // 使用 lastElementHandle 进行后续操作，例如点击
    const nodeList = document.querySelectorAll('.ytp-menuitem');
    console.log('nodeList: ', nodeList.length)
    await lastElementHandle.click();


    // Wait for the quality options to appear
    await page.waitForSelector('.ytp-panel-menu');
    // Select the quality option and click it
    await page.$$eval('.ytp-menuitem', (nodes) => {
        nodes[3].click();
    });



    await wait(30*1000);
    const videoDuration = await page.$eval('video', (video) => video.duration);
    console.log('video duration: ', videoDuration);

    //wait for video to finish
    await wait(videoDuration*1000);

    await browser.close();

})();