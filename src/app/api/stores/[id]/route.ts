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
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // First try to find by ID
    let store = await prisma.store.findUnique({
      where: { id },
      include: {
        stocks: {
          include: {
            product: true,
          },
        },
        staff: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        sales: {
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    // If not found by ID, try to find by name-based slug
    if (!store) {
      const normalizedId = id.replace(/-/g, " ");
      store = await prisma.store.findFirst({
        where: {
          name: {
            contains: normalizedId,
            mode: 'insensitive',
          },
        },
        include: {
          stocks: {
            include: {
              product: true,
            },
          },
          staff: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          sales: {
            take: 5,
            orderBy: {
              createdAt: "desc",
            },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });
    }

    if (!store) {
      return NextResponse.json(
        { message: "Store not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this store
    if (session.user.role !== "ADMIN") {
      const hasAccess = await prisma.storeStaff.findFirst({
        where: {
          storeId: store.id,
          userId: session.user.id,
        },
      });

      if (!hasAccess) {
        return NextResponse.json(
          { message: "You don't have access to this store" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ store });
  } catch (error) {
    console.error("[STORE_GET]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
