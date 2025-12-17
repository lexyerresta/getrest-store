import { SVGProps } from "react"

export const GachaponIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        {/* Base - Solid filled for visibility */}
        <path
            d="M7 11v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8"
            fill="white"
        />

        {/* Dome - Outline with slightly transparent fill */}
        <path
            d="M12 2a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9z"
            fill="white"
            fillOpacity="0.3"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
        />

        {/* Knob/Handle */}
        <circle cx="12" cy="15" r="2" fill="#db2777" stroke="white" strokeWidth="1.5" />

        {/* Internal Balls - Simple dots */}
        <circle cx="9" cy="8" r="1.5" fill="white" />
        <circle cx="15" cy="8" r="1.5" fill="white" />
        <circle cx="12" cy="6" r="1.5" fill="white" />
        <circle cx="12" cy="10" r="1.5" fill="white" />

        {/* Chute */}
        <path d="M10 21h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
)
