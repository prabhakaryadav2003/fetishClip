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
  const type = searchParams.get("type") ?? "master"; // master or variant
  const quality = searchParams.get("quality") ?? "v0"; // v0, v1, etc.

  if (!videoId) return new NextResponse("Missing videoId", { status: 400 });

  let playlistPath: string;

  if (type === "variant") {
    playlistPath = path.resolve(`video-stream/${videoId}/${quality}/prog.m3u8`);
  } else {
    playlistPath = path.resolve(`video-stream/${videoId}/master.m3u8`);
  }

  if (!fs.existsSync(playlistPath)) {
    return new NextResponse("Playlist not found", { status: 404 });
  }

  const content = fs.readFileSync(playlistPath, "utf8").replace(/\\/g, "/");

  const rewritten = content
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();

      // Rewrite nested variant playlists (e.g. v0/prog.m3u8)
      if (type === "master" && trimmed.endsWith(".m3u8")) {
        const quality = trimmed.split("/")[0];
        return `/api/video/playlist?videoId=${videoId}&type=variant&quality=${quality}`;
      }

      // Rewrite .ts segment paths
      if (type === "variant" && trimmed.endsWith(".ts")) {
        return `/api/video/segment?videoId=${videoId}&quality=${quality}&segment=${encodeURIComponent(trimmed)}`;
      }

      return line;
    })
    .join("\n");

  return new NextResponse(rewritten, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.apple.mpegurl",
      "Cache-Control": "no-store",
    },
  });
}
