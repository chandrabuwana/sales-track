import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  sku: z
    .string()
    .min(3, "SKU must be at least 3 characters")
    .max(50, "SKU must be less than 50 characters")
    .regex(/^[A-Za-z0-9-_]+$/, "SKU can only contain letters, numbers, hyphens, and underscores"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .nullable()
    .optional(),
  price: z
    .number()
    .min(0, "Price cannot be negative")
    .max(1000000, "Price cannot exceed 1,000,000"),
  stock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .max(1000000, "Stock cannot exceed 1,000,000"),
  minStockLevel: z
    .number()
    .int("Minimum stock level must be a whole number")
    .min(0, "Minimum stock level cannot be negative")
    .max(1000000, "Minimum stock level cannot exceed 1,000,000"),
  category: z
    .string()
    .min(2, "Category must be at least 2 characters")
    .max(50, "Category must be less than 50 characters")
    .nullable()
    .optional(),
});
