"use client"

import { useState, useEffect } from "react"
import { MessageSquare, ThumbsUp, ExternalLink, X, Loader2 } from "lucide-react"
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

    useEffect(() => {
        if (isOpen && comments.length === 0) {
            fetchComments()
        }
    }, [isOpen])

    const fetchComments = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/steam-comments')
            const data = await response.json()

            if (data.success) {
                setComments(data.comments)
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
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-[#F3742B] to-[#B83A14] hover:from-[#B83A14] hover:to-[#F3742B] text-white rounded-full shadow-2xl shadow-orange-500/50 transition-all transform hover:scale-110"
                aria-label="View customer reviews"
            >
                <MessageSquare size={24} />
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {comments.length || '?'}
                </span>
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
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-[#2a1f5e] shadow-2xl z-50 overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-[#F3742B] to-[#B83A14] text-white p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={20} />
                                    <h3 className="font-bold text-lg">Customer Reviews</h3>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-[#F3742B] dark:text-[#FED172] animate-spin mb-4" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Loading reviews...</p>
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-12">
                                        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                                        <button
                                            onClick={fetchComments}
                                            className="px-4 py-2 bg-[#F3742B] text-white rounded-lg hover:bg-[#B83A14] transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-600 dark:text-gray-400">No reviews yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {comments.map((comment, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="bg-orange-50 dark:bg-[#612E37]/20 p-4 rounded-lg border border-orange-200 dark:border-[#612E37]"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <img
                                                        src={comment.avatar}
                                                        alt={comment.author}
                                                        className="w-10 h-10 rounded-full border-2 border-orange-300 dark:border-[#612E37]"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                                                {comment.author}
                                                            </h4>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                                                {comment.date}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                                                            {comment.comment}
                                                        </p>
                                                        <button className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-[#F3742B] dark:hover:text-[#FED172] transition-colors mt-2">
                                                            <ThumbsUp size={12} />
                                                            <span>Helpful</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        💡 <strong>Note:</strong> Real customer reviews from our Steam profile.
                                        <a
                                            href="https://steamcommunity.com/id/GetRestSTORE/allcomments"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#F3742B] dark:text-[#FED172] hover:underline ml-1 inline-flex items-center gap-1"
                                        >
                                            View on Steam
                                            <ExternalLink size={10} />
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
