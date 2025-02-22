import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const delivery = await prisma.delivery.findUnique({
      where: { id: params.id },
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

    if (!delivery) {
      return NextResponse.json({ message: "Delivery not found" }, { status: 404 });
    }

    // Check if user has access to this delivery
    if (
      session.user.role !== "ADMIN" &&
      delivery.salesmanId !== session.user.id
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ delivery });
  } catch (error) {
    console.error("[DELIVERY_GET]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SALES") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const { status, notes } = json;

    // Get current delivery
    const currentDelivery = await prisma.delivery.findUnique({
      where: { id: params.id },
      include: {
        deliveryItems: true,
      },
    });

    if (!currentDelivery) {
      return NextResponse.json({ message: "Delivery not found" }, { status: 404 });
    }

    // Check if user owns this delivery
    if (currentDelivery.salesmanId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Start transaction
    const delivery = await prisma.$transaction(async (tx) => {
      // Update delivery status
      const delivery = await tx.delivery.update({
        where: { id: params.id },
        data: {
          status,
          notes,
          ...(status === "DELIVERED" && { completedAt: new Date() }),
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

      // If delivery is completed, update store inventory
      if (status === "DELIVERED") {
        for (const item of currentDelivery.deliveryItems) {
          // Get current inventory
          const inventory = await tx.inventory.findUnique({
            where: {
              storeId_productId: {
                storeId: currentDelivery.storeId,
                productId: item.productId,
              },
            },
          });

          if (inventory) {
            // Update existing inventory
            await tx.inventory.update({
              where: {
                storeId_productId: {
                  storeId: currentDelivery.storeId,
                  productId: item.productId,
                },
              },
              data: {
                quantity: inventory.quantity + item.quantity,
              },
            });
          } else {
            // Create new inventory record
            await tx.inventory.create({
              data: {
                storeId: currentDelivery.storeId,
                productId: item.productId,
                quantity: item.quantity,
              },
            });
          }
        }
      }

      return delivery;
    });

    return NextResponse.json({ delivery });
  } catch (error) {
    console.error("[DELIVERY_PATCH]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SALES") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const delivery = await prisma.delivery.findUnique({
      where: { id: params.id },
    });

    if (!delivery) {
      return NextResponse.json({ message: "Delivery not found" }, { status: 404 });
    }

    // Check if user owns this delivery
    if (delivery.salesmanId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only allow deletion of pending deliveries
    if (delivery.status !== "PENDING") {
      return NextResponse.json(
        { message: "Can only delete pending deliveries" },
        { status: 400 }
      );
    }

    await prisma.delivery.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELIVERY_DELETE]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
