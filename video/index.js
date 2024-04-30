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
        defaultViewport: {width: 1280, height: 720},
        devtools: true
    });

    // open a new page
    const page = await browser.newPage();

    // navigate to the video url
    await page.goto('https://www.youtube.com/watch?v=cAyx-VIgjwk');

    // 1. open settings-button
    const settingsButton = await page.waitForSelector('.ytp-settings-button');
    await settingsButton.click();

    // 2. open quality-menu item
    const menuItems = await page.$$('.ytp-panel-menu .ytp-menuitem');
    for (let i = 0; i < menuItems.length; i++) {
        const menuItem = menuItems[i];
        const label = await menuItem.$eval('.ytp-menuitem-label', el => el.textContent);
        if (label.includes('Quality')) {
            console.log("enter quality menu")
            await menuItem.click();
            break;
        }
    }

    await wait(1000);

// 3. select 480p quality item
    await page.waitForSelector('.ytp-quality-menu', {timeout: 60000});
    const qualityMenuItems = await page.$$('.ytp-quality-menu .ytp-menuitem');
    for (let i = 0; i < qualityMenuItems.length; i++) {
        const menuItem = qualityMenuItems[i];
        const label = await menuItem.$eval('.ytp-menuitem-label', el => el.textContent);
        if (label.includes('480p')) {
            console.log("select 480p quality")
            await menuItem.click();
            break;
        }
    }

    const videoDuration = await page.$eval('video', (video) => video.duration);
    console.log('video duration: ', videoDuration);


    //wait for video to finish
    await wait(videoDuration*10000);

    await browser.close();

})();