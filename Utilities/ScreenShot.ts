import { Page, TestInfo } from "@playwright/test";

export async function captureStep(page: Page, testInfo: TestInfo, stepName?: string) {
    const screenshot = await page.screenshot();
    await testInfo.attach(stepName || "Generic Screen Shot", { body: screenshot, contentType: 'image/png' });
}

