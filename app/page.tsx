"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ImageIcon, Search } from "lucide-react"
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

  useEffect(() => {
    const fetchData = async () => {
      const [invRes, priceRes] = await Promise.all([
        fetch("/api/inventory"),
        fetch("/prices.json"),
      ])

      const invData = await invRes.json()
      const priceData: PriceOverride = await priceRes.json()

      if (!invData.success) return

      const merged: Product[] = invData.items.map((item: Product) => {
        const override = priceData.find((p) => p.name === item.name)
        return {
          ...item,
          price: override?.price ?? 0,
          qty:
            override?.qty !== undefined && override?.qty !== null
              ? override.qty
              : item.qty,
        }
      })

      const filtered = merged.filter((item) => item.price > 0 && item.qty > 0)
      setProducts(filtered)
    }

    fetchData()
  }, [])

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
    const query = `${item.name} Dota 2 Cache`
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
                    <ImageIcon className="w-12 h-12 p-2 bg-black/30 rounded flex items-center justify-center text-white/40" />
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

      {/* Modal for YouTube Video Search */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-3xl">
            <h2 className="text-lg font-semibold mb-4">Preview Item</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-600">
                Searching for: <b>{searchQuery}</b>
              </p>
            </div>

            {/* Fallback: Direct YouTube search results in iframe */}
            <div>
              <iframe
                width="100%"
                height="400px"
                src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(searchQuery)}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <Button
              onClick={() => window.open(videoUrl, "_blank")} // If iframe doesn't load, open in a new tab
              className="mt-4 me-2"
            >
              Search on YouTube
            </Button>
            <Button onClick={handleCloseModal} className="mt-4">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
