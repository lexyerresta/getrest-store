"use client"

import { useEffect, useState } from "react"

type MarketItem = { name: string; price: number; qty: number }

export function SkinMarketTicker() {
  const [items, setItems] = useState<MarketItem[]>([])
  useEffect(() => {
    const controller = new AbortController()
    fetch("/prices.json", { signal: controller.signal })
      .then(res => { if (!res.ok) throw new Error("Catalogue unavailable"); return res.json() })
      .then((data: MarketItem[]) => setItems(data.filter(item => item.price > 0 && item.qty > 0).slice(0, 8)))
      .catch(() => { /* This optional preview can stay empty; the main catalogue has its own state. */ })
    return () => controller.abort()
  }, [])
  if (!items.length) return null
  return (
    <aside aria-label="In-stock price preview" className="border-b border-slate-200 dark:border-white/10 bg-stone-100 dark:bg-[#101827]">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-5 py-3">
        <span className="shrink-0 text-xs font-semibold text-slate-600 dark:text-slate-300">In stock</span>
        <ul tabIndex={0} aria-label="Scroll for more prices" className="flex gap-6 overflow-x-auto text-xs pb-1">
          {items.map(item => <li key={item.name} className="shrink-0 flex gap-2">
            <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
            <span className="font-semibold tabular-nums">Rp {item.price.toLocaleString("id-ID")}</span>
          </li>)}
        </ul>
      </div>
    </aside>
  )
}
