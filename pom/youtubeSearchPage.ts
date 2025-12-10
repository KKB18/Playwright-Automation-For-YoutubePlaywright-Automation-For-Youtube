// pages/YouTubeSearchPage.ts
import { Locator, Page, expect } from '@playwright/test';

export class YouTubeSearchPage {
    private readonly page: Page;
    private readonly searchInput: Locator;
    private readonly searchButton: Locator;
    private readonly initialLoadCheck: Locator;
    private readonly firstVideoResult: Locator;

    constructor(page: Page) {
        this.page = page;
        this.searchInput = this.page.getByPlaceholder("Search");
        this.searchButton = this.page.getByTitle("Search");
        this.initialLoadCheck = this.page.getByLabel("Try searching to get started");
        this.firstVideoResult = this.page.locator(`//ytd-video-renderer[contains(@class,"ytd-item-section-renderer")][1]`).first();
    }

    async navigateAndVerifyLoad(url: string): Promise<void> {
        try {
            await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
            await expect(this.initialLoadCheck).toBeVisible();
            console.log(`✅ Navigation to "${url}" Completed Successfully.`);
        }
        catch (e) {
            console.error(`❌ ERROR in Navigating to URL - "${url}"`);
            throw e;
        }
    }

    async searchForVideo(title: string): Promise<void> {
        try {
            await this.searchInput.fill(title);
            await this.searchButton.click();
            await this.page.waitForLoadState('networkidle', { timeout: 5000 });
            await this.firstVideoResult.first().waitFor({ state: "attached", timeout: 5000 });
            console.log(`✅ Video with Title : "${title}" Searched Successfully.`);
        }
        catch (e) {
            console.error(`❌ ERROR in Searching Video with Title: "${title}"`);
            throw e;
        }
    }

    async checkFirstVideoTitle(expectedTitle: string): Promise<void> {
        let actualTitle: string | null = "";
        try {
            const videoTitleLocator = this.firstVideoResult.locator(`//a[@id="video-title"]`);
            actualTitle = await videoTitleLocator.getAttribute("title");
            expect(actualTitle).toEqual(expectedTitle)
            console.log(`✅ Video with title :"${expectedTitle}" visible`);
        }
        catch (e) {
            console.error(`❌ ERROR in Video title Expected : "${expectedTitle}" and Received: "${actualTitle}"`);
            throw e;
        }
    }

    async checkFirstVideoDuration(expectedDuration: string): Promise<void> {
        let actualDuration: string | null = "";
        try {
            const videoDurationLocator = this.firstVideoResult.locator(`//div[@id="overlays"]//div[@class="yt-badge-shape__text"]`);
            actualDuration = await videoDurationLocator.innerText();
            expect(actualDuration).toEqual(expectedDuration)
            console.log(`✅ Video with duration "${expectedDuration}" visible`);
        }
        catch (e) {
            console.error(`❌ ERROR in Video Duration Expected : "${expectedDuration}" and Received: "${actualDuration}"`);
            throw e;
        }
    }

    async checkFirstVideoThumbnailUrl(expectedUrl: string): Promise<void> {
        let actualImgUrl: string | null = "";
        try {
            const videoThumbnailImgUrlLocator = this.firstVideoResult.locator(`//a[@id="thumbnail"]//img`);
            actualImgUrl = await videoThumbnailImgUrlLocator.getAttribute("src");
            expect(actualImgUrl).toEqual(expectedUrl)
            console.log(`✅ Video with Thumbnail Url "${expectedUrl}" visible`);
        }
        catch (e) {
            console.error(`❌ ERROR in Video Thumbnail Url Expected : "${expectedUrl}" and Received: "${actualImgUrl}"`);
            throw e;
        }
    }

    async checkFirstVideoThumbnailImage(fileName: string): Promise<void> {
        try {
            const videoThumbnailImgLocator = this.firstVideoResult.locator(`//a[@id="thumbnail"]//img`);
            await expect(videoThumbnailImgLocator).toHaveScreenshot(`${fileName}.png`, { animations: 'disabled', maxDiffPixels: 10, threshold: 0.05 });
            console.log(`✅ Successful Video Thumbnail validation against "${fileName}.png"`);
        }
        catch (e) {
            console.error(`❌ ERROR in Video thumbnail validation against "${fileName}.png"`);
            throw e;
        }
    }

    async clickVideoTitle(title: string): Promise<void> {
        try {
            const videoLocator = this.firstVideoResult.locator(`//a[@id="thumbnail"]//img`);
            await videoLocator.click();
            await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
            console.log(`✅ Video with Title: "${title}" opened successfully.`);
        }
        catch (e) {
            console.error(`❌ ERROR in opening Video with title "${title}"`);
            throw e;
        }
    }
}