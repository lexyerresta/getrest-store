// Script to generate mapping for item images
// This creates a JSON file mapping item names to their image filenames

const fs = require('fs');
const path = require('path');

// Read prices.json
const pricesPath = path.join(__dirname, '../public/prices.json');
const prices = JSON.parse(fs.readFileSync(pricesPath, 'utf-8'));

// Create slug from item name
function createSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

// Generate image mapping
const imageMapping = {};

prices.forEach(item => {
    const slug = createSlug(item.name);
    // Map to generated image or fallback
    imageMapping[item.name] = `/items/${slug}.png`;
});

// Save mapping
const outputPath = path.join(__dirname, '../public/item-images.json');
fs.writeFileSync(outputPath, JSON.stringify(imageMapping, null, 2));

console.log(`Generated mapping for ${Object.keys(imageMapping).length} items`);
console.log(`Saved to: ${outputPath}`);
