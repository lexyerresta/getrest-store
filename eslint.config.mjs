import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

export default [
  ...nextVitals,
  ...nextTypescript,
  // Maintenance scripts run directly in Node using CommonJS.
  { files: ["scripts/**/*.js"], rules: { "@typescript-eslint/no-require-imports": "off" } },
  { ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"] },
]
