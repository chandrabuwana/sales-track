import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const sales = await prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        salesman: {
          select: {
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform sales to match the transactions interface
    const transactions = sales.map((sale) => ({
      id: sale.id,
      createdAt: sale.createdAt,
      total: sale.total,
      items: sale.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: item.product,
      })),
      createdByUser: {
        name: sale.salesman.name,
        email: sale.salesman.email,
      },
      store: sale.store,
    }));

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("[TRANSACTIONS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
