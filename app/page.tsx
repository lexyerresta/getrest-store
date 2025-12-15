"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Facebook, MessageCircle, Search, TvMinimalPlay, X, Filter, SortAsc, ShoppingBag, Package, Sun, Moon, Star, ExternalLink } from "lucide-react"
import Navbar from "@/components/ui/Navbar"
import { useDebounce } from "@/lib/useDebounce"
import { useTheme } from "next-themes"
import { LiquipediaImage } from "@/components/LiquipediaImage"
import { SteamComments } from "@/components/SteamComments"
import Image from "next/image"

type Product = {
  id: string
  name: string
  hero: string | null
  icon: string | null
  qty: number
  price: number
}

type PriceOverride = {
  name: string
  price: number
  qty?: number
  hero?: string
}[]

type SortOption = "price-high" | "price-low" | "name-asc" | "name-desc"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)
  const { theme, setTheme } = useTheme()
  const [visibleCount, setVisibleCount] = useState(50)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Product | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>("")

  const [sortBy, setSortBy] = useState<SortOption>("price-high")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Infinity])
  const [selectedHero, setSelectedHero] = useState<string>("all")

  const STEAM_ID = "76561198329596689"
  const STEAM_PROFILE_URL = `https://steamcommunity.com/profiles/${STEAM_ID}`
  const API_URL = `/api/steam-profile?steamId=${STEAM_ID}`

  const [steamName, setSteamName] = useState("")
  const [steamAvatar, setSteamAvatar] = useState("")

  // Fetch products
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const priceRes = await fetch("/prices.json")
      const priceData: PriceOverride = await priceRes.json()

      const merged: Product[] = priceData.map((item) => ({
        id: item.name,
        name: item.name,
        hero: item.hero ?? null,
        icon: null,
        qty: item.qty ?? 0,
        price: item.price,
      }))

      const filtered = merged.filter((item) => item.price > 0 && item.qty > 0)
      setProducts(filtered)
      setIsLoading(false)
    }

    fetchData()
  }, [])

  // Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => prev + 50)
      }
    })

    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current)
    }
  }, [])

  // Fetch Steam Profile
  useEffect(() => {
    const fetchSteamProfile = async () => {
      try {
        const res = await fetch(API_URL)
        const data = await res.json()

        if (data.personaname && data.avatarmedium) {
          setSteamName(data.personaname)
          setSteamAvatar(data.avatarmedium)
        }
      } catch (error) {
        console.error("Error fetching Steam profile:", error)
      }
    }

    fetchSteamProfile()
  }, [])

  // Get unique heroes
  const uniqueHeroes = Array.from(new Set(products.map(p => p.hero).filter(Boolean))).sort()

  // Filter & Sort
  const filteredAndSorted = products
    .filter((p) =>
      (p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        p.hero?.toLowerCase().includes(debouncedQuery.toLowerCase())) &&
      p.price >= priceRange[0] && p.price <= priceRange[1] &&
      (selectedHero === "all" || p.hero === selectedHero)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-high": return b.price - a.price
        case "price-low": return a.price - b.price
        case "name-asc": return a.name.localeCompare(b.name)
        case "name-desc": return b.name.localeCompare(a.name)
        default: return 0
      }
    })

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)

  const handleCardClick = (item: Product) => {
    setSelectedItem(item)
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(item.name)}`
    setVideoUrl(youtubeSearchUrl)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
    setVideoUrl("")
  }

  const priceRanges = [
    { label: "All Prices", min: 0, max: Infinity },
    { label: "Under 50K", min: 0, max: 50000 },
    { label: "50K - 200K", min: 50000, max: 200000 },
    { label: "200K - 500K", min: 200000, max: 500000 },
    { label: "Above 500K", min: 500000, max: Infinity },
  ]

  const getLiquipediaUrl = (itemName: string) => {
    const slug = itemName.replace(/\s+/g, '_')
    return `https://liquipedia.net/dota2/${slug}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-[#231650] dark:via-[#2a1f5e] dark:to-[#231650] transition-colors duration-300">
      {/* Header */}
      {mounted && (
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#231650]/80 backdrop-blur-xl border-b border-orange-200 dark:border-[#612E37]">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden shadow-lg ring-2 ring-orange-400 dark:ring-[#FED172]">
                  <Image src="/logo-getrest.jpg" alt="GetRest Store" fill className="object-cover" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                    GetRest <span className="text-[#F3742B] dark:text-[#FED172]">Store</span>
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Premium Dota 2 Marketplace</p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <a
                  href={STEAM_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#F3742B] to-[#B83A14] hover:from-[#B83A14] hover:to-[#F3742B] text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-orange-500/30"
                >
                  <Package size={16} />
                  <span>My Steam</span>
                </a>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-lg bg-orange-100 dark:bg-[#612E37] hover:bg-orange-200 dark:hover:bg-[#612E37]/80 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun size={20} className="text-[#FED172]" /> : <Moon size={20} className="text-[#F3742B]" />}
                </button>
                <Navbar />
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search items by name or hero..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 h-12 bg-white dark:bg-[#2a1f5e] border-orange-200 dark:border-[#612E37] focus:border-[#F3742B] dark:focus:border-[#FED172] text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>

            {/* Stats & Filters */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-[#612E37]/30 rounded-full border border-orange-200 dark:border-[#612E37]">
                  <ShoppingBag size={14} className="text-[#F3742B] dark:text-[#FED172]" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{filteredAndSorted.length} Variants</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 dark:bg-[#612E37]/30 rounded-full border border-yellow-200 dark:border-[#612E37]">
                  <Package size={14} className="text-[#F3742B] dark:text-[#FED172]" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{filteredAndSorted.reduce((sum, p) => sum + p.qty, 0)} In Stock</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Hero Filter */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#612E37] hover:bg-orange-50 dark:hover:bg-[#612E37]/80 border border-orange-200 dark:border-[#612E37] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
                    <Star size={14} />
                    <span className="hidden sm:inline">Hero</span>
                  </button>
                  <div className="absolute top-full mt-2 right-0 w-52 max-h-96 overflow-y-auto bg-white dark:bg-[#2a1f5e] rounded-lg shadow-xl border border-orange-200 dark:border-[#612E37] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => setSelectedHero("all")}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 dark:hover:bg-[#612E37]/50 transition-colors first:rounded-t-lg ${selectedHero === "all" ? "bg-orange-100 dark:bg-[#612E37] text-[#F3742B] dark:text-[#FED172] font-semibold" : "text-gray-700 dark:text-gray-300"
                        }`}
                    >
                      All Heroes
                    </button>
                    {uniqueHeroes.map((hero) => (
                      <button
                        key={hero}
                        onClick={() => setSelectedHero(hero as string)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 dark:hover:bg-[#612E37]/50 transition-colors last:rounded-b-lg ${selectedHero === hero ? "bg-orange-100 dark:bg-[#612E37] text-[#F3742B] dark:text-[#FED172] font-semibold" : "text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {hero}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#612E37] hover:bg-orange-50 dark:hover:bg-[#612E37]/80 border border-orange-200 dark:border-[#612E37] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
                    <SortAsc size={14} />
                    <span className="hidden sm:inline">Sort</span>
                  </button>
                  <div className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-[#2a1f5e] rounded-lg shadow-xl border border-orange-200 dark:border-[#612E37] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    {[
                      { value: "price-high", label: "Price: High to Low" },
                      { value: "price-low", label: "Price: Low to High" },
                      { value: "name-asc", label: "Name: A to Z" },
                      { value: "name-desc", label: "Name: Z to A" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value as SortOption)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 dark:hover:bg-[#612E37]/50 transition-colors first:rounded-t-lg last:rounded-b-lg ${sortBy === option.value ? "bg-orange-100 dark:bg-[#612E37] text-[#F3742B] dark:text-[#FED172] font-semibold" : "text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#612E37] hover:bg-orange-50 dark:hover:bg-[#612E37]/80 border border-orange-200 dark:border-[#612E37] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
                    <Filter size={14} />
                    <span className="hidden sm:inline">Price</span>
                  </button>
                  <div className="absolute top-full mt-2 right-0 w-44 bg-white dark:bg-[#2a1f5e] rounded-lg shadow-xl border border-orange-200 dark:border-[#612E37] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    {priceRanges.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => setPriceRange([range.min, range.max])}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 dark:hover:bg-[#612E37]/50 transition-colors first:rounded-t-lg last:rounded-b-lg ${priceRange[0] === range.min && priceRange[1] === range.max ? "bg-orange-100 dark:bg-[#612E37] text-[#F3742B] dark:text-[#FED172] font-semibold" : "text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse bg-orange-100 dark:bg-[#612E37]/30 rounded-xl h-64 border border-orange-200 dark:border-[#612E37]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSorted.slice(0, visibleCount).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => handleCardClick(item)}
                className="group cursor-pointer"
              >
                <div className="bg-white dark:bg-[#2a1f5e] rounded-xl border-2 border-orange-200 dark:border-[#612E37] hover:border-[#F3742B] dark:hover:border-[#FED172] transition-all overflow-hidden shadow-sm hover:shadow-xl">
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-[#231650] dark:to-[#612E37] overflow-hidden">
                    <LiquipediaImage
                      itemName={item.name}
                      className="p-4 group-hover:scale-110 transition-transform duration-300"
                      priority={index < 6}
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 dark:bg-[#231650]/90 backdrop-blur rounded-full border border-orange-200 dark:border-[#612E37]">
                      <span className="text-xs font-bold text-[#F3742B] dark:text-[#FED172]">{item.qty} left</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate group-hover:text-[#F3742B] dark:group-hover:text-[#FED172] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                        <Star size={12} className="text-yellow-500" fill="currentColor" />
                        {item.hero || "Dota 2"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Price</p>
                        <p className="text-2xl font-black text-[#F3742B] dark:text-[#FED172]">
                          {formatRupiah(item.price)}
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-gradient-to-r from-[#F3742B] to-[#B83A14] hover:from-[#B83A14] hover:to-[#F3742B] text-white rounded-lg font-semibold text-sm shadow-lg shadow-orange-500/30 transition-all transform group-hover:scale-105">
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {visibleCount < filteredAndSorted.length && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-[#F3742B] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#FED172] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-[#B83A14] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <span className="ml-2">Loading more items...</span>
            </div>
          </div>
        )}

        {filteredAndSorted.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <ShoppingBag className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={64} />
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">No Items Found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}

        <div ref={loadMoreRef} className="h-10" />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-[#2a1f5e] p-6 md:p-8 rounded-2xl w-full max-w-2xl shadow-2xl border-2 border-orange-200 dark:border-[#612E37]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">
                  {selectedItem.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Star size={14} className="text-yellow-500" fill="currentColor" />
                  {selectedItem.hero}
                </p>
              </div>

              <div className="flex items-center gap-3 mb-6 p-4 bg-orange-50 dark:bg-[#612E37]/30 rounded-xl border border-orange-200 dark:border-[#612E37]">
                {steamAvatar && (
                  <a href={STEAM_PROFILE_URL} target="_blank" rel="noopener noreferrer">
                    <img src={steamAvatar} alt="Seller" className="w-16 h-16 rounded-full border-2 border-[#F3742B] dark:border-[#FED172]" />
                  </a>
                )}
                <div className="flex-1">
                  <a href={STEAM_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-lg text-gray-900 dark:text-white hover:text-[#F3742B] dark:hover:text-[#FED172] transition-colors">
                    {steamName || "GETREST.ID | 0813 8888 3983 (WA)"}
                  </a>
                  <p className="text-sm text-gray-600 dark:text-gray-400">1161 Items • 691 Delivered</p>
                </div>
                <div className="px-3 py-1.5 bg-gradient-to-r from-[#FED172] to-[#F3742B] text-[#231650] text-xs font-black rounded-full uppercase">
                  Verified
                </div>
              </div>

              <div className="space-y-2 mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <p className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>30 days Steam friendship required</span>
                </p>
                <p className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Check availability in <a href={`https://steamcommunity.com/profiles/${STEAM_ID}/inventory`} target="_blank" className="text-[#F3742B] dark:text-[#FED172] underline font-semibold">Inventory</a></span>
                </p>
                <p className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>50% down payment for booking</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => window.open(videoUrl, "_blank")}
                  className="h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  <TvMinimalPlay className="w-4 h-4 mr-2" />
                  Preview
                </Button>

                <a
                  href="https://www.facebook.com/LexyAlexaRekber/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </a>

                <a
                  href={`https://wa.me/6281388883983?text=${encodeURIComponent(`Hi! I want to buy "${selectedItem.name}"`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steam Comments Floating Button */}
      <SteamComments />
    </div>
  )
}
