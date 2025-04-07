"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { format, addDays } from "date-fns"
import { Loader2, RefreshCw, Calendar } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { DatePicker } from "@/components/ui/date-picker"

interface ExchangeRate {
  USD: number
  THB: number
  updatedAt: string
}

interface RateHistory {
  USD: number
  THB: number
  timestamp: string
}

export default function CurrencySettingsPage() {
  const [usdRate, setUsdRate] = useState("")
  const [thbRate, setThbRate] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [history, setHistory] = useState<RateHistory[]>([])
  const [scheduledChange, setScheduledChange] = useState<{ date: Date | undefined; USD: string; THB: string }>({
    date: undefined,
    USD: "",
    THB: "",
  })

  // Load saved rates and history
  useEffect(() => {
    const savedRates = localStorage.getItem("exchangeRates")
    const savedHistory = localStorage.getItem("rateHistory")
    const savedSchedule = localStorage.getItem("scheduledRateChange")

    if (savedRates) {
      const rates = JSON.parse(savedRates)
      setUsdRate((1 / rates.USD).toFixed(2))
      setThbRate((1 / rates.THB).toFixed(2))
    }

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }

    if (savedSchedule) {
      setScheduledChange(JSON.parse(savedSchedule))
    }

    setIsLoading(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const newRates = {
        USD: 1 / Number.parseFloat(usdRate),
        THB: 1 / Number.parseFloat(thbRate),
        updatedAt: new Date().toISOString(),
      }

      // Validate rates
      if (isNaN(newRates.USD) || isNaN(newRates.THB)) {
        throw new Error("Invalid rate values")
      }

      if (newRates.USD <= 0 || newRates.THB <= 0) {
        throw new Error("Rates must be greater than 0")
      }

      // Save new rates
      localStorage.setItem("exchangeRates", JSON.stringify(newRates))

      // Update history
      const newHistory: RateHistory = {
        USD: Number.parseFloat(usdRate),
        THB: Number.parseFloat(thbRate),
        timestamp: new Date().toISOString(),
      }

      const updatedHistory = [newHistory, ...history].slice(0, 30) // Keep last 30 entries
      localStorage.setItem("rateHistory", JSON.stringify(updatedHistory))
      setHistory(updatedHistory)

      // Check for significant changes (more than 5%)
      const previousUSD = history[0]?.USD
      const previousTHB = history[0]?.THB
      if (previousUSD && previousTHB) {
        const usdChange = Math.abs((Number.parseFloat(usdRate) - previousUSD) / previousUSD)
        const thbChange = Math.abs((Number.parseFloat(thbRate) - previousTHB) / previousTHB)
        if (usdChange > 0.05 || thbChange > 0.05) {
          toast.warning("Significant change in exchange rates detected!")
        }
      }

      toast.success("Exchange rates updated successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update exchange rates")
    }
  }

  const handleImportRates = async () => {
    setIsLoading(true)
    try {
      // Simulating API call with random fluctuation
      const response = await new Promise<{ USD: number; THB: number }>((resolve) => {
        setTimeout(() => {
          const currentUSD = Number.parseFloat(usdRate)
          const currentTHB = Number.parseFloat(thbRate)
          resolve({
            USD: currentUSD * (1 + (Math.random() - 0.5) * 0.02), // ±1% fluctuation
            THB: currentTHB * (1 + (Math.random() - 0.5) * 0.02), // ±1% fluctuation
          })
        }, 1000)
      })

      setUsdRate(response.USD.toFixed(2))
      setThbRate(response.THB.toFixed(2))
      toast.success("Rates imported successfully")
    } catch (error) {
      toast.error("Failed to import rates")
    } finally {
      setIsLoading(false)
    }
  }

  const handleScheduleChange = () => {
    if (scheduledChange.date && scheduledChange.USD && scheduledChange.THB) {
      localStorage.setItem("scheduledRateChange", JSON.stringify(scheduledChange))
      toast.success("Rate change scheduled successfully")
    } else {
      toast.error("Please fill in all fields for scheduled change")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Currency Settings</h1>
        <p className="text-muted-foreground">Manage exchange rates for USD and THB</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Exchange Rates</CardTitle>
            <CardDescription>Set the current exchange rates for USD and THB to IDR</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="usd-rate" className="block text-sm font-medium">
                    USD to IDR Rate
                  </label>
                  <div className="relative">
                    <Input
                      id="usd-rate"
                      type="number"
                      step="0.01"
                      value={usdRate}
                      onChange={(e) => setUsdRate(e.target.value)}
                      placeholder="e.g. 14500"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sm text-muted-foreground">
                      IDR/USD
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">1 USD = {usdRate} IDR</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="thb-rate" className="block text-sm font-medium">
                    THB to IDR Rate
                  </label>
                  <div className="relative">
                    <Input
                      id="thb-rate"
                      type="number"
                      step="0.01"
                      value={thbRate}
                      onChange={(e) => setThbRate(e.target.value)}
                      placeholder="e.g. 450"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sm text-muted-foreground">
                      IDR/THB
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">1 THB = {thbRate} IDR</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">Update Exchange Rates</Button>
                <Button type="button" variant="outline" onClick={handleImportRates}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Import Latest Rates
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Rate Change</CardTitle>
            <CardDescription>Set future exchange rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <DatePicker
                  selected={scheduledChange.date}
                  onSelect={(date) => setScheduledChange((prev) => ({ ...prev, date }))}
                  minDate={addDays(new Date(), 1)}
                />
                <Input
                  type="number"
                  placeholder="USD Rate"
                  value={scheduledChange.USD}
                  onChange={(e) => setScheduledChange((prev) => ({ ...prev, USD: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="THB Rate"
                  value={scheduledChange.THB}
                  onChange={(e) => setScheduledChange((prev) => ({ ...prev, THB: e.target.value }))}
                />
              </div>
              <Button onClick={handleScheduleChange}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Change
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rate History</CardTitle>
            <CardDescription>Last 30 rate updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={(timestamp) => format(new Date(timestamp), "MM/dd")} />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip labelFormatter={(label) => format(new Date(label), "yyyy-MM-dd HH:mm")} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="USD" stroke="#8884d8" name="USD Rate" />
                  <Line yAxisId="right" type="monotone" dataKey="THB" stroke="#82ca9d" name="THB Rate" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>USD Rate</TableHead>
                    <TableHead>THB Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No history available
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((entry, index) => (
                      <TableRow key={entry.timestamp}>
                        <TableCell>{format(new Date(entry.timestamp), "dd MMM yyyy HH:mm")}</TableCell>
                        <TableCell>{entry.USD.toFixed(2)}</TableCell>
                        <TableCell>{entry.THB.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

