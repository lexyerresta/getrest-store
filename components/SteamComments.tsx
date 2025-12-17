"use client"

import { useState, useEffect, useRef } from "react"
import { MessageSquare, ExternalLink, X, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Comment = {
    author: string
    avatar: string
    comment: string
    date: string
}

export function SteamComments() {
    const [isOpen, setIsOpen] = useState(false)
    const [comments, setComments] = useState<Comment[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [totalComments, setTotalComments] = useState(0)

    const scrollRef = useRef<HTMLDivElement>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const loadMoreRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (comments.length === 0) {
            fetchComments(1)
        }
    }, [])

    // Infinite scroll observer
    useEffect(() => {
        if (isLoading || !hasMore) return

        if (observerRef.current) observerRef.current.disconnect()

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !isLoading) {
                setPage(prev => prev + 1)
            }
        })

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current)
        }

        return () => {
            if (observerRef.current) observerRef.current.disconnect()
        }
    }, [isLoading, hasMore]) // Removed isOpen from deps

    // Fetch when page changes
    useEffect(() => {
        if (page > 1) {
            fetchComments(page)
        }
    }, [page])

    const fetchComments = async (pageNum: number) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/steam-comments?page=${pageNum}&limit=20`)
            const data = await response.json()

            if (data.success) {
                setComments(prev => pageNum === 1 ? data.comments : [...prev, ...data.comments])
                setHasMore(data.pagination.hasMore)
                setTotalComments(data.pagination.total)
            } else {
                setError(data.error || 'Failed to load comments')
            }
        } catch (err) {
            setError('Network error. Please try again.')
            console.error('Error fetching comments:', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full min-h-0 bg-white dark:bg-[#151e32]">
            {/* Content */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 overscroll-contain"
            >
                {error ? (
                    <div className="text-center py-12">
                        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                        <button
                            onClick={() => {
                                setPage(1)
                                fetchComments(1)
                            }}
                            className="px-4 py-2 bg-[#F3742B] text-white rounded-lg hover:bg-[#B83A14] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : comments.length === 0 && !isLoading ? (
                    <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No comments yet</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {comments.map((comment, index) => (
                                <motion.div
                                    key={`${comment.author}-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="bg-orange-50 dark:bg-[#612E37]/20 p-4 rounded-lg border border-orange-200 dark:border-[#612E37] hover:border-orange-300 dark:hover:border-[#612E37]/60 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={comment.avatar}
                                            alt={comment.author}
                                            className="w-10 h-10 rounded-full border-2 border-orange-300 dark:border-[#612E37] flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                                    {comment.author}
                                                </h4>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                                    {comment.date}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words whitespace-pre-wrap">
                                                {comment.comment}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Loading more */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="w-6 h-6 text-[#F3742B] dark:text-[#FED172] animate-spin" />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading more...</span>
                            </div>
                        )}

                        {/* Load more trigger */}
                        {hasMore && !isLoading && (
                            <div ref={loadMoreRef} className="h-10" />
                        )}

                        {/* End of comments */}
                        {!hasMore && comments.length > 0 && (
                            <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                                ✓ All {totalComments} comments loaded
                            </div>
                        )}
                    </>
                )}
            </div>

        </div>
    )
}
