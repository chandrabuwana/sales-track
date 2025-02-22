import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import * as z from "zod";

const storeCreateSchema = z.object({
  name: z.string().min(1),
  ownerName: z.string().min(1),
  ownerPhone: z.string().min(1),
  ownerEmail: z.string().email().optional().nullable(),
  address: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
  type: z.enum(["RETAIL", "WHOLESALE", "SUPERMARKET", "MINIMARKET", "TRADITIONAL"]),
  notes: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const stores = await prisma.store.findMany({
      where: session.user.role === "ADMIN" 
        ? undefined 
        : {
            staff: {
              some: {
                userId: session.user.id,
              },
            },
          },
      include: {
        _count: {
          select: {
            stocks: true,
          },
        },
        stocks: {
          include: {
            product: true,
          },
        },
        sales: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            createdAt: true,
          },
        },
      },
    });

    // Transform store data
    const storesWithStats = await Promise.all(stores.map(async store => {
      // Count products with low stock
      const lowStockCount = store.stocks.filter(
        stock => stock.quantity <= stock.product.minStockLevel
      ).length;

      // Get total unique products
      const totalProducts = store.stocks.length;

      // Get total sales count
      const totalSales = await prisma.sale.count({
        where: { storeId: store.id },
      });

      return {
        id: store.id,
        name: store.name,
        ownerName: store.ownerName,
        ownerPhone: store.ownerPhone,
        ownerEmail: store.ownerEmail,
        address: store.address,
        city: store.city,
        province: store.province,
        type: store.type,
        latitude: store.latitude,
        longitude: store.longitude,
        status: store.status,
        approvedAt: store.approvedAt,
        stats: {
          totalProducts,
          totalSales,
          lastSale: store.sales[0]?.createdAt?.toISOString() || null,
          lowStock: lowStockCount,
        },
      };
    }));

    return NextResponse.json({ stores: storesWithStats });
  } catch (error) {
    console.error("[STORES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    
    try {
      const data = storeCreateSchema.parse(json);
      
      // Create the store
      const store = await prisma.store.create({
        data: {
          ...data,
          status: "PENDING_APPROVAL",
          staff: {
            create: {
              userId: session.user.id,
            },
          },
        },
      });

      return NextResponse.json({ store });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new NextResponse(JSON.stringify({ message: "Validation error", errors: error.errors }), { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error("[STORES_POST]", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }), 
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const json = await req.json();
    const { id, status, ...data } = json;

    if (!id) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    // Update store
    const store = await prisma.store.update({
      where: { id },
      data: {
        ...data,
        status,
        ...(status === "APPROVED" ? {
          approvedAt: new Date(),
          approvedBy: session.user.id,
        } : {}),
      },
    });

    return NextResponse.json({ store });
  } catch (error) {
    console.error("[STORES_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("id");

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    await prisma.store.delete({
      where: { id: storeId },
    });

    return NextResponse.json({ message: "Store deleted successfully" });
  } catch (error) {
    console.error("[STORES_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
