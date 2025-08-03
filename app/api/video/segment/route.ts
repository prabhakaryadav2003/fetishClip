import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  // const session = await getServerSession(authOptions);
  // if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");
  const quality = searchParams.get("quality");
  const segment = searchParams.get("segment");

  if (
    !videoId ||
    !segment ||
    !quality ||
    !segment.endsWith(".ts") ||
    segment.includes("..") ||
    quality.includes("..")
  ) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  const segmentPath = path.resolve(
    `video-stream/${videoId}/${quality}/${segment}`
  );
  if (!fs.existsSync(segmentPath))
    return new NextResponse("Segment not found", { status: 404 });

  const stat = fs.statSync(segmentPath);
  const stream = fs.createReadStream(segmentPath);

  return new NextResponse(stream as any, {
    status: 200,
    headers: {
      "Content-Type": "video/mp2t",
      "Content-Length": stat.size.toString(),
      "Cache-Control": "no-store",
    },
  });
}
