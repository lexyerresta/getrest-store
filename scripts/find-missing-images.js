const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Read current mapping
const mappingPath = path.join(__dirname, '../public/item-images.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

// Get items without images
const itemsWithoutImages = Object.entries(mapping)
    .filter(([name, url]) => url === '/icon.png')
    .map(([name]) => name);

console.log(`\n🔍 Found ${itemsWithoutImages.length} items without images\n`);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function tryMultipleStrategies(page, itemName) {
    const strategies = [
        // Strategy 1: Direct Liquipedia with exact name
        async () => {
            const slug = itemName.replace(/\s+/g, '_');
            const url = `https://liquipedia.net/dota2/File:Cosmetic_icon_${slug}.png`;
            const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
            if (response && response.status() === 200) {
                await sleep(500);
                const imageUrl = await page.evaluate(() => {
                    const img = document.querySelector('.fullMedia img, .fullImageLink img');
                    return img ? img.src : null;
                });
                return imageUrl;
            }
            return null;
        },

        // Strategy 2: Search on Liquipedia
        async () => {
            const searchUrl = `https://liquipedia.net/dota2/index.php?search=${encodeURIComponent(itemName)}`;
            const response = await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
            if (response && response.status() === 200) {
                await sleep(500);
                const imageUrl = await page.evaluate(() => {
                    const img = document.querySelector('.infobox img[src*="Cosmetic_icon"]');
                    return img ? img.src : null;
                });
                return imageUrl;
            }
            return null;
        },

        // Strategy 3: Try variant names (without special chars)
        async () => {
            const cleanName = itemName.replace(/['']/g, '').replace(/\s+/g, '_');
            const url = `https://liquipedia.net/dota2/File:Cosmetic_icon_${cleanName}.png`;
            const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
            if (response && response.status() === 200) {
                await sleep(500);
                const imageUrl = await page.evaluate(() => {
                    const img = document.querySelector('.fullMedia img, .fullImageLink img');
                    return img ? img.src : null;
                });
                return imageUrl;
            }
            return null;
        },

        // Strategy 4: MediaWiki API
        async () => {
            const fileName = `Cosmetic_icon_${itemName.replace(/\s+/g, '_')}.png`;
            const apiUrl = `https://liquipedia.net/dota2/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&format=json`;

            const response = await page.goto(apiUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
            if (response && response.status() === 200) {
                const text = await page.evaluate(() => document.body.textContent);
                try {
                    const data = JSON.parse(text);
                    const pages = data.query?.pages;
                    if (pages) {
                        const page = Object.values(pages)[0];
                        return page.imageinfo?.[0]?.url || null;
                    }
                } catch (e) {
                    return null;
                }
            }
            return null;
        }
    ];

    for (let i = 0; i < strategies.length; i++) {
        try {
            const result = await strategies[i]();
            if (result && !result.includes('placeholder')) {
                return result;
            }
        } catch (error) {
            // Continue to next strategy
        }
    }

    return null;
}

async function findMissingImages() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const newMapping = { ...mapping };
    let foundCount = 0;

    for (let i = 0; i < itemsWithoutImages.length; i++) {
        const itemName = itemsWithoutImages[i];
        console.log(`[${i + 1}/${itemsWithoutImages.length}] ${itemName}...`);

        try {
            const imageUrl = await tryMultipleStrategies(page, itemName);

            if (imageUrl) {
                console.log(`  ✓ Found: ${imageUrl.substring(imageUrl.lastIndexOf('/') + 1).substring(0, 50)}...`);
                newMapping[itemName] = imageUrl;
                foundCount++;
            } else {
                console.log(`  ❌ Not found`);
            }

            await sleep(2000); // 2 second delay
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
        }
    }

    await browser.close();

    // Save updated mapping
    fs.writeFileSync(mappingPath, JSON.stringify(newMapping, null, 2));

    console.log(`\n\n✅ DONE!`);
    console.log(`📊 Found ${foundCount} new images`);
    console.log(`📊 Still missing: ${itemsWithoutImages.length - foundCount}`);
    console.log(`💾 Mapping updated!\n`);

    return foundCount;
}

findMissingImages().catch(console.error);
