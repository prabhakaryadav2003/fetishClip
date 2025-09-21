import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Helper to map extension -> MIME type
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  req: Request,
  ctx: {
    params: Promise<{ filename: string }>;
  }
) {
  try {
    // normalize params (await if it’s a Promise)
    const resolvedParams = await ctx.params;
    const { filename } = resolvedParams;

    if (!filename) {
      return new NextResponse("Filename not provided", { status: 400 });
    }

    const filePath = path.join(process.cwd(), "thumbnail", filename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = getMimeType(filename);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Thumbnail server error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
