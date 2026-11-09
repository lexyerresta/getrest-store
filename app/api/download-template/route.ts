import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import path from "path"
import fs from "fs/promises"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "prices.json")
    const fileContent = await fs.readFile(filePath, "utf-8")
    const items = JSON.parse(fileContent) 

    const data = items.map((item: any) => ({
      name: item.name,
      hero: item.hero || "",
      qty: item.qty ?? null,
      price: item.price ?? 0,
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Prices")

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    })

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="template.xlsx"',
        "Content-Length": buffer.length.toString(),
      },
    })
  } catch (err: any) {
    console.error("Download Template Error:", err.message)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
