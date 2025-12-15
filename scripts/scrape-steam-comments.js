const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeSteamComments() {
    let browser = null;

    try {
        console.log('🚀 Starting Steam Comments Scraper...');
        console.log(`📅 Started at: ${new Date().toLocaleString()}`);

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('📄 Navigating to Steam profile...');
        await page.goto('https://steamcommunity.com/id/GetRestSTORE/allcomments', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        // Wait for comments to load
        await page.waitForSelector('.commentthread_comment', { timeout: 10000 });

        console.log('📜 Scrolling and loading all comments...');

        // Scroll and click "Load More" until all comments loaded
        let previousCount = 0;
        let currentCount = 0;
        let attempts = 0;
        const maxAttempts = 30; // Increased for ~200 comments

        while (attempts < maxAttempts) {
            // Count current comments
            currentCount = await page.evaluate(() => {
                return document.querySelectorAll('.commentthread_comment').length;
            });

            if (attempts % 5 === 0) {
                console.log(`  📊 Found ${currentCount} comments so far...`);
            }

            // Try to click "Load More" button
            const loadMoreClicked = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('a, button, div'));
                const loadMoreBtn = buttons.find(btn =>
                    btn.textContent?.toLowerCase().includes('load more') ||
                    btn.textContent?.toLowerCase().includes('show more') ||
                    btn.className?.includes('morelink')
                );

                if (loadMoreBtn) {
                    loadMoreBtn.click();
                    return true;
                }
                return false;
            });

            if (loadMoreClicked) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for load
            }

            // Scroll to bottom to trigger lazy loading
            await page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });

            await new Promise(resolve => setTimeout(resolve, 1500));

            // If no new comments loaded, we're done
            if (currentCount === previousCount && !loadMoreClicked) {
                console.log('  ✓ All comments loaded!');
                break;
            }

            previousCount = currentCount;
            attempts++;
        }

        console.log('🔍 Parsing comments...');

        // Extract all comments
        const allComments = await page.evaluate(() => {
            const comments = [];
            const commentElements = document.querySelectorAll('.commentthread_comment');

            commentElements.forEach((element) => {
                const author = element.querySelector('.commentthread_author_link')?.textContent?.trim() || '';
                const avatarImg = element.querySelector('.playerAvatar img');
                const avatar = avatarImg?.src || '/icon.png';
                const commentText = element.querySelector('.commentthread_comment_text')?.textContent?.trim() || '';
                const timestampEl = element.querySelector('.commentthread_comment_timestamp');
                const timestamp = timestampEl?.getAttribute('data-timestamp');

                // Calculate relative time
                let dateText = 'Recently';
                if (timestamp) {
                    const date = new Date(parseInt(timestamp) * 1000);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - date.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 0) {
                        dateText = 'Today';
                    } else if (diffDays === 1) {
                        dateText = '1 day ago';
                    } else if (diffDays < 7) {
                        dateText = `${diffDays} days ago`;
                    } else if (diffDays < 30) {
                        const weeks = Math.floor(diffDays / 7);
                        dateText = `${weeks} week${weeks > 1 ? 's' : ''} ago`;
                    } else if (diffDays < 365) {
                        const months = Math.floor(diffDays / 30);
                        dateText = `${months} month${months > 1 ? 's' : ''} ago`;
                    } else {
                        const years = Math.floor(diffDays / 365);
                        dateText = `${years} year${years > 1 ? 's' : ''} ago`;
                    }
                }

                if (author && commentText) {
                    comments.push({
                        author,
                        avatar,
                        comment: commentText,
                        date: dateText,
                        timestamp: timestamp ? parseInt(timestamp) : null
                    });
                }
            });

            return comments;
        });

        await browser.close();
        browser = null;

        console.log(`✅ Successfully scraped ${allComments.length} comments`);

        // Save to JSON file
        const outputPath = path.join(__dirname, '../public/steam-comments.json');
        const outputData = {
            lastUpdated: new Date().toISOString(),
            totalComments: allComments.length,
            comments: allComments
        };

        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

        console.log(`💾 Saved to: ${outputPath}`);
        console.log(`📊 Total: ${allComments.length} comments`);
        console.log(`🕐 Completed at: ${new Date().toLocaleString()}`);

        return {
            success: true,
            total: allComments.length,
            file: outputPath
        };

    } catch (error) {
        console.error('❌ Error scraping Steam comments:', error);

        if (browser) {
            await browser.close();
        }

        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    scrapeSteamComments()
        .then(result => {
            console.log('\n✨ Scraping completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Scraping failed:', error.message);
            process.exit(1);
        });
}

module.exports = { scrapeSteamComments };
