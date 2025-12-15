"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Facebook, MessageCircle, Search, TvMinimalPlay, X, Filter, SortAsc, ShoppingBag, Package, Sun, Moon, Star, ExternalLink, ChevronDown } from "lucide-react"
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

  // Mobile-friendly dropdown states
  const [isHeroDropdownOpen, setIsHeroDropdownOpen] = useState(false)
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false)

  const STEAM_ID = "76561198329596689"
  const STEAM_PROFILE_URL = `https://steamcommunity.com/profiles/${STEAM_ID}`
  const API_URL = `/api/steam-profile?steamId=${STEAM_ID}`

  const [steamName, setSteamName] = useState("")
  const [steamAvatar, setSteamAvatar] = useState("")

  // using latest json
  useEffect(() => {
    const fetchData = async () => {
      const priceRes = await fetch("/prices.json");
      const priceData: PriceOverride = await priceRes.json();

      const merged: Product[] = priceData.map((item) => ({
        id: item.name,
        name: item.name,
        hero: item.hero ?? null,
        icon: null,
        qty: item.qty ?? 0,
        price: item.price,
      }));

      const sorted = merged.sort((a, b) => b.price - a.price);

      const filtered = sorted.filter((item) => item.price > 0 && item.qty > 0);
      setProducts(filtered);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Infinite Scroll Effect
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
  }, []);

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsHeroDropdownOpen(false)
      setIsSortDropdownOpen(false)
      setIsPriceDropdownOpen(false)
    }

    if (isHeroDropdownOpen || isSortDropdownOpen || isPriceDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isHeroDropdownOpen, isSortDropdownOpen, isPriceDropdownOpen])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-[#231650] dark:via-[#2a1f5e] dark:to-[#231650] transition-colors duration-300">
      {/* Header */}
      {mounted && (
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#231650]/95 backdrop-blur-xl border-b border-orange-200 dark:border-[#612E37] shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-xl overflow-hidden shadow-lg ring-2 ring-orange-400 dark:ring-[#FED172]">
                  <Image src="/logo-getrest.jpg" alt="GetRest Store" fill className="object-cover" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white">
                    GetRest <span className="text-[#F3742B] dark:text-[#FED172]">Store</span>
                  </h1>
                  <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">Premium Dota 2 Marketplace</p>
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
                  className="p-2 rounded-lg bg-orange-100 dark:bg-[#612E37] hover:bg-orange-200 dark:hover:bg-[#612E37]/80 transition-colors touch-manipulation"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun size={18} className="text-[#FED172]" /> : <Moon size={18} className="text-[#F3742B]" />}
                </button>
                <Navbar />
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3 md:mb-4">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search items by name or hero..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 md:pl-12 h-10 md:h-12 bg-white dark:bg-[#2a1f5e] border-orange-200 dark:border-[#612E37] focus:border-[#F3742B] dark:focus:border-[#FED172] text-gray-900 dark:text-white placeholder:text-gray-400 text-sm md:text-base"
              />
            </div>

            {/* Stats & Filters */}
            <div className="flex items-center justify-between flex-wrap gap-2 md:gap-3">
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-orange-50 dark:bg-[#612E37]/30 rounded-full border border-orange-200 dark:border-[#612E37]">
                  <ShoppingBag size={12} md:size={14} className="text-[#F3742B] dark:text-[#FED172]" />
                  <span className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">{filteredAndSorted.length} Variants</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-yellow-50 dark:bg-[#612E37]/30 rounded-full border border-yellow-200 dark:border-[#612E37]">
                  <Package size={12} md:size={14} className="text-[#F3742B] dark:text-[#FED172]" />
                  <span className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">{filteredAndSorted.reduce((sum, p) => sum + p.qty, 0)} In Stock</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Hero Filter */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsHeroDropdownOpen(!isHeroDropdownOpen)
                      setIsSortDropdownOpen(false)
                      setIsPriceDropdownOpen(false)
                    }}
                    className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 bg-white dark:bg-[#612E37] hover:bg-orange-50 dark:hover:bg-[#612E37]/80 active:scale-95 border border-orange-200 dark:border-[#612E37] rounded-lg text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 transition-all touch-manipulation"
                  >
                    <Star size={14} />
                    <span className="hidden sm:inline">Hero</span>
                    <ChevronDown size={14} className={`transition-transform ${isHeroDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isHeroDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full mt-2 right-0 w-52 max-h-80 md:max-h-96 overflow-y-auto bg-white dark:bg-[#2a1f5e] rounded-lg shadow-2xl border-2 border-orange-200 dark:border-[#612E37] z-20"
                      >
                        <button
                          onClick={() => {
                            setSelectedHero("all")
                            setIsHeroDropdownOpen(false)
                          }}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-orange-50 dar k:hover:bg-[#612E37]/50 transition-colors first:rounded-t-lg touch-manipulation ${selectedHero === "all" ? "bg-orange-100 dark:bg-[#612E37] text-[#F3742B] dark:text-[#FED172] font-semibold" : "text-gray-700 dark:text-gray-300"
                            }`}
                        >
                          All Heroes
                        </button>
                        {uniqueHeroes.map((hero) => (
                          <button
                            key={hero}
                            onClick={() => {
                              setSelectedHero(hero as string)
                              setIsHeroDropdownOpen(false)
                            }}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-orange-50 dark:hover:bg-[#612E37]/50 transition-colors last:rounded-b-lg touch-manipulation ${selectedHero === hero ? "bg-orange-100 dark:bg-[#612E37] text-[#F3742B] dark:text-[#FED172] font-semibold" : "text-gray-700 dark:text-gray-300"
                              }`}
                          >
                            {hero}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sort */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsSortDropdownOpen(!isSortDropdownOpen)
                      setIsHeroDropdownOpen(false)
                      setIsPriceDropdownOpen(false)
                    }}
                    className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 bg-white dark:bg-[#612E37] hover:bg-orange-50 dark:hover:bg-[#612E37]/80 active:scale-95 border border-orange-200 dark:border-[#612E37] rounded-lg text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 transition-all touch-manipulation"
                  >
                    <SortAsc size={14} />
                    <span className="hidden sm:inline">Sort</span>
                    <ChevronDown size={14} className={`transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isSortDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-[#2a1f5e] rounded-lg shadow-2xl border-2 border-orange-200 dark:border-[#612E37] z-20"
                      >
                        {[
                          { value: "price-high", label: "Price: High to Low" },
                          { value: "price-low", label: "Price: Low to High" },
                          { value: "name-asc", label: "Name: A to Z" },
                          { value: "name-desc", label: "Name: Z to A" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value as SortOption)
                              setIsSortDropdownOpen(false)
                            }}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-orange-50 dark:hover:bg-[#612E37]/50 transition-colors first:rounded-t-lg last:rounded-b-lg touch-manipulation ${sortBy === option.value ? "bg-orange-100 dark:bg-[#612E37] text-[#F3742B] dark:text-[#FED172] font-semibold" : "text-gray-700 dark:text-gray-300"
                              }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Price Filter */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsPriceDropdownOpen(!isPriceDropdownOpen)
                      setIsHeroDropdownOpen(false)
                      setIsSortDropdownOpen(false)
                    }}
                    className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 bg-white dark:bg-[#612E37] hover:bg-orange-50 dark:hover:bg-[#612E37]/80 active:scale-95 border border-orange-200 dark:border-[#612E37] rounded-lg text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 transition-all touch-manipulation"
                  >
                    <Filter size={14} />
                    <span className="hidden sm:inline">Price</span>
                    <ChevronDown size={14} className={`transition-transform ${isPriceDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isPriceDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full mt-2 right-0 w-44 bg-white dark:bg-[#2a1f5e] rounded-lg shadow-2xl border-2 border-orange-200 dark:border-[#612E37] z-20"
                      >
                        {priceRanges.map((range) => (
                          <button
                            key={range.label}
                            onClick={() => {
                              setPriceRange([range.min, range.max])
                              setIsPriceDropdownOpen(false)
                            }}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-orange-50 dark:hover:bg-[#612E37]/50 transition-colors first:rounded-t-lg last:rounded-b-lg touch-manipulation ${priceRange[0] === range.min && priceRange[1] === range.max ? "bg-orange-100 dark:bg-[#612E37] text-[#F3742B] dark:text-[#FED172] font-semibold" : "text-gray-700 dark:text-gray-300"
                              }`}
                          >
                            {range.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse bg-orange-100 dark:bg-[#612E37]/30 rounded-xl h-64 border border-orange-200 dark:border-[#612E37]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredAndSorted.slice(0, visibleCount).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => handleCardClick(item)}
                className="group cursor-pointer touch-manipulation"
              >
                <div className="bg-white dark:bg-[#2a1f5e] rounded-xl border-2 border-orange-200 dark:border-[#612E37] hover:border-[#F3742B] dark:hover:border-[#FED172] active:scale-[0.98] transition-all overflow-hidden shadow-sm hover:shadow-xl">
                  {/* Image */}
                  <div className="relative h-40 md:h-48 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-[#231650] dark:to-[#612E37] overflow-hidden">
                    <LiquipediaImage
                      itemName={item.name}
                      className="p-3 md:p-4 group-hover:scale-110 transition-transform duration-300"
                      priority={index < 6}
                    />
                    <div className="absolute top-2 md:top-3 right-2 md:right-3 px-1.5 md:px-2 py-0.5 md:py-1 bg-white/90 dark:bg-[#231650]/90 backdrop-blur rounded-full border border-orange-200 dark:border-[#612E37]">
                      <span className="text-[10px] md:text-xs font-bold text-[#F3742B] dark:text-[#FED172]">{item.qty} left</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 md:p-4">
                    <div className="mb-2">
                      <h3 className="font-bold text-sm md:text-lg text-gray-900 dark:text-white truncate group-hover:text-[#F3742B] dark:group-hover:text-[#FED172] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                        <Star size={10} md:size={12} className="text-yellow-500" fill="currentColor" />
                        {item.hero || "Dota 2"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Price</p>
                        <p className="text-lg md:text-2xl font-black text-[#F3742B] dark:text-[#FED172]">
                          {formatRupiah(item.price)}
                        </p>
                      </div>
                      <button className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-[#F3742B] to-[#B83A14] hover:from-[#B83A14] hover:to-[#F3742B] active:scale-95 text-white rounded-lg font-semibold text-xs md:text-sm shadow-lg shadow-orange-500/30 transition-all touch-manipulation">
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
          <div className="text-center mt-6 md:mt-8">
            <div className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-[#F3742B] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#FED172] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-[#B83A14] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <span className="ml-2">Loading more items...</span>
            </div>
          </div>
        )}

        {filteredAndSorted.length === 0 && !isLoading && (
          <div className="text-center py-16 md:py-20">
            <ShoppingBag className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={48} md:size={64} />
            <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-900 dark:text-white">No Items Found</h3>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
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
              className="relative bg-white dark:bg-[#2a1f5e] p-4 md:p-8 rounded-2xl w-full max-w-2xl shadow-2xl border-2 border-orange-200 dark:border-[#612E37] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-3 md:top-4 right-3 md:right-4 p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-full transition-colors touch-manipulation"
                aria-label="Close"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-red-600 dark:text-red-400" />
              </button>

              <div className="mb-4 md:mb-6">
                <h2 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 pr-8">
                  {selectedItem.name}
                </h2>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Star size={12} md:size={14} className="text-yellow-500" fill="currentColor" />
                  {selectedItem.hero}
                </p>
              </div>

              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 p-3 md:p-4 bg-orange-50 dark:bg-[#612E37]/30 rounded-xl border border-orange-200 dark:border-[#612E37]">
                {steamAvatar && (
                  <a href={STEAM_PROFILE_URL} target="_blank" rel="noopener noreferrer">
                    <img src={steamAvatar} alt="Seller" className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-[#F3742B] dark:border-[#FED172]" />
                  </a>
                )}
                <div className="flex-1">
                  <a href={STEAM_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-base md:text-lg text-gray-900 dark:text-white hover:text-[#F3742B] dark:hover:text-[#FED172] transition-colors">
                    {steamName || "GETREST.ID | 0813 8888 3983 (WA)"}
                  </a>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">1161 Items • 691 Delivered</p>
                </div>
                <div className="px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-[#FED172] to-[#F3742B] text-[#231650] text-[10px] md:text-xs font-black rounded-full uppercase">
                  Verified
                </div>
              </div>

              <div className="space-y-2 mb-4 md:mb-6 p-3 md:p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <p className="flex items-start gap-2 text-xs md:text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>30 days Steam friendship required</span>
                </p>
                <p className="flex items-start gap-2 text-xs md:text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Check availability in <a href={`https://steamcommunity.com/profiles/${STEAM_ID}/inventory`} target="_blank" className="text-[#F3742B] dark:text-[#FED172] underline font-semibold">Inventory</a></span>
                </p>
                <p className="flex items-start gap-2 text-xs md:text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>50% down payment for booking</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 md:gap-3">
                <Button
                  onClick={() => window.open(videoUrl, "_blank")}
                  className="h-10 md:h-12 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-semibold text-xs md:text-sm touch-manipulation"
                >
                  <TvMinimalPlay className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Preview</span>
                  <span className="sm:hidden">Play</span>
                </Button>

                <a
                  href="https://www.facebook.com/LexyAlexaRekber/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 md:h-12 inline-flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold rounded-lg transition-all text-xs md:text-sm touch-manipulation"
                >
                  <Facebook className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Facebook</span>
                  <span className="sm:hidden">FB</span>
                </a>

                <a
                  href={`https://wa.me/6281388883983?text=${encodeURIComponent(`Hi! I want to buy "${selectedItem.name}"`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 md:h-12 inline-flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-semibold rounded-lg transition-all text-xs md:text-sm touch-manipulation"
                >
                  <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">WhatsApp</span>
                  <span className="sm:hidden">WA</span>
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
