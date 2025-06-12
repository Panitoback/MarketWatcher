// En backend/utils/scraper.js

const puppeteer = require('puppeteer');

async function scrapeProduct(url) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // --- UPDATED SELECTORS FOR AMAZON.CA ---
        const nameSelector = '#productTitle'; // Confirmed from your screenshot
        const priceSelector = 'span.a-offscreen'; // Confirmed from your screenshot
        const imageSelector = '#landingImage'; // Confirmed from your screenshot

        const name = await page.evaluate(selector => {
            const element = document.querySelector(selector);
            return element ? element.innerText.trim() : null;
        }, nameSelector);

        const priceText = await page.evaluate(selector => {
            const element = document.querySelector(selector);
            // Using innerText || textContent for robustness, as a.offscreen might sometimes have empty innerText
            return element ? (element.innerText || element.textContent).trim() : null; // **THIS LINE IS CRUCIAL**
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