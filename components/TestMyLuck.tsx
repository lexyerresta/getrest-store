"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Dices, TrendingUp, Award, Star } from "lucide-react"
import { Button } from "./ui/button"
import { LiquipediaImage } from "./LiquipediaImage"

type Product = {
    id: string
    name: string
    hero: string | null
    icon: string | null
    qty: number
    price: number
}

type LuckyDrawProps = {
    products: Product[]
    onItemSelected: (item: Product) => void
}

export function TestMyLuck({ products, onItemSelected }: LuckyDrawProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSpinning, setIsSpinning] = useState(false)
    const [selectedItem, setSelectedItem] = useState<Product | null>(null)
    const [rarity, setRarity] = useState<string>("")

    const getRarity = (price: number): { name: string; color: string; gradient: string } => {
        if (price >= 500000) return {
            name: "MYTHICAL",
            color: "text-yellow-600 dark:text-yellow-400",
            gradient: "from-yellow-500 to-amber-500"
        }
        if (price >= 200000) return {
            name: "LEGENDARY",
            color: "text-red-600 dark:text-red-400",
            gradient: "from-red-600 to-orange-600"
        }
        if (price >= 100000) return {
            name: "RARE",
            color: "text-blue-600 dark:text-blue-400",
            gradient: "from-blue-600 to-cyan-600"
        }
        if (price >= 50000) return {
            name: "UNCOMMON",
            color: "text-green-600 dark:text-green-400",
            gradient: "from-green-600 to-emerald-600"
        }
        return {
            name: "COMMON",
            color: "text-gray-600 dark:text-gray-400",
            gradient: "from-gray-600 to-gray-500"
        }
    }

    const spinLuck = () => {
        if (products.length === 0 || isSpinning) return

        setIsSpinning(true)
        setSelectedItem(null)

        // Simulate spinning for 2 seconds
        const duration = 2000
        const interval = 100
        let elapsed = 0

        const spinInterval = setInterval(() => {
            const randomItem = products[Math.floor(Math.random() * products.length)]
            setSelectedItem(randomItem)
            elapsed += interval

            if (elapsed >= duration) {
                clearInterval(spinInterval)
                setIsSpinning(false)
                const finalItem = products[Math.floor(Math.random() * products.length)]
                setSelectedItem(finalItem)
                const itemRarity = getRarity(finalItem.price)
                setRarity(itemRarity.name)
            }
        }, interval)
    }

    const handleSelectItem = () => {
        if (selectedItem) {
            onItemSelected(selectedItem)
            setIsOpen(false)
            setTimeout(() => {
                setSelectedItem(null)
                setRarity("")
            }, 300)
        }
    }

    const formatRupiah = (value: number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value)

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 z-40 p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-2xl shadow-purple-500/50 transition-all transform hover:scale-110 animate-pulse"
                aria-label="Test your luck"
            >
                <Sparkles size={24} />
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSpinning && setIsOpen(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gradient-to-br from-white to-purple-50 dark:from-[#2a1f5e] dark:to-[#231650] rounded-2xl shadow-2xl z-50 p-6 mx-4"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => !isSpinning && setIsOpen(false)}
                                disabled={isSpinning}
                                className="absolute top-4 right-4 p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-full transition-colors disabled:opacity-50"
                            >
                                <X size={20} className="text-red-600 dark:text-red-400" />
                            </button>

                            {/* Header */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-3 animate-bounce">
                                    <Dices className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                                    Test My Luck! 🎰
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Bingung mau beli apa? Coba keberuntunganmu!
                                </p>
                            </div>

                            {/* Slot Machine Display */}
                            <div className="relative mb-6">
                                <div className={`min-h-64 bg-gradient-to-br ${selectedItem ? `${getRarity(selectedItem.price).gradient}` : 'from-gray-200 to-gray-300 dark:from-[#612E37] dark:to-[#231650]'} rounded-xl p-6 flex flex-col items-center justify-center border-4 border-white dark:border-[#612E37] shadow-inner transition-all duration-300`}>
                                    <AnimatePresence mode="wait">
                                        {selectedItem ? (
                                            <motion.div
                                                key={selectedItem.id}
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 180 }}
                                                transition={{ type: "spring", damping: 15 }}
                                                className="text-center"
                                            >
                                                {/* Rarity Badge */}
                                                {rarity && !isSpinning && (
                                                    <motion.div
                                                        initial={{ y: -20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        className="mb-3"
                                                    >
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/90 dark:bg-black/50 rounded-full font-black text-xs tracking-wider">
                                                            <Award className="w-3 h-3" />
                                                            {rarity}
                                                        </span>
                                                    </motion.div>
                                                )}

                                                {/* Item Image */}
                                                <div className="w-32 h-32 mx-auto mb-3 relative">
                                                    <LiquipediaImage
                                                        itemName={selectedItem.name}
                                                        className={`${isSpinning ? 'opacity-30 blur-sm' : 'opacity-100 blur-0'} transition-all duration-300`}
                                                        priority={true}
                                                    />
                                                </div>

                                                {/* Item Name */}
                                                <h3 className={`text-xl font-black mb-2 ${isSpinning ? 'text-white/50' : 'text-white drop-shadow-lg'}`}>
                                                    {selectedItem.name}
                                                </h3>

                                                {/* Hero */}
                                                <div className="flex items-center justify-center gap-1 mb-3">
                                                    <Star className="w-4 h-4 text-yellow-300" fill="currentColor" />
                                                    <p className={`text-sm font-semibold ${isSpinning ? 'text-white/50' : 'text-white'}`}>
                                                        {selectedItem.hero || "Dota 2"}
                                                    </p>
                                                </div>

                                                {/* Price */}
                                                {!isSpinning && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.2, type: "spring" }}
                                                    >
                                                        <div className="bg-white/90 dark:bg-black/50 rounded-lg px-4 py-2 inline-block">
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Price</p>
                                                            <p className="text-2xl font-black text-gray-900 dark:text-white">
                                                                {formatRupiah(selectedItem.price)}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        ) : (
                                            <div className="text-center text-white/70">
                                                <Sparkles className="w-16 h-16 mx-auto mb-3 opacity-50" />
                                                <p className="text-sm font-medium">
                                                    Click "GACHA!" to test your luck
                                                </p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Sparkle Effects */}
                                {isSpinning && (
                                    <>
                                        <motion.div
                                            animate={{
                                                rotate: 360,
                                                scale: [1, 1.2, 1]
                                            }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="absolute -top-2 -right-2"
                                        >
                                            <Sparkles className="w-6 h-6 text-yellow-400" />
                                        </motion.div>
                                        <motion.div
                                            animate={{
                                                rotate: -360,
                                                scale: [1, 1.3, 1]
                                            }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="absolute -bottom-2 -left-2"
                                        >
                                            <Sparkles className="w-6 h-6 text-pink-400" />
                                        </motion.div>
                                    </>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                <Button
                                    onClick={spinLuck}
                                    disabled={isSpinning || products.length === 0}
                                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSpinning ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Dices className="w-5 h-5 mr-2" />
                                            </motion.div>
                                            SPINNING...
                                        </>
                                    ) : (
                                        <>
                                            <Dices className="w-5 h-5 mr-2" />
                                            GACHA! 🎰
                                        </>
                                    )}
                                </Button>

                                {selectedItem && !isSpinning && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <Button
                                            onClick={handleSelectItem}
                                            className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg"
                                        >
                                            <TrendingUp className="w-5 h-5 mr-2" />
                                            View This Item
                                        </Button>
                                    </motion.div>
                                )}
                            </div>

                            {/* Info */}
                            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                                💡 Random item dari {products.length} koleksi kami
                            </p>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
