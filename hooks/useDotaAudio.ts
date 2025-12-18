import { useCallback, useEffect, useRef } from 'react'

const SOUND_ASSETS = {
    // UI
    click: "/sounds/click.mp3",
    // Transaction
    coins: "/sounds/coins.mp3",
    // Gacha / Gaming
    drum_roll: "/sounds/drum_roll.mp3",
    gacha_win_common: "/sounds/win_common.mp3",
    gacha_win_rare: "/sounds/win_rare.mp3",
    gacha_win_legendary: "/sounds/win_legendary.mp3",
    // Errors
    error: "/sounds/error.mp3"
}

type SoundKey = keyof typeof SOUND_ASSETS

export const useDotaAudio = () => {
    const audioRefs = useRef<Partial<Record<SoundKey, HTMLAudioElement>>>({})

    useEffect(() => {
        // Preload sounds
        Object.entries(SOUND_ASSETS).forEach(([key, url]) => {
            const audio = new Audio(url)
            audio.volume = 0.4
            audioRefs.current[key as SoundKey] = audio
        })
    }, [])

    const play = useCallback((key: SoundKey, volume = 0.5) => {
        const audio = audioRefs.current[key]
        if (audio) {
            audio.currentTime = 0
            audio.volume = volume
            audio.play().catch(e => console.warn("Audio play failed:", e))
        } else {
            // Fallback for immediate play if not preloaded (rare)
            const newAudio = new Audio(SOUND_ASSETS[key])
            newAudio.volume = volume
            newAudio.play().catch(e => console.warn("Audio play failed:", e))
            audioRefs.current[key] = newAudio
        }
    }, [])

    return { play }
}
