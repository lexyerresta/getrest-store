"use client"

import { useMemo, useRef, useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { ArrowDown, ArrowLeft, ArrowRight, Pause, Play } from "lucide-react"
import { LiquipediaImage } from "./LiquipediaImage"

const subscribe = () => () => {}

type Product = { id: string; name: string; hero: string | null; icon: string | null; qty: number; price: number }

export function ArmoryHero({ products, onSelect }: { products: Product[]; onSelect: (item: Product) => void }) {
  const scene = useRef<HTMLElement>(null)
  const preference = useReducedMotion()
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false)
  const reduced = hydrated && preference
  const [paused, setPaused] = useState(false)
  const [index, setIndex] = useState(0)
  const items = useMemo(() => products.filter(p => p.qty > 0 && p.price > 0).sort((a,b) => b.price - a.price).slice(0, 5), [products])
  const item = items[index % (items.length || 1)]
  const { scrollYProgress } = useScroll({ target: scene, offset: ["start start", "end start"] })
  const sunY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const hillY = useTransform(scrollYProgress, [0, 1], [0, 65])
  const still = reduced || paused
  return <section ref={scene} className={`armory-hero ${still ? "armory-still" : ""}`} aria-label="Welcome to Getrest">
    <div className="armory-sky" aria-hidden="true">
      <motion.div className="armory-sun" style={{ y: still ? 0 : sunY }} />
      <div className="armory-cloud cloud-one" /><div className="armory-cloud cloud-two" />
      <motion.svg className="armory-hills" style={{ y: still ? 0 : hillY }} viewBox="0 0 1440 550" preserveAspectRatio="none">
        <path fill="var(--hill-far)" d="M0 350 100 265 160 310 320 145 450 275 570 215 710 310 870 130 1020 240 1130 150 1260 275 1440 160V550H0Z" />
        <path fill="var(--hill-near)" d="M0 440 150 320 290 385 410 300 590 410 760 300 930 390 1100 270 1290 390 1440 310V550H0Z" />
      </motion.svg>
    </div>
    <div className="armory-layout">
      <div className="armory-copy">
        <motion.p initial={reduced ? false : {opacity:0,y:15}} animate={{opacity:1,y:0}} className="armory-note">Dota 2 cosmetics. A little more you.</motion.p>
        <motion.h1 initial={reduced ? false : {opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{duration:.6,delay:.1}}>Good game.<br /><em>Great outfit.</em></motion.h1>
        <motion.p initial={reduced ? false : {opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:.2}} className="armory-description">Your next favourite set is waiting here. Find something for your hero, pack your inventory, and make an entrance.</motion.p>
        <div className="armory-actions"><a href="#catalogue" className="armory-primary">Find your next item <ArrowDown size={17} /></a><a href="#daily-drops" className="armory-secondary">See today’s deals</a></div>
        <div className="armory-caption"><span>Pick a hero. Make it yours.</span><span>Getrest / by Nodezio</span></div>
      </div>
      <div className="armory-scene">
        <svg className="armory-building" viewBox="0 0 620 580" fill="none" aria-hidden="true">
          <ellipse cx="322" cy="541" rx="273" ry="24" fill="#172d2c" opacity=".18" />
          <path d="M40 509 96 478 512 478 592 512 556 546H80Z" fill="#647c62" stroke="#263b35" strokeWidth="4" />
          <path d="M99 475V227L152 183H463L516 227V475Z" fill="#d5c2a0" stroke="#263b35" strokeWidth="5" strokeLinejoin="round" />
          <path d="M80 227 154 116H461L537 227Z" fill="#7c3930" stroke="#263b35" strokeWidth="5" strokeLinejoin="round" />
          <path d="m111 214 57-83h280l59 83" stroke="#bb6b49" strokeWidth="6" />
          <path d="M148 116V62H185V116" fill="#b19a7a" stroke="#263b35" strokeWidth="5" />
          <g className="armory-smoke" stroke="#fff1d1" strokeWidth="9" strokeLinecap="round" opacity=".6"><path d="M166 46c-16-18 15-21 1-39" /></g>
          <path d="M462 118V42" stroke="#263b35" strokeWidth="5" />
          <path className="armory-flag" d="M465 44h62l-14 20 14 20h-62" fill="#d18549" stroke="#263b35" strokeWidth="4" />
          <path d="M121 251h373v216H121Z" fill="#344940" stroke="#263b35" strokeWidth="5" />
          <path d="M120 250h375v39H120Z" fill="#b87349" stroke="#263b35" strokeWidth="4" />
          <path d="M125 288h365M136 442h344" stroke="#20352e" strokeWidth="10" />
          <rect x="232" y="181" width="152" height="57" rx="4" fill="#f5e9ca" stroke="#263b35" strokeWidth="4" />
          <text x="308" y="217" textAnchor="middle" fill="#263b35" fontSize="27" fontWeight="700" fontFamily="Georgia, serif">Getrest</text>
          <path d="M109 467h398v23H109Z" fill="#b19a7a" stroke="#263b35" strokeWidth="4" />
          <path d="M197 490h224v17H197Z" fill="#d5c2a0" stroke="#263b35" strokeWidth="4" />
          <path d="M93 293H64v42h29M526 293h29v42h-29" fill="#efd180" stroke="#263b35" strokeWidth="4" />
          <path d="M76 293v-15m466 15v-15" stroke="#263b35" strokeWidth="4" />
          <path d="M46 489v-75m0 28-18-13m18 34 18-19m516 45v-82m0 27 17-15" stroke="#324e3d" strokeWidth="6" strokeLinecap="round" />
          <path d="m26 419 20-32 21 32Zm535-9 20-37 21 37Z" fill="#68815d" />
          <path d="m70 510 24-5m400 16 22 4m-354 2 20-4" stroke="#bfc397" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <div className="armory-display">
          <AnimatePresence mode="wait" initial={false}>
            {item ? <motion.button key={item.id} initial={still ? false : {opacity:0,y:15,rotate:-3}} animate={{opacity:1,y:0,rotate:0}} exit={{opacity:0,y:-12}} transition={{duration:.25}} onClick={() => onSelect(item)} className="armory-item" aria-label={`View ${item.name}`}>
              <LiquipediaImage itemName={item.name} priority className="object-contain" />
            </motion.button> : <p className="armory-loading">Stock is on its way to the shelf…</p>}
          </AnimatePresence>
        </div>
        <div className="armory-item-label" aria-live="polite"><span>{item?.hero || "The item shelf"}</span><strong>{item?.name || "Loading the catalogue"}</strong>{item && <span>Rp {item.price.toLocaleString("id-ID")}</span>}</div>
        <div className="armory-controls"><button disabled={!items.length} onClick={() => setIndex(i => (i - 1 + items.length) % items.length)} aria-label="Previous featured item"><ArrowLeft size={18} /></button><span>{items.length ? `${index % items.length + 1} / ${items.length}` : "—"}</span><button disabled={!items.length} onClick={() => setIndex(i => i + 1)} aria-label="Next featured item"><ArrowRight size={18} /></button></div>
      </div>
    </div>
    <div className="armory-bottom"><a href="#daily-drops">The shop is just down here <ArrowDown size={15} /></a><button onClick={() => setPaused(p => !p)} aria-pressed={paused} disabled={!!reduced}>{still ? <Play size={14} /> : <Pause size={14} />}{reduced ? "Reduced motion" : paused ? "Play scene" : "Pause scene"}</button></div>
  </section>
}
