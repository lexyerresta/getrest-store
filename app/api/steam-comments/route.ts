import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        // Read from cached JSON file
        const filePath = path.join(process.cwd(), 'public', 'steam-comments.json')

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({
                error: 'Comments not yet cached. Please run: npm run scrape-comments',
                success: false
            }, { status: 404 })
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const data = JSON.parse(fileContent)

        const allComments = data.comments || []

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
            },
            lastUpdated: data.lastUpdated
        })

    } catch (error) {
        console.error('Error reading Steam comments:', error)
        return NextResponse.json({
            error: 'Failed to read comments',
            details: error instanceof Error ? error.message : 'Unknown error',
            success: false
        }, { status: 500 })
    }
}
