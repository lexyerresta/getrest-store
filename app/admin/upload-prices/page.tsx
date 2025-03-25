"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function UploadPricesPage() {
  const [password, setPassword] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!file) return setStatus("No file selected")

    const formData = new FormData()
    formData.append("password", password)
    formData.append("file", file)

    const res = await fetch("/api/update-prices", {
      method: "POST",
      body: formData,
    })

    const result = await res.json()
    setStatus(result.success ? `Uploaded ${result.updated} items.` : result.error)
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Upload Prices</h1>

      <div className="space-y-2">
        <Label>Password</Label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Select Excel File</Label>
        <Input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </div>

      <Button onClick={handleUpload}>Upload</Button>

      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  )
}
