import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function Navbar() {
  return (
    <nav className="flex justify-end p-4">
      <ThemeToggle />
    </nav>
  )
}
