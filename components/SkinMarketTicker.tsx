
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Activity } from "lucide-react";

interface MarketItem {
    name: string;
    hero: string;
    price: number;
    qty: number;
}

export function SkinMarketTicker() {
    const [items, setItems] = useState<MarketItem[]>([]);

    useEffect(() => {
        // Fetch items from prices.json
        fetch("/prices.json")
            .then((res) => res.json())
            .then((data: MarketItem[]) => {
                // Strict filter: Price > 0 AND Stock > 0
                const validItems = data.filter(item => item.price > 0 && item.qty > 0);

                // Shuffle for variety
                const shuffled = validItems.sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 30);

                setItems(selected);
            });
    }, []);

    if (items.length === 0) return null;

    return (
        // Adaptive Design:
        // Light Mode: Clean White/Gray Stock Ticker
        // Dark Mode: Deep Black + Neon Stock Exchange Aesthetic
        <div className="w-full bg-slate-50/80 dark:bg-[#050505] border-b border-slate-200 dark:border-[#1a1a1a] overflow-hidden py-2.5 relative z-50 shadow-sm backdrop-blur-md">

            {/* "LIVE MARKET" label */}
            <div className="absolute left-0 top-0 bottom-0 z-10 bg-slate-50 dark:bg-[#050505] px-4 flex items-center border-r border-slate-200 dark:border-[#1a1a1a] shadow-[10px_0_20px_rgba(255,255,255,1)] dark:shadow-[10px_0_20px_#050505]">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ring-2 ring-green-500/20" />
                    <span className="text-[10px] font-black tracking-widest text-slate-700 dark:text-slate-400 uppercase">Live Market</span>
                </div>
            </div>

            <div className="flex whitespace-nowrap mask-linear-gradient-sides">
                <motion.div
                    className="flex gap-12 items-center pl-32" // Padding left to clear the label
                    animate={{ x: [0, -1500] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 50,
                    }}
                    style={{ width: "max-content" }}
                >
                    {/* Render list twice to ensure seamless loop */}
                    {[...items, ...items].map((item, index) => (
                        <div
                            key={`${item.name}-${index}`}
                            className="flex items-center gap-3 text-sm font-medium group cursor-pointer hover:opacity-100 opacity-90 transition-opacity"
                        >
                            {/* Stock Ticker format: HERO: ITEM_NAME */}
                            <div className="flex flex-col leading-none text-right">
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    {item.hero.substring(0, 12)}
                                </span>
                            </div>

                            <span className="text-slate-900 dark:text-white font-bold tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {item.name}
                            </span>

                            {/* Financial Color: Dark Green for Light Mode, Neon Green for Dark Mode */}
                            <span className="font-mono font-bold text-emerald-700 bg-emerald-100/50 dark:text-[#00ff41] dark:bg-[#00ff41]/5 px-1.5 py-0.5 rounded text-xs tracking-wider border border-emerald-200/50 dark:border-transparent">
                                Rp {item.price.toLocaleString("id-ID")}
                            </span>

                            {/* Separator */}
                            <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-800 ml-2" />
                        </div>
                    ))}
                </motion.div>
            </div>

            <style jsx>{`
                .mask-linear-gradient-sides {
                    mask-image: linear-gradient(to right, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%);
                }
            `}</style>
        </div>
    );
}
