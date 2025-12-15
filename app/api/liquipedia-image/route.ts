import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const itemName = searchParams.get('item');

    if (!itemName) {
        return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    try {
        // Liquipedia uses a consistent pattern: Cosmetic_icon_ItemName.png
        // Convert item name to Liquipedia format
        const slug = itemName.replace(/\s+/g, '_');
        const liquipediaUrl = `https://liquipedia.net/dota2/${slug}`;

        // Try to fetch and find the actual image URL
        const response = await fetch(liquipediaUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            cache: 'force-cache',
            next: { revalidate: 86400 }
        });

        if (response.ok) {
            const html = await response.text();

            // Look for the cosmetic icon image with the exact pattern
            const cosmeticIconMatch = html.match(/https:\/\/liquipedia\.net\/commons\/images\/[a-f0-9]\/[a-f0-9]{2}\/Cosmetic_icon_[^"'\s]+\.png/i);

            console.log(`Searching for ${itemName}, found cosmetic icon:`, !!cosmeticIconMatch);

            if (cosmeticIconMatch) {
                console.log(`✓ Found image for ${itemName}: ${cosmeticIconMatch[0]}`);
                return NextResponse.json({
                    imageUrl: cosmeticIconMatch[0],
                    liquipediaUrl,
                    itemName,
                });
            }

            // Fallback: try to find any image with the item name
            const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const anyImageRegex = new RegExp(`https:\\/\\/liquipedia\\.net\\/commons\\/images\\/[a-f0-9]\\/[a-f0-9]{2}\\/[^"'\\s]*${escapedSlug}[^"'\\s]*\\.png`, 'i');
            const anyImageMatch = html.match(anyImageRegex);

            console.log(`Fallback search for ${itemName}, found:`, !!anyImageMatch);

            if (anyImageMatch) {
                console.log(`✓ Fallback found image: ${anyImageMatch[0]}`);
                return NextResponse.json({
                    imageUrl: anyImageMatch[0],
                    liquipediaUrl,
                    itemName,
                });
            }
        }

        // If nothing found, return fallback
        return NextResponse.json({
            imageUrl: '/icon.png',
            liquipediaUrl,
            itemName,
        });
    } catch (error) {
        console.error('Error fetching from Liquipedia:', error);
        return NextResponse.json({
            imageUrl: '/icon.png',
            liquipediaUrl: `https://liquipedia.net/dota2/${itemName.replace(/\s+/g, '_')}`,
            itemName,
        });
    }
}
