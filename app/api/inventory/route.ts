import { NextResponse } from "next/server"
import { getInventory } from "@/lib/getInventory"

export async function GET() {
  try {
    const items = await getInventory()
    return NextResponse.json({ success: true, items })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
