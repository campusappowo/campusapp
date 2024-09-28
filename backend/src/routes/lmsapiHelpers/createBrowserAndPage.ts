import puppeteer, { Browser, Page } from "puppeteer";

export default async function createBrowserAndPage(): Promise<{ browser: Browser, page: Page }> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    return { browser, page };
};