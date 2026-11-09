type SteamAsset = { assetid: string; classid: string; instanceid: string; amount?: string }
type SteamDescription = { classid: string; instanceid: string; market_hash_name?: string; icon_url?: string; tags?: { category: string; localized_tag_name: string }[] }
type InventoryItem = { id: string; name: string; hero: string | null; icon: string | null; qty: number }

const STEAM_ID = "76561198329596689"
const APP_ID = 570
const CONTEXT_ID = 2
const API_URL = `https://steamcommunity.com/inventory/${STEAM_ID}/${APP_ID}/${CONTEXT_ID}?l=english&count=5000`

import { readFile } from "fs/promises"
import { join } from "path"

export async function getInventory() {
  const res = await fetch(API_URL)

  if (!res.ok) {
    throw new Error(`Steam API responded with status ${res.status}`)
  }

  const data: { assets?: SteamAsset[]; descriptions?: SteamDescription[] } = await res.json()
  const assets = data.assets || []
  const descriptions = data.descriptions || []

  const merged = assets.map((asset) => {
    const match = descriptions.find(
      (desc) =>
        desc.classid === asset.classid && desc.instanceid === asset.instanceid
    )

    return {
      id: asset.assetid,
      name: match?.market_hash_name || "Unknown Item",
      hero: match?.tags?.find((tag) => tag.category === 'Hero')?.localized_tag_name   || null,
      icon: match?.icon_url
        ? `https://steamcommunity-a.akamaihd.net/economy/image/${match.icon_url}`
        : null,
      qty: parseInt(asset.amount || "0"),
    }
  })

  const grouped: Record<string, InventoryItem> = {}
  for (const item of merged) {
    const key = item.name
    if (grouped[key]) {
      grouped[key].qty += item.qty
    } else {
      grouped[key] = { ...item }
    }
  }

  // Baca harga dari JSON
  const pricesPath = join(process.cwd(), "public", "prices.json")
  let prices: { name: string; price: number }[] = []

  try {
    const raw = await readFile(pricesPath, "utf-8")
    prices = JSON.parse(raw)
  } catch (e) {
    console.warn("No prices.json found, using default price 0")
  }

  const finalItems = Object.values(grouped).map((item) => {
    const match = prices.find((p) => p.name === item.name)
    return {
      ...item,
      price: match?.price || 0,
    }
  })

  return finalItems
}
