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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={handleClose}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, x: "-50%", y: "-45%" }}
                        animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
                        exit={{ scale: 0.9, opacity: 0, x: "-50%", y: "-45%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 w-[90%] max-w-md bg-white dark:bg-[#1a1425] rounded-2xl shadow-2xl z-50 overflow-hidden border border-white/20"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-5 text-white flex items-center gap-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Gift size={80} />
                            </div>
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Sparkles size={24} className="text-yellow-200" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black leading-none mb-1">Selamat Datang!</h2>
                                <p className="text-xs text-orange-100 font-medium">Koleksi Dota 2 Premium</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="absolute top-3 right-3 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white/80 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-400 uppercase tracking-wider">
                                <TrendingUp size={14} />
                                <span>Featured Items</span>
                            </div>

                            <div className="space-y-3 mb-5">
                                {featuredProducts.map((product) => {
                                    const rarity = getRarity(product.price)
                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => handleProductClick(product)}
                                            className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-orange-900/10 cursor-pointer transition-all group"
                                        >
                                            <div className="w-12 h-12 bg-white dark:bg-black/20 rounded-lg p-1 flex-shrink-0 border border-slate-200 dark:border-white/10">
                                                <LiquipediaImage
                                                    itemName={product.name}
                                                    className="object-contain"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm bg-gradient-to-r ${rarity.gradient} text-white`}>
                                                        {rarity.name[0]}
                                                    </span>
                                                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                                        {product.name}
                                                    </h4>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{product.hero}</p>
                                                    <p className="text-sm font-black text-orange-600 dark:text-orange-400">
                                                        {formatRupiah(product.price).replace(",00", "")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg text-sm"
                            >
                                Jelajahi {products.length}+ Item Lainnya
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
