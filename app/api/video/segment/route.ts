import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Route handler for serving video segments
export async function GET(req: NextRequest) {
  // Adding authentication (currently disabled)
  // const session = await getServerSession(authOptions);
  // if (!session) return new NextResponse("Unauthorized", { status: 401 });

  // Parse query parameters from the request URL
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");
  const quality = searchParams.get("quality"); // e.g. "720p"
  const segment = searchParams.get("segment"); // e.g. "file_0001.ts"

  // Validate input to avoid path traversal or invalid requests
  if (
    !videoId ||
    !segment ||
    !quality ||
    !segment.endsWith(".ts") ||
    segment.includes("..") || // Prevent directory traversal attacks
    quality.includes("..")
  ) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  // Resolve the absolute path of the requested segment
  const segmentPath = path.resolve(
    `video-stream/${videoId}/${quality}/${segment}`
  );

  // If the file does not exist, return 404
  if (!fs.existsSync(segmentPath))
    return new NextResponse("Segment not found", { status: 404 });

  // Get file metadata (e.g. size) and create a read stream
  const stat = fs.statSync(segmentPath);
  const stream = fs.createReadStream(segmentPath);

  // Return the video segment as the response body
  return new NextResponse(stream as any, {
    status: 200,
    headers: {
      "Content-Type": "video/mp2t",
      "Content-Length": stat.size.toString(),
      "Cache-Control": "no-store",
    },
  });
}
