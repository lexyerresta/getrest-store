const fs = require('fs');
const path = require('path');

// Read prices.json
const pricesPath = path.join(__dirname, '../public/prices.json');
const prices = JSON.parse(fs.readFileSync(pricesPath, 'utf-8'));

// Get image URL using MediaWiki API
async function getImageUrl(itemName) {
    try {
        const fileName = `Cosmetic_icon_${itemName.replace(/\s+/g, '_')}.png`;

        // Use MediaWiki API to get file info
        const apiUrl = `https://liquipedia.net/dota2/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&format=json`;

        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (!response.ok) {
            console.log(`❌ ${itemName}: API error`);
            return null;
        }

        const data = await response.json();
        const pages = data.query?.pages;

        if (!pages) {
            console.log(`⚠ ${itemName}: No pages found`);
            return null;
        }

        const page = Object.values(pages)[0];

        if (page.missing) {
            console.log(`⚠ ${itemName}: File not found`);
            return null;
        }

        const imageUrl = page.imageinfo?.[0]?.url;

        if (imageUrl) {
            console.log(`✓ ${itemName}: ${imageUrl}`);
            return imageUrl;
        }

        console.log(`⚠ ${itemName}: No image URL`);
        return null;
    } catch (error) {
        console.error(`❌ ${itemName}: Error -`, error.message);
        return null;
    }
}

// Main function to scrape all items
async function scrapeAllImages() {
    console.log(`\n🚀 Starting to fetch ${prices.length} items using MediaWiki API...\n`);

    const imageMapping = {};
    const batchSize = 10; // API is faster, can process more

    for (let i = 0; i < prices.length; i += batchSize) {
        const batch = prices.slice(i, i + batchSize);

        console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(prices.length / batchSize)}...`);

        await Promise.all(
            batch.map(async (item) => {
                const imageUrl = await getImageUrl(item.name);
                imageMapping[item.name] = imageUrl || '/icon.png';
            })
        );

        // Small delay between batches
        if (i + batchSize < prices.length) {
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }

    // Save to file
    const outputPath = path.join(__dirname, '../public/item-images.json');
    fs.writeFileSync(outputPath, JSON.stringify(imageMapping, null, 2));

    // Stats
    const foundCount = Object.values(imageMapping).filter(url => url !== '/icon.png').length;
    const totalCount = Object.keys(imageMapping).length;

    console.log(`\n\n✅ DONE!`);
    console.log(`📊 Found images for ${foundCount}/${totalCount} items (${Math.round(foundCount / totalCount * 100)}%)`);
    console.log(`💾 Saved to: ${outputPath}\n`);
}

// Run
scrapeAllImages().catch(console.error);
