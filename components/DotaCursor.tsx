"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Custom SVG Cursors (Data URIs)
const CURSOR_DEFAULT = `url('data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 2.5L12 28L15.5 17.5L26.5 15.5L2.5 2.5Z" fill="%231C1C1C" stroke="%23A83232" stroke-width="2"/><path d="M15.5 17.5L26.5 15.5" stroke="%23A83232" stroke-width="2"/><path d="M12 28L15.5 17.5" stroke="%23A83232" stroke-width="2"/></svg>') 0 0, auto`

const CURSOR_POINTER = `url('data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 2.5L11 26L14.5 16.5L25.5 14.5L2.5 2.5Z" fill="%234A1C1C" stroke="%23FF4500" stroke-width="2"/><circle cx="5" cy="5" r="3" fill="%23FFD700" opacity="0.8"/></svg>') 0 0, pointer`

export function DotaCursor() {
    const [clickEffects, setClickEffects] = useState<{ id: number; x: number; y: number }[]>([])
    const [trail, setTrail] = useState<{ id: number; x: number; y: number }[]>([])
    const requestRef = useRef<number>()

    // Global Cursor Style Injection
    useEffect(() => {
        const style = document.createElement("style")
        style.innerHTML = `
            * { cursor: ${CURSOR_DEFAULT}; }
            button, a, .cursor-pointer, [role="button"] { cursor: ${CURSOR_POINTER} !important; }
        `
        document.head.appendChild(style)
        return () => {
            document.head.removeChild(style)
        }
    }, [])

    // Handle Click Effects (Green/Red "Attack Move" Marker)
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const id = Date.now() + Math.random()
            setClickEffects(prev => [...prev.slice(-4), { id, x: e.clientX, y: e.clientY }])

            // Cleanup
            setTimeout(() => {
                setClickEffects(prev => prev.filter(p => p.id !== id))
            }, 500)
        }

        window.addEventListener("mousedown", handleClick)
        return () => window.removeEventListener("mousedown", handleClick)
    }, [])

    // Handle Particle Trail (Gold Dust)
    useEffect(() => {
        let lastX = 0
        let lastY = 0
        let lastTime = 0

        const handleMove = (e: MouseEvent) => {
            const now = Date.now()
            // Limit creation rate (throttle)
            if (now - lastTime > 40) {
                const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY)
                if (dist > 10) { // Only create if moved enough
                    const id = now + Math.random()
                    setTrail(prev => [...prev.slice(-15), { id, x: e.clientX, y: e.clientY }]) // Keep last 15

                    setTimeout(() => {
                        setTrail(prev => prev.filter(p => p.id !== id))
                    }, 600)

                    lastX = e.clientX
                    lastY = e.clientY
                    lastTime = now
                }
            }
        }

        window.addEventListener("mousemove", handleMove)
        return () => window.removeEventListener("mousemove", handleMove)
    }, [])

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            <AnimatePresence>
                {/* Click Effects (Green Arrow/Cross) */}
                {clickEffects.map(effect => (
                    <motion.div
                        key={effect.id}
                        initial={{ opacity: 1, scale: 0.5 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: effect.x, top: effect.y }}
                    >
                        {/* Dota-style Green Arrows */}
                        <div className="absolute inset-0 border-2 border-[#33FF00] rounded-full opacity-50 shadow-[0_0_10px_#33FF00]" />
                        <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-[#33FF00] -translate-x-1/2 -translate-y-1/2 rotate-45" />
                        <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-[#33FF00] -translate-x-1/2 -translate-y-1/2 -rotate-45" />
                    </motion.div>
                ))}

                {/* Trail Effects (Gold Dust) */}
                {trail.map(t => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0.8, scale: 1, y: 0 }}
                        animate={{ opacity: 0, scale: 0, y: 20 }} // Fall down slightly
                        transition={{ duration: 0.6 }}
                        className="absolute w-2 h-2 rounded-full bg-yellow-400 blur-[1px] shadow-[0_0_5px_rgba(255,215,0,0.8)]"
                        style={{ left: t.x, top: t.y }}
                    />
                ))}
            </AnimatePresence>
        </div>
    )
}
