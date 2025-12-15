const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Read prices.json
const pricesPath = path.join(__dirname, '../public/prices.json');
const prices = JSON.parse(fs.readFileSync(pricesPath, 'utf-8'));

// Helper to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeFromDotaWiki() {
    console.log('\n🚀 Starting Puppeteer browser...\n');
    console.log('📖 Scraping from Dota 2 Wiki (Fandom)...\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const imageMapping = {};
    let foundCount = 0;

    console.log(`Processing ${prices.length} items...\n`);

    for (let i = 0; i < prices.length; i++) {
        const item = prices[i];
        const itemName = item.name;

        try {
            // Try Dota 2 Wiki (Fandom)
            const slug = itemName.replace(/\s+/g, '_');
            const wikiUrl = `https://dota2.fandom.com/wiki/${encodeURIComponent(slug)}`;

            console.log(`[${i + 1}/${prices.length}] ${itemName}...`);

            const response = await page.goto(wikiUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 10000
            });

            if (!response || response.status() !== 200) {
                console.log(`  ⚠ Wiki page not found, trying alternative...`);

                // Try Google Images search as fallback
                const searchQuery = encodeURIComponent(`dota 2 ${itemName} cosmetic`);
                const googleUrl = `https://www.google.com/search?tbm=isch&q=${searchQuery}`;

                await page.goto(googleUrl, {
                    waitUntil: 'domcontentloaded',
                    timeout: 10000
                });

                await sleep(500);

                // Get first image from Google
                const googleImage = await page.evaluate(() => {
                    const img = document.querySelector('img[data-src]');
                    return img ? img.getAttribute('data-src') : null;
                });

                if (googleImage && !googleImage.includes('gstatic')) {
                    console.log(`  ✓ Found via Google`);
                    imageMapping[itemName] = googleImage;
                    foundCount++;
                } else {
                    console.log(`  ❌ No image found`);
                    imageMapping[itemName] = '/icon.png';
                }

                await sleep(1000);
                continue;
            }

            await sleep(500);

            // Try to find image on Wiki
            const imageUrl = await page.evaluate(() => {
                // Method 1: Look for infobox image
                const infoboxImg = document.querySelector('.infobox img, .portable-infobox img');
                if (infoboxImg && infoboxImg.src && !infoboxImg.src.includes('placeholder')) {
                    return infoboxImg.src;
                }

                // Method 2: Look for gallery images
                const galleryImg = document.querySelector('.wikia-gallery-item img, .article-thumb img');
                if (galleryImg && galleryImg.src) {
                    return galleryImg.src;
                }

                // Method 3: Any image in main content
                const contentImg = document.querySelector('.mw-content-text img');
                if (contentImg && contentImg.src && contentImg.width > 100) {
                    return contentImg.src;
                }

                return null;
            });

            if (imageUrl) {
                // Convert to full size image URL if it's a thumbnail
                const fullUrl = imageUrl.replace(/\/revision\/.*$/, '').replace(/\/scale-to-width-down\/\d+/, '');
                console.log(`  ✓ ${fullUrl.substring(fullUrl.lastIndexOf('/') + 1).substring(0, 50)}...`);
                imageMapping[itemName] = fullUrl;
                foundCount++;
            } else {
                console.log(`  ⚠ No image found`);
                imageMapping[itemName] = '/icon.png';
            }

        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            imageMapping[itemName] = '/icon.png';
        }

        // 1 second delay (Fandom is more permissive)
        await sleep(1000);
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
scrapeFromDotaWiki().catch(console.error);
