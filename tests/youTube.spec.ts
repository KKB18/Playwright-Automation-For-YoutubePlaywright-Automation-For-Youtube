import { test, expect } from '@playwright/test';
import videoDate from '../test-Data/videoData.json'
import { captureStep } from '../Utilities/ScreenShot';
import { YouTubeSearchPage } from '../POM/youtubeSearchPage';
import { YouTubeVideoPage } from '../POM/youTubeVideoPage';


videoDate.forEach((video) => {
    
    // test.use({ viewport: { width: 1280, height: 720 }, browserName: 'chromium' });

    let shortTitle = video.Title.split(/\|/)[0].trim();
    test(`Verify video listing for ${video.TCID} : ${shortTitle}`, async ({ page }, testInfo) => {

        const searchPage = new YouTubeSearchPage(page);

        await test.step(`Video Search Validations`, async () => {
            await searchPage.navigateAndVerifyLoad("https://www.youtube.com");
            await searchPage.searchForVideo(`${video.Title}`);
            await searchPage.checkFirstVideoTitle(`${video.Title}`);
            await searchPage.checkFirstVideoThumbnailUrl(`${video.ImgUrl}`);
            await searchPage.checkFirstVideoDuration(`${video.Duration}`);
            await searchPage.checkFirstVideoThumbnailImage(`${shortTitle}`)
            await captureStep(page, testInfo, "After Search Validation");            
            await searchPage.clickVideoTitle(`${video.Title}`);
            console.log(`✅ Video Search Validations completed for ${video.Title}`);
        });
        const videoPage = new YouTubeVideoPage(page);

        await test.step(`Video Share Validations`, async () => {
            await videoPage.verifyVideoPageLoaded(`${video.Title}`);
            await videoPage.verifyVideoURL(`${video.URL}`);
            await captureStep(page, testInfo, "Before Share Validation");
            await videoPage.openShareDialog();
            await videoPage.copyLinkAndVerifyClipboardMessage("Link copied to clipboard");
            console.log(`✅ Video Share Validations completed for ${video.Title}`);
        });
        await captureStep(page, testInfo, "After Share Validation");

    });
});