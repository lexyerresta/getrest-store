"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import {
  Package,
  Filter,
  Search,
  TvMinimalPlay,
  Facebook,
  MessageCircle,
  X,
  CheckCircle,
  Star,
  ShoppingBag,
  Sun,
  Moon,
  ChevronDown,
  BadgeCheck, // Added BadgeCheck
  SortAsc, // Re-added SortAsc
  ExternalLink, // Re-added ExternalLink
  TrendingUp,
  Flame
} from "lucide-react"

import { useDebounce } from "@/lib/useDebounce"
import { useTheme } from "next-themes"
import { LiquipediaImage } from "@/components/LiquipediaImage"
import { SteamComments } from "@/components/SteamComments"
import { TestMyLuck } from "@/components/TestMyLuck"
import { WelcomePopup } from "@/components/WelcomePopup"
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


const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under 50K", min: 0, max: 50000 },
  { label: "50K - 200K", min: 50000, max: 200000 },
  { label: "200K - 500K", min: 200000, max: 500000 },
  { label: "Above 500K", min: 500000, max: Infinity },
]

interface FilterContentProps {
  query: string
  setQuery: (q: string) => void
  selectedHero: string
  setSelectedHero: (h: string) => void
  uniqueHeroes: string[]
  sortBy: SortOption
  setSortBy: (s: SortOption) => void
  priceRange: [number, number]
  setPriceRange: (r: [number, number]) => void
}

