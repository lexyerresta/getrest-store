/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache for local images
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    // Enable static optimization
    reactStrictMode: true,
    // Optimize production builds
    swcMinify: true,
    // Compress responses
    compress: true,
    // Optimize CSS
    experimental: {
        optimizeCss: true,
    },
}

module.exports = nextConfig
