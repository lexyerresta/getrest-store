"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "./button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"  

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] dark:hidden" />
          <Moon className="h-[1.2rem] w-[1.2rem] hidden dark:inline" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>☀ Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>🌙 Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>💻 System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
