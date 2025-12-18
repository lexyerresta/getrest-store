# 🛍️ GetRest Store - Premium Dota 2 Marketplace

> Modern, responsive e-commerce platform for trading Dota 2 items with real-time Steam integration.

![Next.js](https://img.shields.io/badge/Next.js-15.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎨 Modern UI/UX
- **Trully Color Palette** - Professional orange (#F3742B) and yellow (#FED172) theme
- **Dark/Light Mode** - Seamless theme switching with persistent preferences
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Smooth Animations** - Framer Motion for buttery transitions
- **Clean E-commerce Layout** - Product cards with large images and clear CTAs
- **Responsive Footer** - Polished end-of-page indicator with useful links

### 🎮 Dota 2 Integration
- **132 Item Images** - Locally cached Liquipedia cosmetic icons
- **YouTube Preview Integration** - One-click YouTube search for Hero + Item gameplay previews
- **Hero Filtering** - Filter items by Dota 2 heroes
- **Price Sorting** - Multiple sort options (high to low, A-Z, etc)
- **Real-time Stock** - Dynamic inventory tracking
- **Custom Cursor** - Fully themed Dota 2 cursor with gold dust trail and green "Attack Move" click effects
- **Audio System** - Authentic Dota 2 Announcer voice lines for cart streaks (Killing Spree, Dominating, Rampage at 5 items!)
- **Official Rarity Visuals** - Dynamic glowing borders reflecting Valve's official tier hierarchy (Arcana > Ancient > Immortal > Legendary > Mythical > Rare)

### 🎰 Test My Luck (Gacha) v2.0
- **Interactive Spinner** - Fun way to discover random items with variable speed control
- **Cinematic Effects** - Screen shake, blur motion, and dramatic flash reveal on win
- **Audio Feedback** - Synchronized drum roll and rarity-based win sounds
- **Rarity System** - Visual rarity tiers (Mythical, Legendary, etc.) based on price
- **Integrated Checkout** - Direct link to view and buy the won item

### 💬 Steam Comments
- **Live Testimonials** - Scrapes real comments from Steam profile
- **Floating Panel** - Slide-in comments viewer with infinite scroll
- **Daily Updates** - Automated scraping via scheduled task
- **50+ Reviews** - Genuine customer feedback displayed

### 🔍 Advanced Filtering
- **Search** - Debounced search by item name or hero
- **Hero Filter** - Dropdown with all Dota 2 heroes
- **Price Ranges** - Quick filters (< 50K, 50K-200K, etc)
- **Sort Options** - Price and alphabetical sorting

### ⚡ Performance
- **Image Caching** - All images stored locally (no CORS issues)
- **Optimized API** - Reads from cached JSON (no scraping per request)
- **Infinite Scroll** - Lazy loading for better performance
- **Fast Navigation** - Next.js App Router with Turbopack

## 🚀 Quick Start

### Prerequisites
- Node.js 20.11.0 or higher
- npm 10.2.4 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/getrest-store.git
cd getrest-store

# Install dependencies
npm install

# Run Steam comments scraper (first time)
npm run scrape-comments

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the store.

## 📁 Project Structure

```
getrest-store/
├── app/
│   ├── api/
│   │   ├── steam-comments/     # Steam comments API
│   │   ├── steam-profile/      # Steam profile data
│   │   ├── inventory/          # Inventory management
│   │   ├── download-template/  # Template downloads
│   │   └── update-prices/      # Price updates
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main store page
├── components/
│   ├── ui/                     # Radix UI components
│   ├── LiquipediaImage.tsx     # Image loader component
│   ├── SteamComments.tsx       # Comments panel component
│   └── TestMyLuck.tsx          # Gacha & Contact component
├── scripts/
│   ├── scrape-steam-comments.js  # Steam scraper
│   ├── download-images.js        # Image downloader
│   └── scrape-from-wiki.js       # Wiki scraper
├── public/
│   ├── items/                  # 132 cached item images
│   ├── steam-comments.json     # Cached comments
│   ├── item-images.json        # Image mappings
│   └── prices.json             # Product data
└── README.md
```

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run scrape-comments` | Scrape Steam comments (run daily) |

## 📊 Data Management

### Product Data (`public/prices.json`)
```json
[
  {
    "name": "Item Name",
    "hero": "Hero Name",
    "qty": 5,
    "price": 250000
  }
]
```

### Steam Comments
Comments are scraped from Steam profile and cached in `public/steam-comments.json`.

**Automated Scraping:**
Set up a daily cron job (6 AM recommended):
```bash
# Windows Task Scheduler
# Or Linux crontab:
0 6 * * * cd /path/to/getrest-store && npm run scrape-comments
```

### Item Images
- **Stored in:** `public/items/`
- **Mapping:** `public/item-images.json`
- **Total:** 132 images (96% coverage)
- **Fallback:** `/icon.png` for missing images

## 🎨 Customization

### Theme Colors
Edit `app/globals.css` to change color scheme:
```css
:root {
  --orange: #F3742B;    /* Primary CTA */
  --yellow: #FED172;    /* Accents */
  --navy: #231650;      /* Dark mode bg */
}
```

### Steam Profile
Update Steam ID in `app/page.tsx`:
```typescript
const STEAM_ID = "76561198329596689"
const STEAM_PROFILE_URL = `https://steamcommunity.com/profiles/${STEAM_ID}`
```

## 🔧 Tech Stack

- **Framework:** Next.js 15.2 (App Router)
- **Language:** TypeScript 5.0
- **Styling:** TailwindCSS 4.0
- **UI Components:** Radix UI
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Scraping:** Puppeteer + Cheerio
- **Image Processing:** Next/Image

## 📱 Features Breakdown

### 1. Product Catalog
- Grid layout (1/2/3 columns responsive)
- Large product images with hover zoom
- Price display in IDR format
- Stock indicators
- "Buy Now" CTAs

### 2. Filtering System
- Hero dropdown (alphabetically sorted)
- Price range quick filters
- Search with debounce (300ms)
- Sort options (price, name)

### 3. Steam Integration
- Profile link in header
- Comments floating button
- Real testimonials from Steam
- Avatar and username display
- **Verified Seller Badge** (Dynamic SVG)

### 4. Modal System
- Product details with responsive buttons
- **Product Sharing** - Share direct links to specific products
- Seller verification
- **Test My Luck (Gacha)** - Gamified shopping with Reroll functionality
- **Welcome Popup** - Responsive bottom sheet/modal with featured items
- **Contact Us (Linktree Style)**
- Steam inventory link

### 5. Shopping Cart & Checkout
- **Persistent Cart** - Items saved in local storage
- **WhatsApp Integration** - Automated order formatting with total calculation
- **Buy Now** - Skip the cart and checkout a single item immediately
- **Smart Quantity Input** - Manual typing with stock validation
- **Bulk Selection** - Select all, delete selected items with one click
- **Compact Notifications** - Fast (0.7s), non-intrusive feedback for cart actions (optimized for mobile)
- **Safety Features** - Confirmation modals for single and bulk deletions
- **Flash Sale Integration** - Cart displays original/discounted prices with proper formatting
- **Removal Alerts** - Visual confirmation when items are taken out of the cart

- **Checkout Integration** - Special `[FLASH SALE]` tags and strikethrough prices in WhatsApp order messages

### 7. 📱 Mobile Optimized 2.0 (NEW)
- **Long Screen Support** - Optimized layouts for modern tall-display smartphones
- **Compact Navigation** - Slim adaptive header and sticky filter bar for better thumb reachability
- **Floating Button Layout** - Repositioned and resized action buttons to prevent content overlap
- **Bottom Content Buffer** - Added vertical buffers to ensure floating elements never hide CTAs

## 🐛 Known Issues

- Steam comments scraper currently gets 50 comments (Steam pagination limitation)
- Some items may have fallback icons if not found on Liquipedia

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**GetRest Store**
- Steam: [GetRestSTORE](https://steamcommunity.com/id/GetRestSTORE/)
- WhatsApp: +62 813-8888-3983
- Facebook: [LexyAlexaRekber](https://www.facebook.com/LexyAlexaRekber/)

## 🙏 Acknowledgments

- [Liquipedia](https://liquipedia.net/dota2/) for item images
- [Dota 2 Wiki](https://dota2.fandom.com/) for additional assets
- [Trully](https://trully.ai/) for color palette inspiration
- Steam Community for testimonials

---

⭐ **Star this repo if you found it helpful!**
