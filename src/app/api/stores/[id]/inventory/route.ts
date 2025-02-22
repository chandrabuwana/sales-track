import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

type ContextType = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: Request,
  context: ContextType
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the store ID from params
    const { id: storeId } = await context.params;

    // Verify store exists and user has access
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ...(session.user.role !== "ADMIN" && {
          staff: {
            some: {
              userId: session.user.id,
            },
          },
        }),
      },
    });

    if (!store) {
      return new NextResponse("Store not found or access denied", { status: 404 });
    }

    const inventory = await prisma.storeStock.findMany({
      where: { storeId },
      include: {
        product: true,
        store: true,
      },
    });

    // Get sales data for each product
    const inventoryWithSales = await Promise.all(
      inventory.map(async (item) => {
        const sales = await prisma.sale.findMany({
          where: {
            storeId,
            items: {
              some: {
                productId: item.product.id,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 3,
          include: {
            items: {
              where: {
                productId: item.product.id,
              },
            },
          },
        });

        return {
          product: item.product,
          currentStock: item.quantity,
          sales,
        };
      })
    );

    return NextResponse.json({ inventory: inventoryWithSales });
  } catch (error) {
    console.error("[STORE_INVENTORY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
