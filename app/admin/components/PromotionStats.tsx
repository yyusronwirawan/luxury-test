import type { Promotion } from "@/app/contexts/PromotionContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Simulasi data statistik
const generateMockStats = (promotion: Promotion) => {
  const days = 7
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    views: Math.floor(Math.random() * 1000),
    clicks: Math.floor(Math.random() * 100),
    conversions: Math.floor(Math.random() * 10),
  }))
}

export function PromotionStats({ promotion }: { promotion: Promotion }) {
  const stats = generateMockStats(promotion)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Promotion Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="views" fill="#8884d8" />
            <Bar dataKey="clicks" fill="#82ca9d" />
            <Bar dataKey="conversions" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

