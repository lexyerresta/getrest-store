const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Read prices.json
const pricesPath = path.join(__dirname, '../public/prices.json');
const prices = JSON.parse(fs.readFileSync(pricesPath, 'utf-8'));

// Helper to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeWithPuppeteer() {
    console.log('\n🚀 Starting Puppeteer browser...\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const imageMapping = {};
    let foundCount = 0;

    console.log(`Processing ${prices.length} items with 3-second delay between each...\n`);
    console.log(`⏱️  Estimated time: ~${Math.round(prices.length * 3 / 60)} minutes\n`);

    for (let i = 0; i < prices.length; i++) {
        const item = prices[i];
        const itemName = item.name;

        try {
            const slug = itemName.replace(/\s+/g, '_');
            const url = `https://liquipedia.net/dota2/${slug}`;

            console.log(`[${i + 1}/${prices.length}] ${itemName}...`);

            // Navigate to page
            const response = await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 15000
            });

            if (!response || response.status() === 429) {
                console.log(`  ⏳ Rate limited! Waiting 30 seconds...`);
                await sleep(30000);
                // Retry once
                const retryResponse = await page.goto(url, {
                    waitUntil: 'networkidle2',
                    timeout: 15000
                });
                if (!retryResponse || retryResponse.status() !== 200) {
                    console.log(`  ❌ Still failed after retry`);
                    imageMapping[itemName] = '/icon.png';
                    continue;
                }
            } else if (response.status() !== 200) {
                console.log(`  ❌ Page not found (${response?.status()})`);
                imageMapping[itemName] = '/icon.png';
                continue;
            }

            // Wait for images to load
            await sleep(1000);

            // Try to find image using different selectors
            const imageUrl = await page.evaluate(() => {
                // Method 1: Look for cosmetic icon in page
                const cosmeticImg = document.querySelector('img[src*="Cosmetic_icon"]');
                if (cosmeticImg) {
                    return cosmeticImg.src;
                }

                // Method 2: Look in infobox
                const infoboxImg = document.querySelector('.infobox-image img');
                if (infoboxImg && infoboxImg.src) {
                    return infoboxImg.src;
                }

                // Method 3: Look for any liquipedia image
                const images = Array.from(document.querySelectorAll('img[src*="liquipedia.net/commons/images"]'));
                if (images.length > 0) {
                    // Filter for actual item images (not icons/logos)
                    const itemImg = images.find(img =>
                        img.src.includes('Cosmetic_icon') ||
                        img.width > 100
                    );
                    if (itemImg) {
                        return itemImg.src;
                    }
                }

                return null;
            });

            if (imageUrl) {
                console.log(`  ✓ ${imageUrl.substring(imageUrl.lastIndexOf('/') + 1)}`);
                imageMapping[itemName] = imageUrl;
                foundCount++;
            } else {
                console.log(`  ⚠ No image found`);
                imageMapping[itemName] = '/icon.png';
            }

        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            imageMapping[itemName] = '/icon.png';
        }

        // IMPORTANT: 3 second delay to avoid rate limiting
        await sleep(3000);
    }

    await browser.close();

    // Save to file
    const outputPath = path.join(__dirname, '../public/item-images.json');
    fs.writeFileSync(outputPath, JSON.stringify(imageMapping, null, 2));

    console.log(`\n\n✅ DONE!`);
    console.log(`📊 Found images for ${foundCount}/${prices.length} items (${Math.round(foundCount / prices.length * 100)}%)`);
    console.log(`💾 Saved to: ${outputPath}\n`);
}

// Run
scrapeWithPuppeteer().catch(console.error);
