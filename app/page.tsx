"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { CheckCircle, Facebook, ImageIcon, MessageCircle, Search, TvMinimalPlay, X } from "lucide-react"
import Navbar from "@/components/ui/Navbar"
import { useDebounce } from "@/lib/useDebounce"
import { useTheme } from "next-themes"


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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)
  const { theme } = useTheme()
  const [visibleCount, setVisibleCount] = useState(10)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [videoUrl, setVideoUrl] = useState<string>("")

  const STEAM_ID = "76561198329596689"
  const API_URL = `/api/steam-profile?steamId=${STEAM_ID}`;

  const [steamName, setSteamName] = useState("");
  const [steamAvatar, setSteamAvatar] = useState("");

  const whatsappMessage = `Halo kak, saya berminat untuk item "${searchQuery}", apakah masih tersedia?`;

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

      const sorted = merged.sort((a, b) => a.price - b.price);

      const filtered = sorted.filter((item) => item.price > 0 && item.qty > 0);
      setProducts(filtered);
    };

    fetchData();
  }, []);

  // Infinite Scroll Effect
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => prev + 10)
      }
    })

    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current)
    }
  }, [])

  // Fetch Steam Name and Avatar
  useEffect(() => {
    const fetchSteamProfile = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        if (data.personaname && data.avatarmedium) {
          setSteamName(data.personaname);
          setSteamAvatar(data.avatarmedium);
        } else {
          console.log("Profile data not found");
        }
      } catch (error) {
        console.error("Error fetching Steam profile:", error);
      }
    };

    fetchSteamProfile();
}, []);

  const searched = products.filter((p) =>
    p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    p.hero?.toLowerCase().includes(debouncedQuery.toLowerCase())
  )

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const bgImage =
    !mounted || theme === "system"
      ? "/hero.jpg"
      : theme === "light"
      ? "/hero-light.jpg"
      : "/hero.jpg"

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)

  // Handle Card Click
  const handleCardClick = (item: Product) => {
    const query = `${item.name}`
    setSearchQuery(query)
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
    setVideoUrl(youtubeSearchUrl)
    setIsModalOpen(true)
  }

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSearchQuery("") // Clear query when closing modal
    setVideoUrl("") // Clear video URL when closing modal
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#1b2a38] dark:text-white font-sans">
      {/* Hero Section */}
      {mounted && (
        <section
          className="relative h-[340px] bg-cover bg-center flex items-center justify-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white dark:from-black/60 dark:to-[#1b2a38]" />
          <div className="relative z-10 w-full max-w-3xl px-6 text-center space-y-3">
            <div className="flex items-center gap-2 px-5 py-4 rounded-md shadow-lg ring-1 ring-black/10 backdrop-blur-md bg-neutral-100 text-black dark:bg-[#fffbe6]/90 dark:text-black">
              <Search className="text-gray-500 ms-4" size={18} />
              <Input
                placeholder="Search for item name, hero, treasure"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent border-0 focus-visible:ring-0 text-sm placeholder:text-gray-500"
              />
              <Navbar />
            </div>
            <p className="text-sm text-gray-700 dark:text-white/70">
              Search on {products.length} Giftable Items
            </p>
          </div>
        </section>
      )}

      {/* Items */}
      <main className="py-10 px-4 max-w-5xl mx-auto space-y-5">
        {searched.slice(0, visibleCount).map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-white text-black dark:bg-[#2a2a3c] dark:text-white border border-gray-200 dark:border-none hover:bg-gray-50 dark:hover:bg-[#333344] transition-all rounded-xl shadow-sm cursor-pointer"
              onClick={() => handleCardClick(item)}
            >
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-4">
                  {item.icon ? (
                    <img
                      src={item.icon}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded border border-white/10"
                    />
                  ) : (
                    <img
                      src="/icon.png"
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded border border-white/10"
                    />
                    // skeleton
                    // <ImageIcon className="w-12 h-12 p-2 bg-black/30 rounded flex items-center justify-center text-white/40" />
                  )}
                  <div>
                    <div className="font-semibold text-sm">{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.hero}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm space-y-1">
                  <div>Qty: {item.qty}</div>
                  <div>{formatRupiah(item.price)}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {visibleCount < searched.length && (
          <p className="text-center text-sm text-gray-400">Loading more...</p>
        )}

        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="h-10" />
      </main>

      {/* Modal for Rules and Profile */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="relative bg-white dark:bg-[#2a2a3c] p-6 rounded-xl w-full max-w-3xl text-black dark:text-white">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <b onClick={() => window.open(videoUrl, "_blank")} className="cursor-pointer">{searchQuery}</b>
            </p>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
              <a href={`https://steamcommunity.com/profiles/${STEAM_ID}`} target="_blank" rel="noopener noreferrer">
                <img src={steamAvatar} alt="Steam Avatar" className="w-11 h-11 rounded-full border cursor-pointer" />
              </a>
              <div className="flex flex-col">
                <span className="font-bold">{}</span>
                <a href={`https://steamcommunity.com/profiles/${STEAM_ID}`} target="_blank" rel="noopener noreferrer" className="font-bold text-sm cursor-pointer">
                  <span className="text-m text-gray-500 dark:text-gray-400">{steamName}</span>
                </a>
                <span className="text-xs text-gray-500 dark:text-gray-400">1161 Items • 111 Reserved • 691 Delivered</span>
              </div>
              <div className="ml-auto px-3 py-1 text-xs bg-yellow-300 text-yellow-900 font-bold rounded-full">
                <a href={`https://steamcommunity.com/profiles/${STEAM_ID}`} target="_blank" rel="noopener noreferrer">
                  OWNER
                </a>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="flex items-start gap-1">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                Wajib berteman 30 hari di 
                <a href={`https://steamcommunity.com/profiles/${STEAM_ID}`} target="_blank" className="text-blue-500 underline">
                  Steam.
                </a>
              </p>
              <p className="flex items-start gap-1">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                Selalu periksa ketersediaan item di <a href={`https://steamcommunity.com/profiles/${STEAM_ID}/inventory`} target="_blank" className="text-blue-500 underline">Inventory Steam.</a>
              </p>
              <p className="flex items-start gap-1">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                Lakukan pembayaran DP 50%/Full Payment untuk booking 
                <a href={`https://wa.me/6281388883983?text=${encodeURIComponent(`Halo kak, saya mau beli item "${searchQuery}", apakah itemnya masih ada? Transfernya kemana ya kak?`)}`} target="_blank" className="text-blue-500 underline">Booking Item.</a>
              </p>
            </div>

            <div className="text-right mt-6">
              <Button
                onClick={() => window.open(videoUrl, "_blank")}
                className="mt-2 me-1 cursor-pointer"
              >
                <TvMinimalPlay className="w-4 h-4" />
                Item Preview
              </Button>

              <a
                href="https://www.facebook.com/LexyAlexaRekber/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md me-1"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </a>

              <a
                href={`https://wa.me/6281388883983?text=${encodeURIComponent(`Halo kak, saya mau beli item "${searchQuery}", apakah itemnya masih ada? Transfernya kemana ya kak?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-md"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
