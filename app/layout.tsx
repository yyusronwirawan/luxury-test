import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { CartProvider } from "./contexts/CartContext"
import { WishlistProvider } from "./contexts/WishlistContext"
import { ProductProvider } from "./contexts/ProductContext"
import { PromotionProvider } from "./contexts/PromotionContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import { CurrencyProvider } from "./contexts/CurrencyContext"
import { AuthProvider } from "./contexts/AuthContext"
import { PromotionBanner } from "./components/PromotionBanner"
import { LoadingProvider } from "./contexts/LoadingContext"
import { LoadingAnimation } from "@/components/LoadingAnimation"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ProductProvider>
            <PromotionProvider>
              <CartProvider>
                <WishlistProvider>
                  <NotificationProvider>
                    <CurrencyProvider>
                      <LoadingProvider>
                        {/* Render Header only for non-admin pages */}
                        {!children?.toString().includes("/admin") && (
                          <>
                            <PromotionBanner />
                            <Header />
                          </>
                        )}
                        {children}
                        {/* Render Footer only for non-admin pages */}
                        {!children?.toString().includes("/admin") && <Footer />}
                        <Toaster position="top-center" />
                        <LoadingAnimation />
                      </LoadingProvider>
                    </CurrencyProvider>
                  </NotificationProvider>
                </WishlistProvider>
              </CartProvider>
            </PromotionProvider>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
