import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const storeId = searchParams.get("storeId");

    // Build query based on user role and filters
    const query: any = {
      include: {
        salesman: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        deliveryItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc" as const,
      },
    };

    // Add filters
    if (status) {
      query.where = {
        ...query.where,
        status,
      };
    }

    // If user is a salesman, only show their deliveries
    if (session.user.role === "SALES") {
      query.where = {
        ...query.where,
        salesmanId: session.user.id,
      };
    }

    // If storeId is provided and user is admin, filter by store
    if (storeId && session.user.role === "ADMIN") {
      query.where = {
        ...query.where,
        storeId,
      };
    }

    const deliveries = await prisma.delivery.findMany(query);
    return NextResponse.json({ deliveries });
  } catch (error) {
    console.error("[DELIVERIES_GET]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SALES") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const { storeId, items, notes } = json;

    // Validate input
    if (!storeId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Invalid delivery data" },
        { status: 400 }
      );
    }

    // Start a transaction
    const delivery = await prisma.$transaction(async (tx) => {
      // Create delivery
      const delivery = await tx.delivery.create({
        data: {
          salesmanId: session.user.id,
          storeId,
          notes,
          status: "PENDING",
          deliveryItems: {
            create: items.map((item: { productId: string; quantity: number }) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          salesman: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          store: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          deliveryItems: {
            include: {
              product: true,
            },
          },
        },
      });

      return delivery;
    });

    return NextResponse.json({ delivery });
  } catch (error) {
    console.error("[DELIVERIES_POST]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
