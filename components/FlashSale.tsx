"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Zap, Clock, ShoppingBag } from "lucide-react"
import { LiquipediaImage } from "./LiquipediaImage"

type Product = {
    id: string
    name: string
    hero: string | null
    icon: string | null
    qty: number
    price: number
}

interface FlashSaleProps {
    products: Product[]
    onCardClick: (product: Product) => void
    onAddToCart: (product: Product, e?: React.MouseEvent) => void
    onBuyNow: (product: Product, e?: React.MouseEvent) => void
}

// Simple seeded random number generator
const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value)

export const FlashSale = ({ products, onCardClick, onAddToCart, onBuyNow }: FlashSaleProps) => {
    const [timeLeft, setTimeLeft] = useState("")

    // Get 4 random items based on today's date
    const flashSaleItems = useMemo(() => {
        if (products.length === 0) return []

        // Use current date string as seed (YYYY-MM-DD)
        const dateStr = new Date().toISOString().split('T')[0]
        // Convert date string to a number for seeding
        let seed = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

        // Create a copy to shuffle
        const shuffled = [...products].sort(() => 0.5 - seededRandom(seed++))

        // Pick first 4 items and apply 11% discount
        return shuffled.slice(0, 4).map(item => ({
            ...item,
            originalPrice: item.price,
            price: Math.floor(item.price * 0.89), // 11% discount
            isFlashSale: true
        }))
    }, [products])

    // Countdown Timer
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date()
            // End of day (23:59:59)
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
            const diff = endOfDay.getTime() - now.getTime()

            if (diff <= 0) return "00:00:00"

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
            const minutes = Math.floor((diff / (1000 * 60)) % 60)
            const seconds = Math.floor((diff / 1000) % 60)

            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }

        setTimeLeft(calculateTimeLeft())

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    if (flashSaleItems.length === 0) return null

    if (flashSaleItems.length === 0) return null

    return (
        <section className="mb-10 relative group">
            {/* Contextual Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />

            <div className="relative bg-white dark:bg-[#151e32] rounded-xl p-4 border border-orange-100 dark:border-white/10 shadow-sm">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-orange-100 dark:border-white/5 pb-4 md:pb-0 md:border-0">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500 blur-md opacity-50 animate-pulse" />
                            <div className="relative p-2.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl text-white shadow-lg transform -rotate-3">
                                <Zap size={28} className="fill-yellow-300 text-yellow-300" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">
                                    Flash <span className="text-red-600">Sale</span>
                                </h2>
                                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-full animate-pulse border border-red-200 dark:border-red-500/20">
                                    Live
                                </span>
                            </div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Special <span className="text-red-500 font-bold">11% Discount</span> resets daily!
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
                        <div className="flex items-center justify-between md:justify-end gap-3 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg border border-slate-700 w-full md:w-auto">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ends In</span>
                            <div className="flex items-center gap-2 font-mono font-bold text-xl text-yellow-400">
                                <Clock size={18} />
                                {timeLeft}
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex justify-center md:justify-end">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded-md border border-red-100 dark:border-red-500/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                                WAJIB FULL PAYMENT DI DEPAN
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {flashSaleItems.map((item, index) => (
                        <motion.div
                            key={`flash-${item.id}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onCardClick(item)}
                            className="group/card relative bg-white dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-white/5 hover:border-orange-500 dark:hover:border-orange-500 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300"
                        >
                            {/* Pulsing Discount Badge */}
                            <div className="absolute top-0 right-0 z-20">
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-bl-xl shadow-lg flex items-center gap-1"
                                >
                                    <Zap size={10} className="fill-yellow-300 text-yellow-300" />
                                    -11%
                                </motion.div>
                            </div>

                            {/* Image */}
                            <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-orange-50/50 dark:from-[#151e32] dark:to-[#0B1120] p-4 flex items-center justify-center overflow-hidden">
                                <LiquipediaImage
                                    itemName={item.name}
                                    className="w-full h-full object-contain drop-shadow-lg group-hover/card:scale-110 transition-transform duration-500"
                                />
                                {/* Hot Effect overlay */}
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                            </div>

                            {/* Content */}
                            <div className="p-3">
                                <h3 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1 mb-2 group-hover/card:text-orange-500 transition-colors">
                                    {item.name}
                                </h3>

                                <div className="flex flex-col mb-3">
                                    <span className="text-[10px] text-slate-400 line-through decoration-red-500/50">
                                        {formatRupiah(item.originalPrice)}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black text-red-600 dark:text-red-500">
                                            {formatRupiah(item.price).replace(",00", "")}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onBuyNow(item, e); }}
                                        className="flex-1 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 group-hover/card:shadow-orange-500/40"
                                    >
                                        <Zap size={14} className="fill-white" /> BUY NOW
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onAddToCart(item, e); }}
                                        className="px-3 bg-slate-100 dark:bg-white/10 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-white/20 hover:text-orange-600 transition-colors"
                                    >
                                        <ShoppingBag size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
