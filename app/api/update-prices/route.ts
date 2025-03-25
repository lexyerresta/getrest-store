import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(req: Request) {
  const formData = await req.formData()
  const password = formData.get("password")?.toString()
  const file = formData.get("file") as File

  if (password !== process.env.ADMIN_UPLOAD_PASSWORD) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Invalid password." },
      { status: 401 }
    )
  }

  if (!file || file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    return NextResponse.json(
      { success: false, error: "Invalid or missing file." },
      { status: 400 }
    )
  }

  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(sheet) as { name: string; price: number; qty?: number | null }[]

  const pricesPath = join(process.cwd(), "public", "prices.json")
  await writeFile(pricesPath, JSON.stringify(data, null, 2))

  return NextResponse.json({ success: true, updated: data.length })
}