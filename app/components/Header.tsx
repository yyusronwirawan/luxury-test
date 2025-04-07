"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Heart, ShoppingBag, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchDialog } from "./SearchDialog"
import { ShoppingCart } from "./ShoppingCart"
import { useWishlist } from "@/app/contexts/WishlistContext"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CurrencySelector } from "./CurrencySelector"
import Image from "next/image"
import { useSettings } from "@/app/hooks/useSettings" // Fixed import path

interface HeaderProps {
  logoUrl?: string
}

const Header: React.FC<HeaderProps> = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { itemCount } = useWishlist()
  const pathname = usePathname()
  const settings = useSettings() // Use settings hook to get current settings

  const isActive = (path: string) => pathname === path

  const navigationLinks = [
    { href: "/shop", label: "Shop" },
    { href: "/new-arrivals", label: "New Arrivals" },
    { href: "/sale", label: "Sale", isSpecial: true },
  ]

  // Function to handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder.svg" // Fallback to placeholder if logo fails to load
  }

  return (
    <header className="bg-black text-white py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="relative w-[100px] h-[40px]">
            <Image
              src={settings.logoUrl || "/placeholder.svg"}
              alt={settings.siteTitle || "Luxe"}
              fill
              className="object-contain"
              priority
              onError={handleImageError}
              sizes="100px"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-2 text-base font-medium tracking-wide transition-colors ${
                  link.isSpecial ? "text-red-500 hover:text-red-400" : "text-white hover:text-gold"
                } ${isActive(link.href) ? "text-gold" : ""}`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold transform origin-left" />
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-black text-white">
              <SheetHeader>
                <SheetTitle className="text-white">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-8">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-base font-medium tracking-wide py-2 transition-colors ${
                      link.isSpecial ? "text-red-500 hover:text-red-400" : "text-white hover:text-gold"
                    } ${isActive(link.href) ? "text-gold" : ""}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <CurrencySelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="text-white hover:text-gold transition-colors"
            >
              <Search className="h-5 w-5" />
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/wishlist" className="relative text-white hover:text-gold transition-colors">
                      <Heart className="h-5 w-5" />
                      {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {itemCount === 0 ? "Your wishlist is empty" : `${itemCount} items in wishlist`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <ShoppingCart />
          </div>
        </div>
      </div>

      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  )
}

export default Header

