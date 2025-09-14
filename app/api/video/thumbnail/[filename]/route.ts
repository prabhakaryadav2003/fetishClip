import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Small helper to map extension -> MIME type
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
  { params }: { params: { filename: string } }
) {
  try {
    const filePath = path.join(process.cwd(), "thumbnail", params.filename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = getMimeType(params.filename);

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
