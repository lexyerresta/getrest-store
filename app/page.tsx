"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Facebook, MessageCircle, Search, TvMinimalPlay, X, Filter, SortAsc, ChevronDown, ExternalLink } from "lucide-react"
import Navbar from "@/components/ui/Navbar"
import { useDebounce } from "@/lib/useDebounce"
import { useTheme } from "next-themes"
import { LiquipediaImage } from "@/components/LiquipediaImage"

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
  const [searchQuery, setSearchQuery] = useState<string>("")
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

  const bgImage = "/hero.jpg"

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)

  const handleCardClick = (item: Product) => {
    const query = `${item.name}`
    setSearchQuery(query)
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
    setVideoUrl(youtubeSearchUrl)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSearchQuery("")
    setVideoUrl("")
  }

  const priceRanges = [
    { label: "All", min: 0, max: Infinity },
    { label: "< 50K", min: 0, max: 50000 },
    { label: "50K - 200K", min: 50000, max: 200000 },
    { label: "200K - 500K", min: 200000, max: 500000 },
    { label: "> 500K", min: 500000, max: Infinity },
  ]

  // Generate Liquipedia URL
  const getLiquipediaUrl = (itemName: string) => {
    const slug = itemName.replace(/\s+/g, '_')
    return `https://liquipedia.net/dota2/${slug}`
  }

  return (
    <div className="min-h-screen bg-[#0a1628] dark:bg-[#0a1628] text-white font-sans">
      {/* Hero Section */}
      {mounted && (
        <section
          className="relative h-[320px] bg-cover bg-center flex items-center justify-center overflow-hidden"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a1628]" />

          <div className="relative z-10 w-full max-w-4xl px-6 text-center space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl bg-[#1a2942]/90 backdrop-blur-xl border border-white/10">
              <Search className="text-gray-400 flex-shrink-0" size={20} />
              <Input
                placeholder="Search for item name, hero, treasure"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent border-0 focus-visible:ring-0 text-base placeholder:text-gray-500 text-white"
              />
              <Navbar />
            </div>
            <p className="text-sm text-gray-300">
              Search on {products.length} Giftable items
            </p>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Trending Header + Filters */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Trending</h2>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 bg-[#1a2942] hover:bg-[#243651] text-white rounded-lg text-sm transition-all border border-white/10">
                <SortAsc size={14} />
                Sort
                <ChevronDown size={12} />
              </button>
              <div className="absolute top-full mt-1 right-0 w-48 bg-[#1a2942] rounded-lg shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {[
                  { value: "price-high", label: "Price: High to Low" },
                  { value: "price-low", label: "Price: Low to High" },
                  { value: "name-asc", label: "Name: A to Z" },
                  { value: "name-desc", label: "Name: Z to A" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as SortOption)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[#243651] transition-colors first:rounded-t-lg last:rounded-b-lg ${sortBy === option.value ? "bg-blue-900/30 text-blue-400" : ""
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 bg-[#1a2942] hover:bg-[#243651] text-white rounded-lg text-sm transition-all border border-white/10">
                <Filter size={14} />
                Filter
                <ChevronDown size={12} />
              </button>
              <div className="absolute top-full mt-1 right-0 w-44 bg-[#1a2942] rounded-lg shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {priceRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => setPriceRange([range.min, range.max])}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[#243651] transition-colors first:rounded-t-lg last:rounded-b-lg ${priceRange[0] === range.min && priceRange[1] === range.max ? "bg-green-900/30 text-green-400" : ""
                      }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        {isLoading ? (
          <div className="space-y-1">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse bg-[#1a2942]/50 rounded-lg p-3 h-16" />
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {/* Table Header */}
            <div className="bg-[#1a2942] px-4 py-2 grid grid-cols-12 gap-3 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-white/5">
              <div className="col-span-7">Item</div>
              <div className="col-span-2 text-center">QTY</div>
              <div className="col-span-3 text-right">Price</div>
            </div>

            {/* Items List */}
            {filteredAndSorted.slice(0, visibleCount).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                className="group"
              >
                <div
                  onClick={() => handleCardClick(item)}
                  className="bg-[#0d1a2d] hover:bg-[#1a2942] border-b border-white/5 transition-all cursor-pointer"
                >
                  <div className="px-4 py-3 grid grid-cols-12 gap-3 items-center">
                    {/* Item Info */}
                    <div className="col-span-7 flex items-center gap-3">
                      <div className="relative w-12 h-12 flex-shrink-0 bg-gradient-to-br from-gray-800 to-black rounded overflow-hidden">
                        <LiquipediaImage
                          itemName={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm text-white truncate group-hover:text-blue-400 transition-colors">
                            {item.name}
                          </h3>
                          <a
                            href={getLiquipediaUrl(item.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink size={12} className="text-gray-500 hover:text-blue-400" />
                          </a>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {item.hero}
                        </p>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2 text-center">
                      <span className="text-sm text-gray-300">
                        {item.qty}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="col-span-3 text-right">
                      <div className="text-sm font-semibold text-white">
                        {formatRupiah(item.price)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {visibleCount < filteredAndSorted.length && (
          <div className="text-center mt-8 text-sm text-gray-500">
            <div className="inline-flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <span className="ml-2">Loading more...</span>
            </div>
          </div>
        )}

        {filteredAndSorted.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold mb-1">No Items Found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        <div ref={loadMoreRef} className="h-10" />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#1a2942] p-6 rounded-2xl w-full max-w-2xl text-white shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <h2 className="text-xl font-bold text-white">
                  {searchQuery}
                </h2>
              </div>

              <div className="flex items-center gap-3 mb-6 p-3 bg-[#0d1a2d] rounded-xl">
                <a href={`https://steamcommunity.com/profiles/${STEAM_ID}`} target="_blank" rel="noopener noreferrer">
                  <img src={steamAvatar} alt="Steam Avatar" className="w-12 h-12 rounded-full border-2 border-blue-500" />
                </a>
                <div className="flex-1">
                  <a href={`https://steamcommunity.com/profiles/${STEAM_ID}`} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-blue-400 transition-colors">
                    {steamName}
                  </a>
                  <p className="text-xs text-gray-400">1161 Items • 691 Delivered</p>
                </div>
                <div className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                  OWNER
                </div>
              </div>

              <div className="space-y-2 mb-6 bg-green-900/20 p-4 rounded-xl text-sm">
                <p className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Wajib berteman 30 hari di <a href={`https://steamcommunity.com/profiles/${STEAM_ID}`} target="_blank" className="text-blue-400 underline">Steam</a></span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Periksa ketersediaan di <a href={`https://steamcommunity.com/profiles/${STEAM_ID}/inventory`} target="_blank" className="text-blue-400 underline">Inventory</a></span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Pembayaran DP 50% untuk booking</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                <Button
                  onClick={() => window.open(videoUrl, "_blank")}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <TvMinimalPlay className="w-4 h-4 mr-2" />
                  Preview
                </Button>

                <a
                  href="https://www.facebook.com/LexyAlexaRekber/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </a>

                <a
                  href={`https://wa.me/6281388883983?text=${encodeURIComponent(`Halo, saya mau beli item "${searchQuery}"`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
