"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, TrendingUp, Gift } from "lucide-react"
import { LiquipediaImage } from "./LiquipediaImage"

type Product = {
    id: string
    name: string
    hero: string | null
    icon: string | null
    qty: number
    price: number
}

type WelcomePopupProps = {
    products: Product[]
    onSelectProduct: (product: Product) => void
}

export function WelcomePopup({ products, onSelectProduct }: WelcomePopupProps) {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Check if user has seen the popup before
        const hasSeenPopup = localStorage.getItem('hasSeenWelcomePopup')

        if (!hasSeenPopup) {
            // Show popup after 1 second delay
            const timer = setTimeout(() => {
                setIsOpen(true)
            }, 1000)

            return () => clearTimeout(timer)
        }
    }, [])

    const handleClose = () => {
        setIsOpen(false)
        localStorage.setItem('hasSeenWelcomePopup', 'true')
    }

    const handleProductClick = (product: Product) => {
        onSelectProduct(product)
        handleClose()
    }

    const getRarity = (price: number): { name: string; color: string; gradient: string; bgColor: string } => {
        if (price >= 500000) return {
            name: "MYTHICAL",
            color: "text-yellow-700 dark:text-yellow-300",
            gradient: "from-yellow-500 to-amber-500",
            bgColor: "bg-yellow-100 dark:bg-yellow-900/30"
        }
        if (price >= 200000) return {
            name: "LEGENDARY",
            color: "text-red-700 dark:text-red-300",
            gradient: "from-red-600 to-orange-600",
            bgColor: "bg-red-100 dark:bg-red-900/30"
        }
        if (price >= 100000) return {
            name: "RARE",
            color: "text-blue-700 dark:text-blue-300",
            gradient: "from-blue-600 to-cyan-600",
            bgColor: "bg-blue-100 dark:bg-blue-900/30"
        }
        if (price >= 50000) return {
            name: "UNCOMMON",
            color: "text-green-700 dark:text-green-300",
            gradient: "from-green-600 to-emerald-600",
            bgColor: "bg-green-100 dark:bg-green-900/30"
        }
        return {
            name: "COMMON",
            color: "text-gray-700 dark:text-gray-300",
            gradient: "from-gray-600 to-gray-500",
            bgColor: "bg-gray-100 dark:bg-gray-700/30"
        }
    }

    // Get 3 random products (shuffle array and take first 3)
    const getRandomProducts = () => {
        const shuffled = [...products].sort(() => Math.random() - 0.5)
        return shuffled.slice(0, 3)
    }

    const featuredProducts = getRandomProducts()

    const formatRupiah = (value: number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value)

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={handleClose}
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-orange-50 to-yellow-50 dark:from-[#231650] dark:via-[#2a1f5e] dark:to-[#612E37] rounded-3xl shadow-2xl z-50 mx-4"
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 bg-white dark:bg-[#231650] hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full shadow-lg transition-colors z-10"
                        >
                            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>

                        {/* Header */}
                        <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-8 text-center">
                            {/* Animated sparkles */}
                            <div className="absolute inset-0 overflow-hidden">
                                <motion.div
                                    animate={{
                                        rotate: 360,
                                        scale: [1, 1.2, 1],
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute -top-4 -left-4"
                                >
                                    <Sparkles className="w-16 h-16 text-white/30" />
                                </motion.div>
                                <motion.div
                                    animate={{
                                        rotate: -360,
                                        scale: [1, 1.3, 1],
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute -bottom-4 -right-4"
                                >
                                    <Sparkles className="w-20 h-20 text-white/20" />
                                </motion.div>
                            </div>

                            <div className="relative z-10">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="inline-block mb-3"
                                >
                                    <Gift className="w-16 h-16 text-white mx-auto" />
                                </motion.div>
                                <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                                    🎉 Selamat Datang!
                                </h2>
                                <p className="text-white/90 text-lg font-semibold">
                                    Koleksi Premium Dota 2 Menanti Anda
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-orange-500" />
                                    Item Premium Kami
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Dapatkan item terbaik dengan berbagai rarity
                                </p>
                            </div>

                            {/* Featured Products */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {featuredProducts.map((product, index) => {
                                    const rarity = getRarity(product.price)
                                    return (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => handleProductClick(product)}
                                            className="group cursor-pointer"
                                        >
                                            <div className={`bg-white dark:bg-[#2a1f5e] rounded-2xl p-4 border-2 ${rarity.bgColor} border-opacity-50 hover:border-opacity-100 hover:shadow-xl transition-all transform hover:scale-105`}>
                                                {/* Rarity Badge */}
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className={`px-3 py-1 bg-gradient-to-r ${rarity.gradient} text-white text-xs font-black rounded-full shadow-md`}>
                                                        {rarity.name}
                                                    </span>
                                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                                                        {product.qty} left
                                                    </span>
                                                </div>

                                                {/* Image */}
                                                <div className="w-full h-32 mb-3 relative">
                                                    <LiquipediaImage
                                                        itemName={product.name}
                                                        className="group-hover:scale-110 transition-transform duration-300"
                                                        priority={true}
                                                    />
                                                </div>

                                                {/* Info */}
                                                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1 truncate group-hover:text-orange-500 dark:group-hover:text-[#FED172] transition-colors">
                                                    {product.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
                                                    {product.hero || "Dota 2"}
                                                </p>
                                                <p className="text-xl font-black text-orange-600 dark:text-[#FED172]">
                                                    {formatRupiah(product.price)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>

                            {/* CTA */}
                            <div className="text-center space-y-3">
                                <button
                                    onClick={handleClose}
                                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                                >
                                    Jelajahi Semua Koleksi 🚀
                                </button>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    💡 {products.length}+ item premium menanti Anda
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
