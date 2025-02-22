"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionItem {
  productId: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    sku: string;
  };
}

interface Transaction {
  id: string;
  createdAt: string;
  total: number;
  items: TransactionItem[];
  createdByUser: {
    name: string;
    email: string;
  };
}

// Group transactions by date
function groupTransactionsByDate(transactions: Transaction[]) {
  const groups = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Convert to array and sort by date (newest first)
  return Object.entries(groups)
    .map(([date, transactions]) => ({
      date,
      transactions,
      totalAmount: transactions.reduce((sum, t) => sum + t.total, 0),
      items: transactions.flatMap(t => t.items),
      salesPeople: [...new Set(transactions.map(t => t.createdByUser.name))],
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

interface StoreTransactionsTableProps {
  transactions: Transaction[];
}

export function StoreTransactionsTable({ transactions }: StoreTransactionsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Filter and group transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      new Date(transaction.createdAt).toLocaleDateString().toLowerCase().includes(searchLower) ||
      transaction.items.some((item) =>
        item.product.name.toLowerCase().includes(searchLower)
      ) ||
      transaction.createdByUser.name.toLowerCase().includes(searchLower)
    );
  });

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  // Sort grouped transactions
  const sortedGroups = [...groupedTransactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions by date, product, or sales person..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">
                <Button
                  variant="ghost"
                  onClick={() => setSortDirection(d => d === "asc" ? "desc" : "asc")}
                  className="flex items-center gap-1"
                >
                  Date
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Sales Person</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedGroups.map((group) => (
              <TableRow key={group.date}>
                <TableCell className="font-medium">{group.date}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {group.items.map((item, index) => (
                      <div key={index} className="text-sm flex justify-between">
                        <span>{item.product.name}</span>
                        <span className="text-muted-foreground">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {group.salesPeople.map((name, index) => (
                    <div key={index} className="text-sm">{name}</div>
                  ))}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${group.totalAmount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            {sortedGroups.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
