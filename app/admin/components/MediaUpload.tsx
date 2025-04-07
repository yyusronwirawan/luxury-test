"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProducts } from "@/app/contexts/ProductContext"
import { toast } from "sonner"

export function MediaUpload() {
  const [file, setFile] = useState<File | null>(null)
  const { addMediaItem } = useProducts()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      // In a real application, you would upload the file to your server/cloud storage
      // For this example, we'll just create a local URL
      const reader = new FileReader()
      reader.onloadend = () => {
        addMediaItem({
          url: reader.result as string,
          name: file.name,
          type: file.type,
        })
        setFile(null)
        // Reset the input
        const input = document.querySelector('input[type="file"]') as HTMLInputElement
        if (input) input.value = ""
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error("Failed to upload file")
      console.error("Upload error:", error)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Input type="file" onChange={handleFileChange} accept="image/*" className="max-w-[300px]" />
      <Button onClick={handleUpload} disabled={!file}>
        <Upload className="mr-2 h-4 w-4" /> Upload
      </Button>
    </div>
  )
}

