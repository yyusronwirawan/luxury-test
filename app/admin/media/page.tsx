"use client"

import { useState } from "react"
import { useProducts } from "@/app/contexts/ProductContext"
import { MediaUpload } from "../components/MediaUpload"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Search, ImageIcon } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

export default function MediaPage() {
  const { mediaItems = [], deleteMediaItem } = useProducts()
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredMedia = mediaItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || item.type.startsWith(typeFilter)
    return matchesSearch && matchesType
  })

  const handleDelete = (id: string) => {
    deleteMediaItem(id)
    toast.success("Media deleted successfully")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Media Library</h1>
        <MediaUpload />
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredMedia.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No media</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by uploading a new media file.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedia.map((item) => (
            <Card key={item.id}>
              <CardHeader className="p-0">
                {item.type.startsWith("image") ? (
                  <div className="relative aspect-square">
                    <Image
                      src={item.url || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-gray-100 rounded-t-lg">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-sm truncate">{item.name}</CardTitle>
                <p className="text-xs text-gray-500">Uploaded on {new Date(item.uploadedAt).toLocaleDateString()}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

