"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'id' | 'en'

type Translations = {
    [key: string]: {
        id: string
        en: string
    }
}

const translations: Translations = {
    // Header
    tagline: { id: 'Marketplace Dota 2 Premium', en: 'Premium Dota 2 Marketplace' },
    searchPlaceholder: { id: 'Cari item berdasarkan nama atau hero...', en: 'Search items by name or hero...' },
    variants: { id: 'Varian', en: 'Variants' },
    inStock: { id: 'Stok', en: 'In Stock' },

    // Filters
    hero: { id: 'Hero', en: 'Hero' },
    allHeroes: { id: 'Semua Hero', en: 'All Heroes' },
    sort: { id: 'Urutkan', en: 'Sort' },
    priceHighToLow: { id: 'Harga: Tinggi ke Rendah', en: 'Price: High to Low' },
    priceLowToHigh: { id: 'Harga: Rendah ke Tinggi', en: 'Price: Low to High' },
    nameAToZ: { id: 'Nama: A ke Z', en: 'Name: A to Z' },
    nameZToA: { id: 'Nama: Z ke A', en: 'Name: Z to A' },
    price: { id: 'Harga', en: 'Price' },
    allPrices: { id: 'Semua Harga', en: 'All Prices' },
    under50k: { id: 'Di bawah 50K', en: 'Under 50K' },
    range50to200: { id: '50K - 200K', en: '50K - 200K' },
    range200to500: { id: '200K - 500K', en: '200K - 500K' },
    above500k: { id: 'Di atas 500K', en: 'Above 500K' },

    // Product Card
    left: { id: 'tersisa', en: 'left' },
    buyNow: { id: 'Beli Sekarang', en: 'Buy Now' },

    // Empty State
    noItemsFound: { id: 'Item Tidak Ditemukan', en: 'No Items Found' },
    tryAdjusting: { id: 'Coba sesuaikan pencarian atau filter Anda', en: 'Try adjusting your search or filters' },

    // Modal
    verified: { id: 'Terverifikasi', en: 'Verified' },
    itemsDelivered: { id: 'Item • {} Terkirim', en: 'Items • {} Delivered' },
    requirement30Days: { id: 'Pertemanan Steam 30 hari diperlukan', en: '30 days Steam friendship required' },
    checkAvailability: { id: 'Cek ketersediaan di', en: 'Check availability in' },
    inventory: { id: 'Inventori', en: 'Inventory' },
    downPayment: { id: 'DP 50% untuk booking', en: '50% down payment for booking' },
    preview: { id: 'Lihat', en: 'Preview' },
    facebook: { id: 'Facebook', en: 'Facebook' },
    whatsapp: { id: 'WhatsApp', en: 'WhatsApp' },

    // Test My Luck
    testMyLuck: { id: 'Tes Keberuntungan!', en: 'Test My Luck!' },
    confusedWhat: { id: 'Bingung mau beli apa? Coba keberuntunganmu!', en: "Don't know what to buy? Test your luck!" },
    gacha: { id: 'GACHA! 🎰', en: 'GACHA! 🎰' },
    spinning: { id: 'MEMUTAR...', en: 'SPINNING...' },
    viewThisItem: { id: 'Lihat Item Ini', en: 'View This Item' },
    randomFrom: { id: '💡 Item random dari {} koleksi kami', en: '💡 Random item from {} collections' },
    clickGacha: { id: 'Klik "GACHA!" untuk tes keberuntungan', en: 'Click "GACHA!" to test your luck' },

    // Rarity
    mythical: { id: 'MISTIS', en: 'MYTHICAL' },
    legendary: { id: 'LEGENDARIS', en: 'LEGENDARY' },
    rare: { id: 'LANGKA', en: 'RARE' },
    uncommon: { id: 'TIDAK UMUM', en: 'UNCOMMON' },
    common: { id: 'UMUM', en: 'COMMON' },

    // Steam Comments
    steamComments: { id: 'Komentar Steam', en: 'Steam Comments' },
    steamCommentsDesc: { id: 'Lihat testimoni dari pembeli lain', en: 'See testimonials from other buyers' },
    viewAllComments: { id: 'Lihat Semua Komentar di Steam', en: 'View All Comments on Steam' },
    allCommentsLoaded: { id: 'Semua {} komentar dimuat', en: 'All {} comments loaded' },

    // Loading
    loadingMore: { id: 'Memuat item lainnya...', en: 'Loading more items...' },

    // WhatsApp Templates
    whatsappMessage: {
        id: 'Halo! Saya tertarik dengan "{}" dari GetRest Store. Apakah masih tersedia?',
        en: 'Hi! I\'m interested in "{}" from GetRest Store. Is it still available?'
    },
}

type LanguageContextType = {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string, replacements?: { [key: string]: string }) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('id') // Default: Indonesian

    const t = (key: string, replacements?: { [key: string]: string }): string => {
        let text = translations[key]?.[language] || key

        // Replace placeholders
        if (replacements) {
            Object.entries(replacements).forEach(([placeholder, value]) => {
                text = text.replace(`{${placeholder}}`, value)
            })
        }

        // Replace {} with single value if provided
        if (replacements && Object.keys(replacements).length === 1) {
            text = text.replace('{}', Object.values(replacements)[0])
        }

        return text
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider')
    }
    return context
}
