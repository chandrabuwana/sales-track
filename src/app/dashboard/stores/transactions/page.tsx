"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { TransactionsTable } from "@/components/transactions/transactions-table";

interface Transaction {
  id: string;
  createdAt: string;
  total: number;
  items: {
    productId: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      sku: string;
    };
  }[];
  createdByUser: {
    name: string;
    email: string;
  };
}

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch("/api/transactions");
        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }
        const data = await response.json();
        setTransactions(data.transactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchTransactions();
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Store Transactions</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all store transactions
        </p>
      </div>

      <TransactionsTable transactions={transactions} />
    </div>
  );
}
