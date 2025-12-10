import { Page, expect, Locator, test } from '@playwright/test';

export class YouTubeVideoPage {
    private readonly page: Page;
    private readonly shareButton: Locator;
    private readonly shareDialog: Locator;
    private readonly copyButton: Locator;
    private readonly toastContainer: Locator;
    private readonly videoTitleLocator: Locator;
    private readonly playPauseButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.shareButton = this.page.locator(`//ancestor::div[@id="above-the-fold"]//button[@aria-label="Share"]`);
        this.shareDialog = this.page.locator(`//div[@id="scrollable"]`);
        this.copyButton = this.shareDialog.locator(`//button[@aria-label="Copy"]`);
        this.toastContainer = this.page.locator(`#toast>div>#text`);
        this.videoTitleLocator = this.page.locator(`//div[@id="title"]//h1/yt-formatted-string`);
        this.playPauseButton = this.page.locator(`button.ytp-play-button`);
    }

    async verifyVideoPageLoaded(expectedTitle: string): Promise<void> {
        let actualTitle: string | null = "";
        try {
            await this.playPauseButton.waitFor({ state: "attached", timeout: 10000 });
            await this.playPauseButton.click();
            await this.page.locator(`#subscribe-button-shape`).waitFor({ state: "attached", timeout: 2000 });// Let the video play for 2 seconds
            actualTitle = await this.videoTitleLocator.innerText();
            expect(actualTitle).toEqual(expectedTitle);
            console.log(`✅ Video with title "${expectedTitle}" confirmed visible.`);
        }
        catch (e) {
            console.error(`❌ ERROR in Video Title Expected: "${expectedTitle}" and Received: "${actualTitle}"`);
            throw e;
        }
    }

    async verifyVideoURL(expectedURL: string): Promise<void> {
        let videoURL = await this.page.url();
        try {
            expect(videoURL).toEqual(expectedURL);
            console.log(`✅ URL verified as "${expectedURL}".`);
        }
        catch (e) {
            console.error(`❌ ERROR in Video Url Expected: "${expectedURL}" and Received: "${videoURL}"`);
            throw e;
        }
    }

    async openShareDialog(): Promise<void> {
        try {
            await this.shareButton.click();
            await this.shareDialog.waitFor({ state: "visible", timeout: 10000 });
            console.log(`✅ Share Dialog opened successfully.`);
        }
        catch (e) {
            console.error(`❌ ERROR in Share Dialog opening`);
            throw e;
        }
    }

    async copyLinkAndVerifyClipboardMessage(expectedMessage: string): Promise<void> {
        let actualToastMessage: string | null = "";
        try {
            await Promise.all([
                this.toastContainer.isVisible(),
                this.copyButton.click(),
            ]);
            actualToastMessage = await this.toastContainer.innerText();
            expect(actualToastMessage).toEqual(expectedMessage);
            console.log(`✅ Link copied and "${actualToastMessage}" message verified.`);
        }
        catch (e) {
            console.error(`❌ ERROR in toast message Expected: "${expectedMessage}" and Received: "${actualToastMessage}"`);
            throw e;
        }
    }
}