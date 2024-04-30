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
    console.log(settingsButton)
    await settingsButton.click();


    // Wait for the settings menu to appear
    // await page.waitForSelector('.ytp-panel-menu', {timeout: 60000});

    // Get all menu items
    const menuItems = await page.$$('.ytp-panel-menu .ytp-menuitem');

    // Iterate over the menu items to find the one that includes 'Quality'
    for (let i = 0; i < menuItems.length; i++) {
        const menuItem = menuItems[i];
        const label = await menuItem.$eval('.ytp-menuitem-label', el => el.textContent);
        if (label.includes('Quality')) {
            await menuItem.click();
            break;
        }
    }


    // Wait for the quality menu to appear
    await page.waitForSelector('.ytp-quality-menu', {timeout: 60000});

// // Get all menu items
//     const qualityMenuItems = await page.$$('.ytp-quality-menu .ytp-menuitem');
//
// // Iterate over the menu items to find the one that includes '360p'
//     for (let i = 0; i < qualityMenuItems.length; i++) {
//         const menuItem = qualityMenuItems[i];
//         const label = await menuItem.$eval('.ytp-menuitem-label', el => el.textContent);
//         if (label.includes('360p')) {
//             await menuItem.click();
//             break;
//         }
//     }
//
//     //play video
//     await videoPlayButton.click();

    const videoDuration = await page.$eval('video', (video) => video.duration);
    console.log('video duration: ', videoDuration);


    //wait for video to finish
    await wait(videoDuration*10000);

    await browser.close();

})();