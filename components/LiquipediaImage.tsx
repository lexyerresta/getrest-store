"use client"

import { useState, useEffect } from "react"

type LiquipediaImageProps = {
    itemName: string
    className?: string
}

// Load image mapping  
let imageMapping: Record<string, string> = {};

export function LiquipediaImage({ itemName, className = "" }: LiquipediaImageProps) {
    const [imageUrl, setImageUrl] = useState<string>("/icon.png")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadImage = async () => {
            // Load mapping if not loaded yet
            if (Object.keys(imageMapping).length === 0) {
                try {
                    const response = await fetch('/item-images.json')
                    imageMapping = await response.json()
                } catch (error) {
                    console.error('Failed to load image mapping:', error)
                }
            }

            // Get image URL from mapping
            const url = imageMapping[itemName] || '/icon.png'
            setImageUrl(url)
            setIsLoading(false)
        }

        loadImage()
    }, [itemName])

    return (
        <div className="relative w-full h-full">
            {isLoading && (
                <div className="absolute inset-0 bg-gray-800 animate-pulse rounded" />
            )}
            <img
                src={imageUrl}
                alt={itemName}
                className={className}
                loading="lazy"
                onError={(e) => {
                    e.currentTarget.src = '/icon.png'
                }}
            />
        </div>
    )
}
