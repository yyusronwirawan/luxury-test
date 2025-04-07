"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

interface SearchResult {
  id: number
  name: string
  price: number
  imageUrl: string
  category: string
  gender: string
}

// Simulated product database
const allProducts: SearchResult[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.floor(Math.random() * 100) + 50,
  imageUrl: `/placeholder.svg?height=100&width=100`,
  category: ["BAJU", "CELANA", "SWETER", "HODDIE", "JAM TANGAN", "PARFUM"][Math.floor(Math.random() * 6)],
  gender: Math.random() > 0.5 ? "MAN" : "WOMAN",
}))

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const filtered = allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setResults(filtered.slice(0, 5))
    } else {
      setResults([])
    }
  }, [searchQuery])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 p-0"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery("")}
              className={searchQuery ? "opacity-100" : "opacity-0"}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {results.length > 0 && (
          <div className="py-2 max-h-[300px] overflow-auto">
            {results.map((result) => (
              <Link
                key={result.id}
                href={`/shop/${result.gender.toLowerCase()}/${result.category.toLowerCase()}/${result.id}`}
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-4 p-4 hover:bg-accent transition-colors"
              >
                <Image
                  src={result.imageUrl || "/placeholder.svg"}
                  alt={result.name}
                  width={50}
                  height={50}
                  className="rounded-md"
                />
                <div>
                  <h4 className="font-medium">{result.name}</h4>
                  <p className="text-sm text-muted-foreground">{result.category}</p>
                </div>
                <span className="ml-auto font-medium">${result.price}</span>
              </Link>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

