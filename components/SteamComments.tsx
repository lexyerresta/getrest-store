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
        if (isOpen && comments.length === 0) {
            fetchComments(1)
        }
    }, [isOpen])

    // Infinite scroll observer
    useEffect(() => {
        if (!isOpen || isLoading || !hasMore) return

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
    }, [isOpen, isLoading, hasMore])

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

    const handleClose = () => {
        setIsOpen(false)
        // Reset state when closing
        setTimeout(() => {
            setPage(1)
            setComments([])
            setHasMore(true)
            setError(null)
        }, 300)
    }

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-[#F3742B] to-[#B83A14] hover:from-[#B83A14] hover:to-[#F3742B] text-white rounded-full shadow-2xl shadow-orange-500/50 transition-all transform hover:scale-110"
                aria-label="View Steam comments"
            >
                <MessageSquare size={24} />
                {totalComments > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-6 h-6 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {totalComments}
                    </span>
                )}
            </button>

            {/* Comments Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full sm:w-[28rem] bg-white dark:bg-[#2a1f5e] shadow-2xl z-50 flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex-shrink-0 bg-gradient-to-r from-[#1b2838] to-[#2a475e] text-white p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                                            <MessageSquare size={18} />
                                        </div>
                                        <h3 className="font-bold text-lg">Steam Comments</h3>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                        aria-label="Close"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-300 flex items-center gap-1">
                                    <span>💬</span>
                                    Real comments from our Steam profile
                                    {totalComments > 0 && (
                                        <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full font-semibold">
                                            {totalComments} total
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Content */}
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-4"
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

                            {/* Footer */}
                            <div className="flex-shrink-0 p-4 bg-gray-50 dark:bg-[#1a1f3a] border-t border-gray-200 dark:border-[#612E37]">
                                <a
                                    href="https://steamcommunity.com/id/GetRestSTORE/allcomments"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#1b2838] hover:bg-[#2a475e] text-white rounded-lg transition-colors text-sm font-semibold"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-4.6 0-8.45-3.08-9.64-7.27l3.83 1.58a2.84 2.84 0 0 0 2.78 2.27c1.56 0 2.83-1.27 2.83-2.83v-.13l3.4-2.43h.08c2.08 0 3.77-1.69 3.77-3.77s-1.69-3.77-3.77-3.77-3.78 1.69-3.78 3.77v.05l-2.37 3.46-.16-.01c-.59 0-1.14.18-1.59.49L2 11.2C2.43 6.05 6.73 2 12 2M8.28 17.17c.8.33 1.72-.04 2.05-.84.33-.8-.05-1.71-.83-2.04l-1.28-.53c.49-.18 1.04-.19 1.56.03.53.21.94.62 1.15 1.15.22.52.22 1.1 0 1.62-.43 1.08-1.7 1.6-2.78 1.15-.5-.21-.88-.59-1.09-1.04l1.22.5z" />
                                    </svg>
                                    View All Comments on Steam
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
