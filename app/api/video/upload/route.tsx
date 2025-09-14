import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { Worker } from "worker_threads";
import { slugify } from "@/lib/utils";
import { addVideoAction } from "@/lib/auth/middleware";

const THUMB_DIR = path.resolve("./thumbnail");
const VIDEO_DIR = path.resolve("./video-stream");
const BACKUP_DIR = path.join(VIDEO_DIR, "backup");
const DEBUG_LOG = path.resolve("./upload-debug.txt");

async function logToFile(...args: any[]) {
  const message =
    `[${new Date().toISOString()}] ` +
    args
      .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : a))
      .join(" ") +
    "\n";
  await fs.appendFile(DEBUG_LOG, message);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    await logToFile("=== New upload started ===");
    for (const [key, value] of formData.entries()) {
      await logToFile(
        "FormData entry:",
        key,
        value instanceof File ? value.name : value
      );
    }

    const rawTitle = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tags =
      (formData.get("tags") as string)
        ?.split(",")
        .map((t) => t.trim())
        .filter(Boolean) ?? [];
    const thumbnailFile = formData.get("thumbnail") as File;
    const videoFile = formData.get("videoFile") as File;

    await logToFile("Parsed fields:", {
      rawTitle,
      description,
      tags,
      thumbnailFile: thumbnailFile?.name,
      videoFile: videoFile?.name,
    });

    if (!rawTitle || !description || !thumbnailFile || !videoFile) {
      await logToFile("Error: Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const safeTitle = slugify(rawTitle);

    await fs.mkdir(THUMB_DIR, { recursive: true });
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    const thumbPath = path.join(THUMB_DIR, `${safeTitle}.jpg`);
    await fs.writeFile(
      thumbPath,
      Buffer.from(await thumbnailFile.arrayBuffer())
    );
    await logToFile("Thumbnail saved:", thumbPath);

    const ext = path.extname(videoFile.name) || ".mp4";
    const tempVideoPath = path.join(
      BACKUP_DIR,
      `${safeTitle}_${Date.now()}${ext}`
    );
    await fs.writeFile(
      tempVideoPath,
      Buffer.from(await videoFile.arrayBuffer())
    );
    await logToFile("Video backup saved:", tempVideoPath);

    const worker = new Worker(path.resolve("./workers/videoProcessor.js"), {
      workerData: {
        inputPath: tempVideoPath,
        title: safeTitle,
        outputDir: VIDEO_DIR,
      },
    });

    worker.once("message", async (msg) => {
      await logToFile("Worker message:", msg);
      if (msg.status === "done") {
        await addVideoAction({
          title: safeTitle,
          description,
          url: `/video-stream/${safeTitle}/master.m3u8`,
          thumbnail: `/thumbnail/${safeTitle}.jpg`,
          tags,
        });
      } else if (msg.status === "error") {
        await logToFile("Video processing failed:", msg.error);
      }
    });

    worker.once("error", async (err) => await logToFile("Worker error:", err));
    worker.once("exit", async (code) => {
      if (code !== 0) await logToFile("Worker exit code:", code);
    });

    return NextResponse.json({
      status: "processing",
      title: safeTitle,
      thumbnailUrl: `/thumbnail/${safeTitle}.jpg`,
    });
  } catch (err: any) {
    await logToFile("Upload error:", err.message ?? err);
    return NextResponse.json(
      { error: err.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
