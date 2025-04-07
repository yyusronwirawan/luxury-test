"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [preview, setPreview] = useState(value)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real application, you would upload the file to your server/cloud storage
      // For this example, we'll just create a local preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreview(result)
        onChange(result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary transition-colors">
        <label className="cursor-pointer block">
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {preview ? (
            <div className="relative aspect-square w-full">
              <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover rounded-lg" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload image</p>
            </div>
          )}
        </label>
      </div>
      {preview && (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setPreview("")
            onChange("")
          }}
        >
          Remove Image
        </Button>
      )}
    </div>
  )
}

