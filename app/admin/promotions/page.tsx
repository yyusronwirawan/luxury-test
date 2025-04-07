"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Copy, Download, Upload, BarChart2 } from "lucide-react"
import Image from "next/image"
import { PromotionForm } from "../components/PromotionForm"
import { usePromotions, type Promotion } from "@/app/contexts/PromotionContext"
import { DeleteConfirmation } from "../components/DeleteConfirmation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Card, CardContent } from "@/components/ui/card"
import { PromotionPreview } from "../components/PromotionPreview"
import { PromotionStats } from "../components/PromotionStats"
import { DateRangePicker } from "../components/DateRangePicker"

export default function PromotionsPage() {
  const { promotions, addPromotion, updatePromotion, deletePromotion, reorderPromotions } = usePromotions()
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; promotionId: number | null }>({
    isOpen: false,
    promotionId: null,
  })
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)

  const filteredPromotions = promotions.filter((promotion) => {
    const matchesSearch = promotion.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || promotion.type === typeFilter
    const matchesStatus = statusFilter === "all" || promotion.status === statusFilter
    const matchesDate = new Date(promotion.startDate) >= dateRange.from && new Date(promotion.endDate) <= dateRange.to
    return matchesSearch && matchesType && matchesStatus && matchesDate
  })

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const newOrder = Array.from(filteredPromotions)
    const [reorderedItem] = newOrder.splice(result.source.index, 1)
    newOrder.splice(result.destination.index, 0, reorderedItem)

    reorderPromotions(newOrder.map((promo) => promo.id))
  }

  const handleDuplicatePromotion = (promotion: Promotion) => {
    const newPromotion = {
      ...promotion,
      id: Date.now(),
      title: `${promotion.title} (Copy)`,
      status: "DRAFT" as const,
    }
    addPromotion(newPromotion)
    toast.success("Promotion duplicated successfully")
  }

  const handleExportPromotions = () => {
    const dataStr = JSON.stringify(promotions, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = "promotions.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleImportPromotions = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedPromotions = JSON.parse(e.target?.result as string)
          importedPromotions.forEach((promo: Promotion) => addPromotion(promo))
          toast.success("Promotions imported successfully")
        } catch (error) {
          toast.error("Failed to import promotions")
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Promotions</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportPromotions}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button as="label" htmlFor="import-promotions">
            <Upload className="w-4 h-4 mr-2" />
            Import
            <input
              id="import-promotions"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportPromotions}
            />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Promotion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Promotion</DialogTitle>
              </DialogHeader>
              <PromotionForm onSubmit={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <Input
            placeholder="Search promotions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="BANNER">Banner</SelectItem>
              <SelectItem value="SALE">Sale</SelectItem>
              <SelectItem value="SPECIAL_OFFER">Special Offer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
            </SelectContent>
          </Select>
          <DateRangePicker from={dateRange.from} to={dateRange.to} onSelect={(range) => setDateRange(range)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="promotions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {filteredPromotions.map((promotion, index) => (
                    <Draggable key={promotion.id} draggableId={promotion.id.toString()} index={index}>
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-4"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Image
                                  src={promotion.imageUrl || "/placeholder.svg"}
                                  alt={promotion.title}
                                  width={80}
                                  height={80}
                                  className="rounded-md object-cover"
                                />
                                <div>
                                  <h3 className="font-semibold">{promotion.title}</h3>
                                  <p className="text-sm text-gray-500">{promotion.description}</p>
                                  <div className="flex space-x-2 mt-2">
                                    <Badge variant="outline">{promotion.type}</Badge>
                                    <Badge
                                      variant={
                                        promotion.status === "ACTIVE"
                                          ? "default"
                                          : promotion.status === "SCHEDULED"
                                            ? "secondary"
                                            : "outline"
                                      }
                                    >
                                      {promotion.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => setEditingPromotion(promotion)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDuplicatePromotion(promotion)}>
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-600"
                                  onClick={() => setDeleteConfirmation({ isOpen: true, promotionId: promotion.id })}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedPromotion(promotion)}>
                                  <BarChart2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        <div>
          {selectedPromotion ? (
            <>
              <PromotionPreview promotion={selectedPromotion} />
              <PromotionStats promotion={selectedPromotion} />
            </>
          ) : (
            <div className="text-center p-8 bg-gray-100 rounded-lg">
              <p>Select a promotion to view details and statistics</p>
            </div>
          )}
        </div>
      </div>

      {editingPromotion && (
        <Dialog open={!!editingPromotion} onOpenChange={() => setEditingPromotion(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Promotion</DialogTitle>
            </DialogHeader>
            <PromotionForm promotion={editingPromotion} onSubmit={() => setEditingPromotion(null)} />
          </DialogContent>
        </Dialog>
      )}

      <DeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, promotionId: null })}
        onConfirm={() => {
          if (deleteConfirmation.promotionId) {
            deletePromotion(deleteConfirmation.promotionId)
            toast.success("Promotion deleted successfully")
          }
          setDeleteConfirmation({ isOpen: false, promotionId: null })
        }}
        title="Delete Promotion"
        description="Are you sure you want to delete this promotion? This action cannot be undone."
      />
    </div>
  )
}

