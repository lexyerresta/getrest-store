const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Read current mapping
const mappingPath = path.join(__dirname, '../public/item-images.json');
const itemsDir = path.join(__dirname, '../public/items');

async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }

            const fileStream = require('fs').createWriteStream(filepath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });

            fileStream.on('error', (err) => {
                require('fs').unlink(filepath, () => { });
                reject(err);
            });
        }).on('error', reject);
    });
}

async function downloadAllImages() {
    console.log('\n📥 Starting to download images...\n');

    // Ensure items directory exists
    try {
        await fs.mkdir(itemsDir, { recursive: true });
    } catch (err) {
        // Directory might already exist
    }

    // Read mapping
    const mappingContent = await fs.readFile(mappingPath, 'utf-8');
    const mapping = JSON.parse(mappingContent);

    const newMapping = {};
    let downloadedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    const items = Object.entries(mapping);

    for (let i = 0; i < items.length; i++) {
        const [itemName, imageUrl] = items[i];

        console.log(`[${i + 1}/${items.length}] ${itemName}...`);

        // Skip if already using local icon
        if (imageUrl === '/icon.png') {
            console.log(`  ⏭️  No image available`);
            newMapping[itemName] = '/icon.png';
            skippedCount++;
            continue;
        }

        // Skip if already a local path
        if (imageUrl.startsWith('/items/')) {
            console.log(`  ✓ Already local`);
            newMapping[itemName] = imageUrl;
            skippedCount++;
            continue;
        }

        try {
            // Extract filename from URL
            const urlFilename = imageUrl.split('/').pop();
            const filename = urlFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
            const localPath = path.join(itemsDir, filename);
            const publicPath = `/items/${filename}`;

            // Download image
            await downloadImage(imageUrl, localPath);

            console.log(`  ✓ Downloaded: ${filename}`);
            newMapping[itemName] = publicPath;
            downloadedCount++;

            // Small delay to be nice to server
            await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            newMapping[itemName] = '/icon.png';
            errorCount++;
        }
    }

    // Save updated mapping
    await fs.writeFile(mappingPath, JSON.stringify(newMapping, null, 2));

    console.log(`\n\n✅ DONE!`);
    console.log(`📊 Downloaded: ${downloadedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`💾 Updated mapping saved!\n`);
}

downloadAllImages().catch(console.error);
