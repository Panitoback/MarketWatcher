console.log('priceScraperJob.js file loaded!'); 
const cron = require('node-cron');
const Product = require('../models/Product');
const { scrapeProduct } = require('../utils/scraper');
const { sendPriceDropEmail } = require('../utils/mailer'); 

/**
 * Schedules a job to periodically scrape product prices.
 */
const startPriceScrapingJob = () => {
    
    cron.schedule('*/1 * * * *', async () => { // Changed to every minute for easier testing
        console.log('--- Running scheduled price scraping job ---');
        const products = await Product.find({ status: 'active' }); // Only scrape active products

        if (products.length === 0) {
            console.log('No active products to scrape. Skipping job.');
            return; // Exit if no products to scrape
        }

        for (const product of products) {
            try {
                console.log(`Scraping ${product.name} from ${product.url}`);
                const scrapedData = await scrapeProduct(product.url);

                // Check if scrapedData.price exists and is a valid number
                if (scrapedData.price && typeof scrapedData.price === 'number') {
                    if (scrapedData.price !== product.currentPrice) {
                        console.log(`Price change detected for ${product.name}: ${product.currentPrice} -> ${scrapedData.price}`);

                        // Update product's current price and last scraped time
                        product.currentPrice = scrapedData.price;
                        product.lastScrapedAt = new Date();
                        await product.save();

                        if (scrapedData.price <= product.targetPrice) { // If new price is at or below target
                            console.log(`Price drop detected for ${product.name}! Notifying user.`);
                            const User = require('../models/User'); 
                            const user = await User.findById(product.userId);
                            if (user && user.email) {
                                await sendPriceDropEmail(user.email, product.name, scrapedData.price, product.url);
                            } else {
                                console.warn(`User for product ${product.name} not found or has no email.`);
                            }
                        }
                    } else {
                        console.log(`No price change for ${product.name}. Current: ${product.currentPrice}`);
                        // Just update lastScrapedAt even if price didn't change
                        product.lastScrapedAt = new Date();
                        await product.save();
                    }
                } else {
                    console.warn(`Scraped price for <span class="math-inline">\{product\.name\} \(</span>{product.url}) is invalid: ${scrapedData.price}. Skipping update.`);
                    // Optionally set status to error, but for now just warn
                }

            } catch (error) {
                console.error(`Failed to scrape/update product <span class="math-inline">\{product\.name\} \(</span>{product.url}):`, error.message);
                // product.status = 'error';
                // await product.save();
            }
        }
        console.log('--- Scheduled price scraping job finished ---');
    });
};

module.exports = { startPriceScrapingJob };