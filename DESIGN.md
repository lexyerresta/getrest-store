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
