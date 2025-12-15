"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Facebook, MessageCircle, Search, TvMinimalPlay, X, Filter, SortAsc, ChevronDown, ExternalLink, ShoppingCart } from "lucide-react"
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
    { label: "All Prices", min: 0, max: Infinity },
    { label: "< Rp 50K", min: 0, max: 50000 },
    { label: "Rp 50K - 200K", min: 50000, max: 200000 },
    { label: "Rp 200K - 500K", min: 200000, max: 500000 },
    { label: "> Rp 500K", min: 500000, max: Infinity },
  ]

  const getLiquipediaUrl = (itemName: string) => {
    const slug = itemName.replace(/\s+/g, '_')
    return `https://liquipedia.net/dota2/${slug}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1b2838] via-[#2a475e] to-[#1b2838] text-white font-sans">
      {/* Header */}
      {mounted && (
        <header className="bg-gradient-to-r from-[#171a21] to-[#1b2838] border-b border-[#3d4450] sticky top-0 z-40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-[#66c0f4]" size={24} />
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#66c0f4] to-[#8ab4f8] bg-clip-text text-transparent">
                  Community Market
                </h1>
              </div>
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search items..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 bg-[#1b2838] border-[#3d4450] focus:border-[#66c0f4] text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
              <Navbar />
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-400">
                Showing {filteredAndSorted.length} items
              </p>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-b from-[#3d4450] to-[#2a475e] hover:from-[#4c5564] hover:to-[#3d4450] text-white rounded text-sm transition-all border border-[#3d4450]">
                    <SortAsc size={14} />
                    <span className="hidden sm:inline">Sort</span>
                    <ChevronDown size={12} />
                  </button>
                  <div className="absolute top-full mt-1 right-0 w-48 bg-[#1b2838] rounded shadow-2xl border border-[#3d4450] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    {[
                      { value: "price-high", label: "Price: High to Low" },
                      { value: "price-low", label: "Price: Low to High" },
                      { value: "name-asc", label: "Name: A to Z" },
                      { value: "name-desc", label: "Name: Z to A" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value as SortOption)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-[#2a475e] transition-colors first:rounded-t last:rounded-b ${sortBy === option.value ? "bg-[#66c0f4]/20 text-[#66c0f4]" : ""
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-b from-[#3d4450] to-[#2a475e] hover:from-[#4c5564] hover:to-[#3d4450] text-white rounded text-sm transition-all border border-[#3d4450]">
                    <Filter size={14} />
                    <span className="hidden sm:inline">Price</span>
                    <ChevronDown size={12} />
                  </button>
                  <div className="absolute top-full mt-1 right-0 w-44 bg-[#1b2838] rounded shadow-2xl border border-[#3d4450] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    {priceRanges.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => setPriceRange([range.min, range.max])}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-[#2a475e] transition-colors first:rounded-t last:rounded-b ${priceRange[0] === range.min && priceRange[1] === range.max ? "bg-[#66c0f4]/20 text-[#66c0f4]" : ""
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
          <div className="grid grid-cols-1 gap-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse bg-[#1b2838]/50 rounded h-20" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAndSorted.slice(0, visibleCount).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => handleCardClick(item)}
                className="group cursor-pointer"
              >
                <div className="bg-gradient-to-r from-[#1b2838] to-[#2a475e] hover:from-[#2a475e] hover:to-[#3d4450] rounded-lg transition-all duration-300 border border-[#3d4450] hover:border-[#66c0f4] overflow-hidden">
                  <div className="grid grid-cols-12 gap-3 md:gap-4 items-center p-3">
                    {/* Image + Name */}
                    <div className="col-span-7 md:col-span-6 flex items-center gap-3">
                      <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-gradient-to-br from-[#3d4450] to-[#1b2838] rounded-lg overflow-hidden border border-[#3d4450] group-hover:border-[#66c0f4] transition-all">
                        <LiquipediaImage
                          itemName={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm md:text-base text-white truncate group-hover:text-[#66c0f4] transition-colors">
                            {item.name}
                          </h3>
                          <a
                            href={getLiquipediaUrl(item.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <ExternalLink size={14} className="text-gray-400 hover:text-[#66c0f4]" />
                          </a>
                        </div>
                        <p className="text-xs md:text-sm text-gray-400 truncate">
                          {item.hero || "Dota 2"}
                        </p>
                      </div>
                    </div>

                    {/* Quantity - Hidden on mobile */}
                    <div className="hidden md:block md:col-span-2 text-center">
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#1b2838] rounded-full border border-[#3d4450]">
                        <span className="text-sm text-gray-300">{item.qty}</span>
                        <span className="text-xs text-gray-500">available</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-5 md:col-span-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-400">Starting at</span>
                        <div className="text-lg md:text-xl font-bold bg-gradient-to-r from-[#66c0f4] to-[#8ab4f8] bg-clip-text text-transparent">
                          {formatRupiah(item.price)}
                        </div>
                        {/* Qty on mobile */}
                        <span className="md:hidden text-xs text-gray-500">{item.qty} available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {visibleCount < filteredAndSorted.length && (
          <div className="text-center mt-8 text-sm text-gray-400">
            <div className="inline-flex items-center gap-2">
              <div className="w-2 h-2 bg-[#66c0f4] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#8ab4f8] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-[#a8c5f4] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <span className="ml-2">Loading more...</span>
            </div>
          </div>
        )}

        {filteredAndSorted.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No Items Found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-gradient-to-br from-[#1b2838] to-[#2a475e] p-6 md:p-8 rounded-2xl w-full max-w-2xl text-white shadow-2xl border border-[#3d4450]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedItem.name}
                </h2>
                <p className="text-gray-400">{selectedItem.hero}</p>
              </div>

              <div className="flex items-center gap-3 mb-6 p-4 bg-[#1b2838] rounded-xl border border-[#3d4450]">
                <a href={`https://steamcommunity.com/profiles/${STEAM_ID}`} target="_blank" rel="noopener noreferrer">
                  <img src={steamAvatar} alt="Steam Avatar" className="w-14 h-14 rounded-full border-2 border-[#66c0f4]" />
                </a>
                <div className="flex-1">
                  <a href={`https://steamcommunity.com/profiles/${STEAM_ID}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-lg hover:text-[#66c0f4] transition-colors">
                    {steamName}
                  </a>
                  <p className="text-sm text-gray-400">1161 Items • 691 Delivered</p>
                </div>
                <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold rounded-full">
                  OWNER
                </div>
              </div>

              <div className="space-y-2 mb-6 bg-green-900/20 p-4 rounded-xl border border-green-700/30">
                <p className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Wajib berteman 30 hari di <a href={`https://steamcommunity.com/profiles/${STEAM_ID}`} target="_blank" className="text-[#66c0f4] underline">Steam</a></span>
                </p>
                <p className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Periksa ketersediaan di <a href={`https://steamcommunity.com/profiles/${STEAM_ID}/inventory`} target="_blank" className="text-[#66c0f4] underline">Inventory</a></span>
                </p>
                <p className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Pembayaran DP 50% untuk booking</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => window.open(videoUrl, "_blank")}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-11"
                >
                  <TvMinimalPlay className="w-4 h-4 mr-2" />
                  Preview
                </Button>

                <a
                  href="https://www.facebook.com/LexyAlexaRekber/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg h-11"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </a>

                <a
                  href={`https://wa.me/6281388883983?text=${encodeURIComponent(`Halo, saya mau beli item "${selectedItem.name}"`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg h-11"
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
