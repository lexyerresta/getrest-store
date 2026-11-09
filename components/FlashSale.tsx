"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Zap, Clock, ShoppingBag, TvMinimalPlay } from "lucide-react"
import { LiquipediaImage } from "./LiquipediaImage"

type Product = {
    id: string
    name: string
    hero: string | null
    icon: string | null
    qty: number
    price: number
    originalPrice?: number
    isFlashSale?: boolean
}

interface FlashSaleProps {
    products: Product[]
    flashSaleItems: Product[]
    timeLeft: string
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

// Rarity Visual Helper (Official Dota 2 Colors)
const getRarityStyle = (price: number) => {
    // ARCANA (> 1.000.000): Lime Green God-Tier Glow
    if (price >= 1000000) return "shadow-[0_0_35px_rgba(173,229,92,0.6)] border-[#ADE55C] border-2 ring-2 ring-[#ADE55C]/30 hover:shadow-[0_0_60px_rgba(173,229,92,0.9)] hover:scale-[1.03] z-20"

    // ANCIENT (> 500.000): Deep Red Glow
    if (price >= 500000) return "shadow-[0_0_25px_rgba(235,75,75,0.5)] border-[#EB4B4B] border-2 hover:shadow-[0_0_40px_rgba(235,75,75,0.8)] hover:scale-[1.02] z-10"

    // IMMORTAL (> 250.000): Golden Amber Glow
    if (price >= 250000) return "shadow-[0_0_20px_rgba(228,174,51,0.5)] border-[#E4AE33] border-2 hover:shadow-[0_0_35px_rgba(228,174,51,0.7)] z-10"

    // LEGENDARY (> 150.000): Fuchsia/Pink Glow
    if (price >= 150000) return "shadow-[0_0_15px_rgba(211,44,230,0.5)] border-[#D32CE6] border-2 hover:shadow-[0_0_30px_rgba(211,44,230,0.7)] z-0"

    // MYTHICAL (> 75.000): Purple Glow
    if (price >= 75000) return "shadow-[0_0_15px_rgba(136,71,255,0.4)] border-[#8847FF] border-2 hover:shadow-[0_0_25px_rgba(136,71,255,0.6)] z-0"

    // RARE (> 25.000): Blue Glow
    if (price >= 25000) return "shadow-[0_0_10px_rgba(75,105,255,0.4)] border-[#4B69FF] border hover:shadow-[0_0_20px_rgba(75,105,255,0.6)] z-0"

    // COMMON: Standard
    return "border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 hover:shadow-lg z-0"
}

export const FlashSale = ({ products, flashSaleItems, timeLeft, onCardClick, onAddToCart, onBuyNow }: FlashSaleProps) => {

    if (flashSaleItems.length === 0) return null

    return (
        <section className="mb-10 relative group">
            {/* Contextual Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-sm opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

            <div className="relative bg-white dark:bg-[#151e32] rounded-xl p-3 sm:p-4 border border-orange-100 dark:border-white/10 shadow-sm">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4 border-b border-orange-100 dark:border-white/5 pb-3 sm:pb-0 md:border-0">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500 blur-md opacity-50 animate-pulse" />
                            <div className="relative p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl text-white shadow-lg transform -rotate-3">
                                <Zap size={20} className="sm:w-7 sm:h-7 fill-yellow-300 text-yellow-300" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                                <h2 className="text-lg sm:text-3xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white leading-none">
                                    Flash <span className="text-red-600">Sale</span>
                                </h2>
                                <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest rounded-full animate-pulse border border-red-200 dark:border-red-500/20">
                                    Live
                                </span>
                            </div>
                            <p className="text-[10px] sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-tight">
                                <span className="hidden sm:inline">Dapatkan </span><span className="text-red-500 font-bold uppercase sm:normal-case">Flash Sale</span> setiap hari! <span className="hidden sm:inline">Reset jam 23:00 WIB</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-1.5 w-full md:w-auto">
                        <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 bg-orange-50 dark:bg-black/40 text-slate-900 dark:text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm border border-orange-100 dark:border-white/5 w-full md:w-auto">
                            <span className="text-[9px] sm:text-xs font-bold text-orange-600 dark:text-slate-400 uppercase tracking-widest">Ends In</span>
                            <div className="flex items-center gap-1.5 sm:gap-2 font-mono font-bold text-base sm:text-xl text-red-600 dark:text-yellow-400">
                                <Clock size={14} className="sm:w-[18px] sm:h-[18px]" />
                                {timeLeft}
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex justify-center md:justify-end">
                            <div className="flex items-center gap-1 text-[8px] sm:text-[10px] font-bold text-red-500 bg-red-50/50 dark:bg-red-900/10 px-2 py-0.5 sm:py-1 rounded-md border border-red-100/50 dark:border-red-500/10">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-500 animate-ping" />
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
                            className={`group/card relative bg-white dark:bg-[#0B1120] rounded-xl border overflow-hidden cursor-pointer transition-all duration-300 ${getRarityStyle(item.price)}`}
                        >
                            {/* Pulsing Discount Badge */}
                            <div className="absolute top-0 right-0 z-20">
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="bg-red-600 text-white text-[9px] sm:text-xs font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-bl-xl shadow-lg flex items-center gap-1"
                                >
                                    <Zap className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-yellow-300 text-yellow-300" />
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

                                {/* YouTube Preview Button */}
                                <div className="absolute top-2 left-2 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            const query = encodeURIComponent(`${item.name} ${item.hero || ''} Dota 2 Preview`)
                                            window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank')
                                        }}
                                        className="p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                                        title="Watch Preview on YouTube"
                                    >
                                        <TvMinimalPlay size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-2 sm:p-3">
                                <h3 className="font-bold text-slate-800 dark:text-white text-[11px] sm:text-sm line-clamp-1 mb-1 sm:mb-2 group-hover/card:text-orange-500 transition-colors">
                                    {item.name}
                                </h3>

                                <div className="flex flex-col mb-2 sm:mb-3">
                                    <span className="text-[9px] sm:text-[10px] text-slate-400 line-through decoration-red-500/50">
                                        {formatRupiah(item.originalPrice || item.price * 1.12)}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm sm:text-lg font-black text-red-600 dark:text-red-500">
                                            {formatRupiah(item.price).replace(",00", "")}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-1.5 sm:gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onBuyNow(item, e); }}
                                        className="flex-1 py-1.5 sm:py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg text-[10px] sm:text-xs font-black transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1 group-hover/card:shadow-orange-500/40"
                                    >
                                        <Zap className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-white" /> BUY
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onAddToCart(item, e); }}
                                        className="px-2 sm:px-3 bg-slate-100 dark:bg-white/10 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-white/20 hover:text-orange-600 transition-colors"
                                    >
                                        <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
