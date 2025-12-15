import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        const steamProfileUrl = 'https://steamcommunity.com/id/GetRestSTORE/allcomments'

        const response = await fetch(steamProfileUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        })

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch Steam comments' }, { status: 500 })
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        const allComments: any[] = []

        // Parse all Steam comments
        $('.commentthread_comment').each((index, element) => {
            const $comment = $(element)

            const author = $comment.find('.commentthread_author_link').text().trim()
            const avatar = $comment.find('.playerAvatar img').attr('src') || '/icon.png'
            const commentText = $comment.find('.commentthread_comment_text').text().trim()
            const timestamp = $comment.find('.commentthread_comment_timestamp').attr('data-timestamp')

            // Calculate relative time
            let dateText = 'Recently'
            if (timestamp) {
                const date = new Date(parseInt(timestamp) * 1000)
                const now = new Date()
                const diffTime = Math.abs(now.getTime() - date.getTime())
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                if (diffDays === 0) {
                    dateText = 'Today'
                } else if (diffDays === 1) {
                    dateText = '1 day ago'
                } else if (diffDays < 7) {
                    dateText = `${diffDays} days ago`
                } else if (diffDays < 30) {
                    const weeks = Math.floor(diffDays / 7)
                    dateText = `${weeks} week${weeks > 1 ? 's' : ''} ago`
                } else if (diffDays < 365) {
                    const months = Math.floor(diffDays / 30)
                    dateText = `${months} month${months > 1 ? 's' : ''} ago`
                } else {
                    const years = Math.floor(diffDays / 365)
                    dateText = `${years} year${years > 1 ? 's' : ''} ago`
                }
            }

            if (author && commentText) {
                allComments.push({
                    author,
                    avatar,
                    comment: commentText,
                    date: dateText,
                })
            }
        })

        // Pagination
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedComments = allComments.slice(startIndex, endIndex)
        const hasMore = endIndex < allComments.length

        return NextResponse.json({
            success: true,
            comments: paginatedComments,
            pagination: {
                page,
                limit,
                total: allComments.length,
                hasMore
            }
        })

    } catch (error) {
        console.error('Error scraping Steam comments:', error)
        return NextResponse.json({
            error: 'Failed to scrape comments',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
