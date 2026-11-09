import { NextResponse } from "next/server"
import { getInventory } from "@/lib/getInventory"

export async function GET() {
  try {
    const items = await getInventory()
    return NextResponse.json({ success: true, items })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
