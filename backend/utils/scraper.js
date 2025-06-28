// Always use puppeteer-core
const puppeteer = require('puppeteer-core');
// Only require chrome-aws-lambda in production
const chromium = process.env.NODE_ENV === 'production'
    ? require('chrome-aws-lambda')
    : null;

/**
 * Scrapes a product's name and price from a given URL.
 * @param {string} url The URL of the product to scrape.
 * @returns {Promise<{name: string, price: number, imageUrl: string}>} Object with product details.
 */
async function scrapeProduct(url) {
    let browser;
    try {
        const launchOptions = process.env.NODE_ENV === 'production'
            ? { // Options for Render deployment (uses chrome-aws-lambda)
                args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath,
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            }
            : { // Options for local development (relies on local system Chrome/Chromium installation)
                headless: true, // Use headless mode for local testing
                executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // OPTIONAL: Only if puppeteer-core can't find Chrome automatically
                args: ['--no-sandbox', '--disable-setuid-sandbox'] // Good practice even locally
            };

        browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // --- UPDATED SELECTORS FOR AMAZON.CA ---
        const nameSelector = '#productTitle';
        const priceSelector = 'span.a-offscreen';
        const imageSelector = '#landingImage';

        const name = await page.evaluate(selector => {
            const element = document.querySelector(selector);
            return element ? element.innerText.trim() : null;
        }, nameSelector);

        const priceText = await page.evaluate(selector => {
            const element = document.querySelector(selector);
            return element ? (element.innerText || element.textContent).trim() : null;
        }, priceSelector);

        // Clean and parse the price (remove currency symbols, commas, convert to number)
        const price = priceText ? parseFloat(priceText.replace(/[^0-9.,]/g, '').replace(',', '.')) : null;

        const imageUrl = await page.evaluate(selector => {
            const element = document.querySelector(selector);
            return element ? element.src : null;
        }, imageSelector);

        // --- End of customization area ---

        if (!name || !price) {
            console.warn(`Could not scrape name or price from ${url}. Name: ${name}, Price: ${priceText}`);
            throw new Error(`Failed to scrape essential data from ${url}. Please check selectors.`);
        }

        return { name, price, imageUrl };

    } catch (error) {
        console.error(`Scraping error for ${url}:`, error.message);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { scrapeProduct };