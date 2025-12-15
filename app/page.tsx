"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Facebook, MessageCircle, Search, TvMinimalPlay, X, Filter, SortAsc, Zap, Package, TrendingUp, Star } from "lucide-react"
import Navbar from "@/components/ui/Navbar"
import { useDebounce } from "@/lib/useDebounce"
import { useTheme } from "next-themes"
import { LiquipediaImage } from "@/components/LiquipediaImage"
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
  const { theme } = useTheme()
  const [visibleCount, setVisibleCount] = useState(50)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Product | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>("")

  const [sortBy, setSortBy] = useState<SortOption>("price-high")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Infinity])

  const STEAM_ID = "76561198329596689"
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

  // Filter & Sort
  const filteredAndSorted = products
    .filter((p) =>
      (p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        p.hero?.toLowerCase().includes(debouncedQuery.toLowerCase())) &&
      p.price >= priceRange[0] && p.price <= priceRange[1]
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
    { label: "All Items", min: 0, max: Infinity },
    { label: "< 50K", min: 0, max: 50000 },
    { label: "50K - 200K", min: 50000, max: 200000 },
    { label: "200K - 500K", min: 200000, max: 500000 },
    { label: "> 500K", min: 500000, max: Infinity },
  ]

  const getLiquipediaUrl = (itemName: string) => {
    const slug = itemName.replace(/\s+/g, '_')
    return `https://liquipedia.net/dota2/${slug}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] text-white font-sans relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      {mounted && (
        <header className="relative z-40 border-b border-cyan-500/20 backdrop-blur-xl bg-[#0a0e27]/80">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                  <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden bg-black">
                    <Image src="/logo-getrest.jpg" alt="GetRest" fill className="object-cover" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                    <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      GETREST
                    </span>
                    <span className="text-white/90"> STORE</span>
                  </h1>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Premium Dota 2 Items</p>
                </div>
              </div>
              <Navbar />
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2 relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-30"></div>
                <div className="relative flex items-center bg-[#1a1f3a] rounded-lg border border-cyan-500/30">
                  <Search className="absolute left-4 text-cyan-400" size={20} />
                  <Input
                    placeholder="Search exclusive items..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-12 bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-gray-500 h-12"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-lg p-3 border border-cyan-500/20">
                  <div className="flex items-center gap-2 text-cyan-400 mb-1">
                    <Package size={14} />
                    <span className="text-xs font-semibold uppercase">Items</span>
                  </div>
                  <p className="text-xl font-bold">{filteredAndSorted.length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-purple-500/20">
                  <div className="flex items-center gap-2 text-purple-400 mb-1">
                    <TrendingUp size={14} />
                    <span className="text-xs font-semibold uppercase">Stock</span>
                  </div>
                  <p className="text-xl font-bold">{products.reduce((sum, p) => sum + p.qty, 0)}</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="text-yellow-400" size={16} />
                <span className="text-sm text-gray-400">Live Marketplace</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 text-white rounded-lg text-sm transition-all border border-cyan-500/30 backdrop-blur">
                    <SortAsc size={14} />
                    <span className="hidden sm:inline">Sort</span>
                  </button>
                  <div className="absolute top-full mt-2 right-0 w-48 bg-[#1a1f3a] rounded-lg shadow-2xl border border-cyan-500/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 backdrop-blur-xl">
                    {[
                      { value: "price-high", label: "💰 Highest Price" },
                      { value: "price-low", label: "🔥 Lowest Price" },
                      { value: "name-asc", label: "🔤 A → Z" },
                      { value: "name-desc", label: "🔤 Z → A" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value as SortOption)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-cyan-500/20 transition-colors first:rounded-t-lg last:rounded-b-lg ${sortBy === option.value ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400" : ""
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white rounded-lg text-sm transition-all border border-purple-500/30 backdrop-blur">
                    <Filter size={14} />
                    <span className="hidden sm:inline">Price</span>
                  </button>
                  <div className="absolute top-full mt-2 right-0 w-44 bg-[#1a1f3a] rounded-lg shadow-2xl border border-purple-500/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 backdrop-blur-xl">
                    {priceRanges.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => setPriceRange([range.min, range.max])}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-purple-500/20 transition-colors first:rounded-t-lg last:rounded-b-lg ${priceRange[0] === range.min && priceRange[1] === range.max ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400" : ""
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl h-24 border border-cyan-500/20" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {filteredAndSorted.slice(0, visibleCount).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02, type: "spring", stiffness: 100 }}
                onClick={() => handleCardClick(item)}
                className="group cursor-pointer"
              >
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-500 group-hover:duration-200"></div>
                  <div className="relative bg-gradient-to-br from-[#1a1f3a] to-[#0f1229] rounded-xl border border-cyan-500/30 group-hover:border-cyan-400 transition-all overflow-hidden backdrop-blur">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-2xl"></div>

                    <div className="relative p-4 flex items-center gap-4">
                      {/* Image */}
                      <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 group-hover:border-cyan-400 transition-all group-hover:scale-105 duration-300">
                        <LiquipediaImage
                          itemName={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base md:text-lg text-white truncate group-hover:text-cyan-400 transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                              <Star size={10} className="text-yellow-400" />
                              {item.hero || "Dota 2"}
                            </p>
                          </div>
                          <div className="flex-shrink-0 px-2 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                            <span className="text-xs font-semibold text-cyan-400">{item.qty} left</span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Price</p>
                            <p className="text-xl md:text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                              {formatRupiah(item.price)}
                            </p>
                          </div>
                          <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-lg text-sm font-semibold transition-all transform group-hover:scale-105">
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {visibleCount < filteredAndSorted.length && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-500/30">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
              <span className="text-sm text-gray-300">Loading quantum items...</span>
            </div>
          </div>
        )}

        {filteredAndSorted.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-pulse">⚡</div>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              No Items Found
            </h3>
            <p className="text-gray-400">Try adjusting your quantum filters</p>
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
            className="fixed inset-0 bg-black/90 backdrop-blur-xl flex justify-center items-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75"></div>
              <div className="relative bg-gradient-to-br from-[#1a1f3a] to-[#0f1229] p-6 md:p-8 rounded-2xl border border-cyan-500/30 backdrop-blur-xl">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors border border-red-500/30"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-red-400" />
                </button>

                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-black mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {selectedItem.name}
                  </h2>
                  <p className="text-gray-400 flex items-center gap-2">
                    <Star size={14} className="text-yellow-400" />
                    {selectedItem.hero}
                  </p>
                </div>

                <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30">
                  <a href={`https://steamcommunity.com/profiles/${STEAM_ID}`} target="_blank" rel="noopener noreferrer">
                    <img src={steamAvatar} alt="Steam Avatar" className="w-16 h-16 rounded-full border-2 border-cyan-400 shadow-lg shadow-cyan-500/50" />
                  </a>
                  <div className="flex-1">
                    <a href={`https://steamcommunity.com/profiles/${STEAM_ID}`} target="_blank" rel="noopener noreferrer" className="font-bold text-lg hover:text-cyan-400 transition-colors">
                      {steamName}
                    </a>
                    <p className="text-sm text-gray-400">1161 Items • 691 Delivered</p>
                  </div>
                  <div className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-black rounded-full uppercase shadow-lg">
                    Verified
                  </div>
                </div>

                <div className="space-y-2 mb-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
                  <p className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>30 days Steam friendship required</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Check availability in <a href={`https://steamcommunity.com/profiles/${STEAM_ID}/inventory`} target="_blank" className="text-cyan-400 underline">Inventory</a></span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>50% down payment for booking</span>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => window.open(videoUrl, "_blank")}
                    className="h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold shadow-lg shadow-purple-500/50"
                  >
                    <TvMinimalPlay className="w-4 h-4 mr-2" />
                    Preview
                  </Button>

                  <a
                    href="https://www.facebook.com/LexyAlexaRekber/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-12 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/50"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </a>

                  <a
                    href={`https://wa.me/6281388883983?text=${encodeURIComponent(`Hi! I want to buy "${selectedItem.name}"`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-12 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-lg shadow-green-500/50"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes tilt {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(1deg); }
          75% { transform: rotate(-1deg); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-tilt {
          animation: tilt 10s infinite linear;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
