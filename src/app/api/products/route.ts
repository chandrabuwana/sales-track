import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Build query based on user role
    const query: any = {
      include: {
        storeStocks: {
          include: {
            store: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    };

    // If user is not admin, only show products from their assigned stores
    if (session.user.role !== "ADMIN") {
      query.where = {
        storeStocks: {
          some: {
            store: {
              staff: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          },
        },
      };
    }

    const products = await prisma.product.findMany(query);

    // Transform data to match frontend expectations
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.storeStocks.reduce((total, stock) => total + stock.quantity, 0),
      stores: product.storeStocks.map(stock => ({
        id: stock.store.id,
        name: stock.store.name,
        stock: stock.quantity,
      })),
      category: product.category || "",
      sku: product.sku,
      minStockLevel: product.minStockLevel,
      expiryDate: product.expiryDate,
    }));

    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const json = await req.json();
    const { name, sku, description, price, stock, minStockLevel, category } = json;

    if (!name || !sku || typeof price !== 'number' || typeof stock !== 'number') {
      return NextResponse.json(
        { message: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingProduct = await prisma.product.findFirst({
      where: { sku },
    });

    if (existingProduct) {
      return NextResponse.json(
        { message: "SKU already exists" },
        { status: 400 }
      );
    }

    // Verify user exists before creating product
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description: description || null,
        price,
        stock,
        minStockLevel: minStockLevel || 10,
        category: category || null,
        userId: user.id // Use userId directly instead of connect
      },
      include: {
        storeStocks: {
          include: {
            store: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("[PRODUCTS_POST]", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const json = await req.json();
    const { id, ...data } = json;

    if (!id) {
      return NextResponse.json(
        { message: "Product ID required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        storeStocks: {
          include: {
            store: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("[PRODUCTS_PATCH]", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Product ID required" },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PRODUCTS_DELETE]", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
