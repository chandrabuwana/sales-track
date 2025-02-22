"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect, useParams } from "next/navigation"
import { MapPin, User, Plus, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddTransactionDialog } from "@/components/dialogs/add-transaction-dialog"
import { StoreTransactionsTable } from "@/components/transactions/store-transactions-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Product {
  id: string
  name: string
  description: string
  price: number
  sku: string
  category: string
}

interface Store {
  id: string
  name: string
  address: string
  city: string
  province: string
  photoUrl?: string
  latitude: number
  longitude: number
  status: "ACTIVE" | "INACTIVE" | "PENDING_APPROVAL"
  ownerName: string
  ownerPhone: string
  ownerEmail?: string
}

interface TransactionItem {
  productId: string
  quantity: number
  price: number
  product: Product
}

interface Transaction {
  id: string
  createdAt: string
  total: number
  items: TransactionItem[]
  createdByUser: {
    name: string
    email: string
  }
}

export default function StoreDetailPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const [store, setStore] = useState<Store | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [loading, setLoading] = useState(true)
  const id = params?.id as string

  const fetchStoreData = async () => {
    try {
      // Fetch store details
      const storeResponse = await fetch(`/api/stores/${id}`)
      if (!storeResponse.ok) {
        throw new Error("Failed to fetch store")
      }
      const storeData = await storeResponse.json()
      setStore(storeData.store)

      // Fetch store transactions
      const transactionsResponse = await fetch(`/api/stores/${id}/transactions`)
      if (!transactionsResponse.ok) {
        throw new Error("Failed to fetch transactions")
      }
      const transactionsData = await transactionsResponse.json()
      setTransactions(transactionsData.transactions)
    } catch (error) {
      console.error("Error fetching store data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchStoreData()
    }
  }, [id, session])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    redirect("/auth/signin")
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Store not found</h2>
      </div>
    )
  }

  const canAddTransactions =
    store.status === "ACTIVE" && session.user.role === "SALES"

  return (
    <div className="space-y-6">
      {/* Store Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{store.name}</h1>
          <p className="text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-4 w-4" />
            {store.address}, {store.city}, {store.province}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                store.status === "ACTIVE"
                  ? "bg-success/10 text-success"
                  : store.status === "INACTIVE"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-warning/10 text-warning"
              }`}
            >
              {store.status.replace("_", " ")}
            </span>
          </div>
        </div>
        {canAddTransactions && (
          <Button
            onClick={() => setIsAddingTransaction(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        )}
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Store Info</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Photo */}
            {store.photoUrl && (
              <div className="aspect-video w-full overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={store.photoUrl}
                  alt={store.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Store Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Owner Information
                </h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{store.ownerName}</span>
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{store.ownerPhone}</span>
                  </p>
                  {store.ownerEmail && (
                    <p className="text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {store.ownerEmail}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <StoreTransactionsTable transactions={transactions} />
        </TabsContent>
      </Tabs>

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        storeId={store.id}
        products={transactions.flatMap((t) => t.items.map((i) => i.product))}
        onTransactionAdded={fetchStoreData}
        isOpen={isAddingTransaction}
        onOpenChange={setIsAddingTransaction}
      />
    </div>
  )
}
