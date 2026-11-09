# Getrest: a focused Dota 2 shop

Owner direction: a restrained anti-slop pass, taking cues from the Lexy portfolio, NoBypass, Nodezio and DomainScope; add Getrest by Nodezio and some animation without a major redesign.

Design read: a cosmetics catalogue for Dota 2 players, with the Nodezio family's clear wordmark and quiet surfaces. ENERGY 2 / RHYTHM 2 / MOTION 2.

- Keep the catalogue, sidebar filters, cart and purchase workflow: shoppers already use these to choose items.
- Keep Getrest orange, navy and white; neutral item backplates let actual cosmetic artwork supply colour instead of invented rarity glows.
- Price does not establish Dota rarity: all item cards use the same border treatment.
- Use the existing sans type for dense product names and prices; avoid another font download for a small refresh.
- The opening sentence and catalogue anchor orient shoppers without adding a full-screen landing page.
- Keep cards because every entry compares the same real fields: item, hero, quantity and price.
- Limited stock replaces Popular Items: this section is computed from quantities, not sales or popularity.
- In stock replaces Live Market: prices come from a file, not a live exchange. The strip scrolls by user input and has no fake activity indicator.
- The Nodezio credit links to the studio; preserve the existing Getrest image as the shop's mark.
- Entrance motion introduces the shop; card hover previews the art. Stagger delays are capped so large catalogues stay usable. Reduced motion disables entrances and respects the user's preference through MotionConfig and CSS.
- Remove decorative HOT and hardcoded review count, flash-sale glow and repeated status pulses; keep stock quantities and sale timing.
- Functional controls retain their icons; the catalogue purchase controls have 44px hit areas.

Scope: storefront refinement, not a full audit of the admin, luck game, legacy copy or business data.

## ESLint repair

Migrated the legacy config to ESLint 9 flat config and changed `npm run lint` to `eslint .`. CommonJS is allowed only in maintenance JavaScript scripts. Application errors use unknown with Error narrowing, Steam inventory and JWT payloads have explicit types, and JSX quotes are escaped. No lint rules were weakened for application files.

Final verification: lint passed with 0 errors and 48 warnings (unused symbols, image optimization, hook dependencies and config export style); TypeScript passed; production build generated all 16 pages without the circular-config error.

## Revision 2: the roadside armory

Owner direction: a full redesign is now allowed; make the animation visible. References remain the Lexy sunset, NoBypass building, Nodezio workshop and DomainScope landscape. ENERGY 3 / RHYTHM 3 / MOTION 3.

- A code-native drawn armory in a mountain pass makes the shop literal; it belongs to the same illustrated family without copying another project's scene.
- Warm parchment, evergreen ink and terracotta replace the slate/orange shell. Colour lives mainly in the landscape and actual item artwork. Dark mode becomes a moonlit pass.
- Georgia display type gives the shop a storybook sign, while existing sans keeps dense catalogue controls readable. No new font requests.
- Five stocked items, sorted by price, occupy an interactive shelf. Previous/next changes the actual product; clicking opens the existing detail modal. No fabricated products or sales counts.
- Scroll moves the sun and distant terrain; flags, chimney smoke and clouds establish the roadside setting. A pause button stops atmospheric motion and scroll parallax. Reduced motion provides a static scene and instant item changes. This is the owner's explicit animation request; no motion is applied to product prices or purchase controls.
- The catalogue follows the scene as a rounded paper sheet, with separate deal, limited-stock and search sections. Store tasks stay below one opening scene rather than a marketing template.
- Removed the automatic welcome interruption and custom particle cursor from the storefront. Functional luck and chat launchers stay available in the shop palette.
- The Getrest by Nodezio credit and existing purchase, stock, filter and cart handlers remain.

Revision 2 browser checks: 1440px desktop and 390px mobile, light/dark, no document overflow; live shelf switching, product detail, pause, search empty state, add to cart and reduced-motion loading passed with no browser exceptions. Fixed the reduced-motion hydration mismatch and dark-theme item-label contrast found during preview.
