"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

type LiquipediaImageProps = {
    itemName: string
    className?: string
    priority?: boolean
}

// Global cache for image mapping (loaded once)
let imageMapping: Record<string, string> | null = null
let mappingPromise: Promise<Record<string, string>> | null = null

// Function to load mapping once and cache it
async function getImageMapping(): Promise<Record<string, string>> {
    // Return cached mapping if available
    if (imageMapping) {
        return imageMapping
    }

    // If already loading, return the same promise
    if (mappingPromise) {
        return mappingPromise
    }

    // Start loading
    mappingPromise = fetch('/item-images.json')
        .then(res => res.json())
        .then(data => {
            imageMapping = data
            mappingPromise = null
            return data
        })
        .catch(error => {
            console.error('Failed to load image mapping:', error)
            mappingPromise = null
            return {}
        })

    return mappingPromise
}

export function LiquipediaImage({ itemName, className = "", priority = false }: LiquipediaImageProps) {
    const [imageUrl, setImageUrl] = useState<string>("/icon.png")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadImage = async () => {
            const mapping = await getImageMapping()
            const url = mapping[itemName] || '/icon.png'
            setImageUrl(url)
            setIsLoading(false)
        }

        loadImage()
    }, [itemName])

    return (
        <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded">
            {isLoading && (
                <div className="absolute inset-0 bg-gray-800 animate-pulse rounded" />
            )}
            <Image
                src={imageUrl}
                alt={itemName}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`object-contain ${className}`}
                priority={priority}
                loading={priority ? undefined : "lazy"}
                quality={85}
                onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/icon.png'
                }}
            />
        </div>
    )
}