const FilterContent = ({
  query,
  setQuery,
  selectedHero,
  setSelectedHero,
  uniqueHeroes,
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange
}: FilterContentProps) => (
  <div className="space-y-6">
    {/* Seller Info (Mini) */}
    <div className="bg-white dark:bg-[#151e32] p-5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-4 shadow-sm">
      <div className="w-12 h-12 bg-white p-0.5 rounded-full border border-orange-100 ring-2 ring-orange-500/20">
        <Image src="/logo-getrest.jpg" alt="Logo" width={48} height={48} className="rounded-full object-cover" />
      </div>
      <div>
        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Official Seller</div>
        <div className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
          GetRest Store
          <BadgeCheck size={18} className="text-[#1877F2] fill-[#1877F2] text-white" />
        </div>
      </div>
    </div>
    {/* Search Box */}
    <div className="bg-white dark:bg-[#151e32] border border-slate-200 dark:border-white/10 p-5 rounded-xl shadow-sm">
      <h3 className="text-slate-800 dark:text-white text-sm font-bold uppercase mb-3 tracking-wider flex items-center gap-2">
        <Search size={14} className="text-orange-500" /> Search
      </h3>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-slate-50 dark:bg-[#0B1120] border-slate-200 dark:border-white/10 focus:border-orange-500 dark:focus:border-orange-500 h-11 text-sm rounded-lg"
          placeholder="Type to search items..."
        />
      </div>
    </div>

    {/* Filter Panel */}
    <div className="bg-white dark:bg-[#151e32] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-center gap-2">
        <Filter size={16} className="text-orange-500" />
        <span className="text-slate-900 dark:text-white font-bold text-sm">Advanced Filters</span>
      </div>

      <div className="p-5 space-y-6">
        {/* Hero Select */}
        <div>
          <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">Hero</label>
          <div className="relative">
            <select
              value={selectedHero}
              onChange={(e) => setSelectedHero(e.target.value)}
              className="w-full appearance-none bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-slate-200 text-sm px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            >
              <option value="all">All Heroes</option>
              {uniqueHeroes.map(h => <option key={h} value={h || ""}>{h}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>

        {/* Price Sort */}
        <div>
          <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">Sort By</label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full appearance-none bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-slate-200 text-sm px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            >
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>

        {/* Price Filtering Checks */}
        <div>
          <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-3">Price Range</label>
          <div className="space-y-2">
            {priceRanges.map((range, idx) => {
              const isSelected = priceRange[0] === range.min && priceRange[1] === range.max;
              return (
                <div
                  key={idx}
                  onClick={() => setPriceRange([range.min, range.max])}
                  className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-all ${isSelected ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-500/20' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 border border-transparent'}`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${isSelected ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-sm">{range.label}</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  </div>
)

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
  const STEAM_PROFILE_URL = "https://steamcommunity.com/id/GetRestSTORE"
  const STEAM_INVENTORY_URL = "https://steamcommunity.com/id/GetRestSTORE/inventory"
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
  const uniqueHeroes = Array.from(new Set(products.map(p => p.hero).filter((h): h is string => !!h))).sort()

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

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)

  // Lock body scroll when comments modal is open
  useEffect(() => {
    if (isCommentsOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isCommentsOpen])

  const popularItems = useMemo(() => {
    return [...products]
      .filter(p => p.qty > 0)
      .sort((a, b) => {
        if (a.qty !== b.qty) return a.qty - b.qty
        return b.price - a.price
      })
      .slice(0, 4)
  }, [products])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans selection:bg-orange-500 selection:text-white transition-colors duration-300">
      {/* Header */}
      {mounted && (
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#151e32]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 shadow-sm transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-sm ring-1 ring-slate-200 dark:ring-white/10">
                  <Image src="/logo-getrest.jpg" alt="GetRest Store" fill className="object-cover" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    GetRest <span className="text-orange-600 dark:text-orange-500">Store</span>
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={STEAM_INVENTORY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-red-600 hover:to-orange-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-orange-500/20 transition-all hover:shadow-orange-500/40"
                >
                  <Package size={16} />
                  <span>Inventory</span>
                </a>

                <button
                  onClick={() => setIsCommentsOpen(true)}
                  className="relative p-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg shadow-orange-500/20 transition-all group"
                  aria-label="Testimonials"
                >
                  <MessageCircle size={20} className="fill-white/20" />
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-slate-50 dark:border-[#151e32] shadow-sm">193</span>
                </button>

                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-orange-400 transition-all"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Filter Button */}
      <div className="lg:hidden sticky top-[65px] z-30 px-4 py-2 bg-slate-50/95 dark:bg-[#0B1120]/95 backdrop-blur border-b border-slate-200 dark:border-white/10">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 bg-white dark:bg-[#151e32] border border-slate-200 dark:border-white/10 rounded-lg shadow-sm font-bold text-sm text-slate-700 dark:text-slate-300 active:scale-[0.98] transition-transform"
        >
          <Filter size={14} className="text-orange-500" />
          Filter Items & Search
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Popular Items Section */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <TrendingUp size={24} className="text-orange-600 dark:text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Popular Items</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Most sought-after premium skins</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleCardClick(item)}
                className="group relative bg-white dark:bg-[#151e32] rounded-xl border border-slate-200 dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Fire Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-500 text-white rounded-full shadow-lg flex items-center gap-1">
                    <Flame size={10} fill="currentColor" /> HOT
                  </span>
                </div>

                {/* Info Overlay on Hover (Optional, or just static) */}
                {/* Let's stick to clean standard card */}

                {/* Image */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-[#2a1f5e] dark:to-[#1a1425] p-4 flex items-center justify-center overflow-hidden">
                  <LiquipediaImage
                    itemName={item.name}
                    className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Star size={10} className="text-orange-500 fill-orange-500" />
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider text-ellipsis overflow-hidden whitespace-nowrap">{item.hero || "Dota 2"}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors mb-2">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-orange-600 dark:text-orange-500">
                      {formatRupiah(item.price).replace(",00", "")}
                    </span>
                    <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      <ShoppingBag size={12} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* LEFT: Product Grid */}
          <div className="flex-1 w-full order-2 lg:order-1">

            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Showing <span className="text-slate-900 dark:text-white font-bold">{filteredAndSorted.length}</span> results
              </div>

              {/* Active Filters Summary (Optional, good for UX) */}
              {(selectedHero !== "all" || query || priceRange[0] !== 0) && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSelectedHero("all");
                    setPriceRange([0, Infinity]);
                  }}
                  className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <X size={12} /> Clear Filters
                </button>
              )}
            </div>

            {/* Grid Items */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-white dark:bg-[#151e32] rounded-xl animate-pulse border border-slate-200 dark:border-white/10" />
                ))}
              </div>
            ) : filteredAndSorted.length === 0 ? (
              <div className="p-16 text-center bg-white dark:bg-[#151e32] border border-slate-200 dark:border-white/10 rounded-xl">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No items found</h3>
                <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredAndSorted.slice(0, visibleCount).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleCardClick(item)}
                    className="group relative bg-white dark:bg-[#151e32] rounded-xl border border-slate-200 dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-orange-50 dark:from-[#0B1120] dark:to-[#1a1425] p-4 flex items-center justify-center overflow-hidden">
                      <LiquipediaImage
                        itemName={item.name}
                        className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                        priority={index < 6}
                      />

                      {/* Floating Badges */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                        {item.qty < 5 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500 text-white rounded-full shadow-lg">
                            LOW STOCK
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-white/90 dark:bg-black/60 backdrop-blur text-slate-700 dark:text-white rounded-full shadow-sm border border-slate-200 dark:border-white/10">
                          x{item.qty}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 flex-1 flex flex-col">
                      <div className="mb-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Star size={10} className="text-orange-500 fill-orange-500" />
                          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider text-ellipsis overflow-hidden whitespace-nowrap">{item.hero || "Dota 2"}</span>
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-2 leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                          {item.name}
                        </h3>
                      </div>

                      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/5 flex items-end justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-medium">Price</span>
                          <span className="text-base font-black text-orange-600 dark:text-orange-500">
                            {formatRupiah(item.price).replace(",00", "")}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                          <ShoppingBag size={14} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {visibleCount < filteredAndSorted.length && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setVisibleCount(prev => prev + 50)}
                  className="px-8 py-3 bg-white dark:bg-[#151e32] hover:bg-slate-50 dark:hover:bg-[#1e293b] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md"
                >
                  Load More Items
                </button>
              </div>
            )}

            <div ref={loadMoreRef} className="h-8" />
          </div>

          {/* RIGHT: Sidebar Filters (Desktop only) */}
          <aside className="hidden lg:block w-80 flex-shrink-0 sticky top-24 h-fit">
            <FilterContent
              query={query}
              setQuery={setQuery}
              selectedHero={selectedHero}
              setSelectedHero={setSelectedHero}
              uniqueHeroes={uniqueHeroes}
              sortBy={sortBy}
              setSortBy={setSortBy}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
          </aside>

        </div>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileFilterOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-slate-50 dark:bg-[#0B1120] shadow-2xl p-5 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Filters</h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 bg-slate-200 dark:bg-white/10 rounded-full text-slate-600 dark:text-slate-300"
                >
                  <X size={20} />
                </button>
              </div>

              <FilterContent
                query={query}
                setQuery={setQuery}
                selectedHero={selectedHero}
                setSelectedHero={setSelectedHero}
                uniqueHeroes={uniqueHeroes}
                sortBy={sortBy}
                setSortBy={setSortBy}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
              />

              <div className="sticky bottom-0 mt-6 pt-4 pb-2 bg-slate-50 dark:bg-[#0B1120] border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
                >
                  Show {filteredAndSorted.length} Results
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-[#151e32] p-5 md:p-8 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </button>

              <div className="mb-6 flex gap-5">
                <div className="w-24 h-24 bg-slate-50 dark:bg-[#0B1120] border-2 border-slate-200 dark:border-white/10 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                  <LiquipediaImage itemName={selectedItem.name} className="p-2" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1 leading-tight">
                    {selectedItem.name}
                  </h2>
                  <p className="text-orange-600 dark:text-orange-500 text-sm font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <Star size={14} fill="currentColor" /> {selectedItem.hero || "Dota 2"}
                  </p>
                  <div className="mt-3 inline-flex items-center px-2.5 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md text-xs text-slate-600 dark:text-slate-300">
                    In Stock: <span className="text-slate-900 dark:text-white font-bold ml-1">{selectedItem.qty}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-[#0B1120] p-4 border border-slate-200 dark:border-white/10 rounded-xl">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">Price</div>
                  <div className="text-3xl font-black text-orange-600 dark:text-orange-500">{formatRupiah(selectedItem.price)}</div>
                </div>
                <div className="bg-slate-50 dark:bg-[#0B1120] p-4 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">Seller</div>
                    <div className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
                      <img src="/verified.svg" alt="Verified" className="w-5 h-5" />
                      GetRest Store
                    </div>
                  </div>
                  <a href={STEAM_INVENTORY_URL} target="_blank" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">Verify</a>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 mb-6">
                <h4 className="text-blue-900 dark:text-blue-200 font-bold mb-3 flex items-center gap-2 text-sm uppercase">
                  <Package size={16} /> How to Buy
                </h4>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                  <li className="flex gap-2"><CheckCircle size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" /> Add friend on Steam first (30 days wait for gift).</li>
                  <li className="flex gap-2"><CheckCircle size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" /> Message us on WhatsApp/Facebook to book.</li>
                  <li className="flex gap-2"><CheckCircle size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" /> Pay down payment to secure the item.</li>
                </ul>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => window.open(videoUrl, "_blank")}
                  className="h-11 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-white/10"
                >
                  <TvMinimalPlay className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Preview</span>
                </Button>

                <a
                  href="https://www.facebook.com/LexyAlexaRekber/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 inline-flex items-center justify-center px-4 bg-[#1877F2] hover:bg-[#1864f2] text-white font-bold rounded-lg transition-all text-sm shadow-lg shadow-blue-500/20"
                >
                  <Facebook className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Facebook</span>
                </a>

                <a
                  href={`https://wa.me/6281388883983?text=${encodeURIComponent(`Halo! Saya mau beli "${selectedItem.name}" dari GetRest Store. Apakah masih tersedia?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 inline-flex items-center justify-center px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-lg transition-all text-sm shadow-lg shadow-green-500/20"
                >
                  <MessageCircle className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Modal */}
      <AnimatePresence>
        {isCommentsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={() => setIsCommentsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-[#151e32] rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-white/10 max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B1120]">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageCircle size={20} className="text-orange-500" />
                  Customer Comments
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-2">(193 Verified Comments)</span>
                </h3>
                <button
                  onClick={() => setIsCommentsOpen(false)}
                  className="p-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={18} className="text-slate-600 dark:text-slate-300" />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden p-0 flex flex-col">
                <SteamComments />
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B1120]">
                <a
                  href="https://steamcommunity.com/id/GetRestSTORE/allcomments"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#171a21] hover:bg-[#2a475e] text-white rounded-xl transition-all text-sm font-bold shadow-lg shadow-black/20"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-4.6 0-8.45-3.08-9.64-7.27l3.83 1.58a2.84 2.84 0 0 0 2.78 2.27c1.56 0 2.83-1.27 2.83-2.83v-.13l3.4-2.43h.08c2.08 0 3.77-1.69 3.77-3.77s-1.69-3.77-3.77-3.77-3.78 1.69-3.78 3.77v.05l-2.37 3.46-.16-.01c-.59 0-1.14.18-1.59.49L2 11.2C2.43 6.05 6.73 2 12 2M8.28 17.17c.8.33 1.72-.04 2.05-.84.33-.8-.05-1.71-.83-2.04l-1.28-.53c.49-.18 1.04-.19 1.59.03.53.21.94.62 1.15 1.15.22.52.22 1.1 0 1.62-.43 1.08-1.7 1.6-2.78 1.15-.5-.21-.88-.59-1.09-1.04l1.22.5z" />
                  </svg>
                  View All Comments on Steam
                  <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-slate-200 dark:border-white/10 mt-12 bg-white dark:bg-[#151e32]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-2">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">You've reached the end!</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              That's all the items we have for now. Check back later for new stock or try searching for something specific.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>GetRest Store</span>
              <span>•</span>
              <span>&copy; {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </footer>

      <WelcomePopup products={products} onSelectProduct={handleCardClick} />
      <TestMyLuck products={products} onItemSelected={handleCardClick} />
    </div>
  )
}
