import type { Promotion } from "@/app/contexts/PromotionContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export function PromotionPreview({ promotion }: { promotion: Promotion }) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Promotion Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image src={promotion.imageUrl || "/placeholder.svg"} alt={promotion.title} layout="fill" objectFit="cover" />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-2">{promotion.title}</h3>
              <p className="text-lg mb-4">{promotion.description}</p>
              <p className="text-xl font-semibold">{promotion.discountPercentage}% OFF</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

