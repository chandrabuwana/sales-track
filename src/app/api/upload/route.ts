import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return new NextResponse("Invalid file type", { status: 400 });
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new NextResponse("File too large", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const hash = crypto.createHash("sha256");
    hash.update(buffer);
    const fileHash = hash.digest("hex").slice(0, 8);
    const ext = file.name.split(".").pop();
    const filename = `${fileHash}-${Date.now()}.${ext}`;

    // Save file to public directory
    const publicDir = join(process.cwd(), "public");
    const uploadsDir = join(publicDir, "uploads");

    try {
      // Ensure uploads directory exists
      await mkdir(uploadsDir, { recursive: true });
      
      // Write file
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);
      
      return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (error) {
      console.error("Error handling file upload:", error);
      return new NextResponse(
        JSON.stringify({ message: "Failed to save file" }), 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[UPLOAD_POST]", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }), 
      { status: 500 }
    );
  }
}

export async function GET() {
  return new NextResponse("Method not allowed", { status: 405 });
}
