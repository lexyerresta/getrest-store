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

        console.log('📄 Navigating to Steam profile comments...');
        await page.goto('https://steamcommunity.com/id/GetRestSTORE/allcomments', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        // Wait for comments to load
        await page.waitForSelector('.commentthread_comment', { timeout: 10000 });

        console.log('📊 Scraping all comment pages...');

        // Steam shows ~6 comments per page = 193/6 ≈ 33 pages
        // We'll try up to 35 pages and stop when no comments found
        const maxPages = 35;
        let allComments = [];
        let emptyPages = 0;
        let totalPagesScraped = 0;

        // Scrape each page
        for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
            console.log(`\n📖 Scraping page ${currentPage}...`);

            // Navigate to specific page
            const pageUrl = `https://steamcommunity.com/id/GetRestSTORE/allcomments?ctp=${currentPage}`;
            await page.goto(pageUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });

            // Wait a bit for comments to load
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Check if comments exist
            const hasComments = await page.evaluate(() => {
                return document.querySelectorAll('.commentthread_comment').length > 0;
            });

            if (!hasComments) {
                emptyPages++;
                console.log(`  ⚠️ No comments found on page ${currentPage}`);

                // If 2 consecutive empty pages, we're done
                if (emptyPages >= 2) {
                    console.log(`  ✓ Reached end of comments at page ${currentPage - 1}`);
                    break;
                }
                continue;
            }

            emptyPages = 0; // Reset counter
            totalPagesScraped = currentPage;

            // Extract comments from current page
            const pageComments = await page.evaluate(() => {
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

            console.log(`  ✓ Found ${pageComments.length} comments on page ${currentPage}`);
            allComments = allComments.concat(pageComments);

            // Small delay between pages to be respectful
            if (currentPage < maxPages) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }

        await browser.close();
        browser = null;

        console.log(`\n✅ Successfully scraped ${allComments.length} comments from ${totalPagesScraped} pages`);

        // Save to JSON file
        const outputPath = path.join(__dirname, '../public/steam-comments.json');
        const outputData = {
            lastUpdated: new Date().toISOString(),
            totalComments: allComments.length,
            totalPages: totalPagesScraped,
            comments: allComments
        };

        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

        console.log(`💾 Saved to: ${outputPath}`);
        console.log(`📊 Total: ${allComments.length} comments`);
        console.log(`📄 Pages: ${totalPagesScraped}`);
        console.log(`🕐 Completed at: ${new Date().toLocaleString()}`);

        return {
            success: true,
            total: allComments.length,
            pages: totalPagesScraped,
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
            console.log(`📈 Total comments: ${result.total}`);
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Scraping failed:', error.message);
            process.exit(1);
        });
}

module.exports = { scrapeSteamComments };
