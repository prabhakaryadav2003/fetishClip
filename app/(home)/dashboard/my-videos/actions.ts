"use server";

import path from "path";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import { Worker } from "worker_threads";
import { slugify } from "@/lib/utils";
import { addVideoAction } from "@/lib/auth/middleware";

const THUMB_DIR = path.resolve("./thumbnail");
const VIDEO_DIR = path.resolve("./video-stream");
const BACKUP_DIR = path.join(VIDEO_DIR, "backup");

export async function uploadVideo(formData: FormData) {
  const rawTitle = formData.get("title") as string;
  const safeTitle = slugify(rawTitle);
  const description = formData.get("description") as string;
  const tags = (formData.get("tags") as string)
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const thumbnailFile = formData.get("thumbnail") as File;
  const videoFile = formData.get("videoFile") as File;

  // ensure dirs exist
  await fs.mkdir(THUMB_DIR, { recursive: true });
  await fs.mkdir(BACKUP_DIR, { recursive: true });

  // save thumbnail
  const thumbPath = path.join(THUMB_DIR, `${safeTitle}.jpg`);
  await fs.writeFile(thumbPath, Buffer.from(await thumbnailFile.arrayBuffer()));

  // save raw video
  const ext = path.extname(videoFile.name) || ".mp4";
  const tempVideoPath = path.join(
    BACKUP_DIR,
    `${safeTitle}_${Date.now()}${ext}`
  );

  const arrayBuffer = await videoFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await new Promise<void>((resolve, reject) => {
    const ws = createWriteStream(tempVideoPath);
    ws.write(buffer);
    ws.end();
    ws.on("finish", resolve);
    ws.on("error", reject);
  });

  // worker for ffmpeg/HLS
  const worker = new Worker(path.resolve("./workers/videoProcessor.js"), {
    workerData: {
      inputPath: tempVideoPath,
      title: safeTitle,
      outputDir: VIDEO_DIR,
    },
  });

  worker.once("message", async (msg) => {
    if (msg.status === "done") {
      await addVideoAction({
        title: safeTitle,
        description,
        url: `/video-stream/${safeTitle}/master.m3u8`,
        thumbnail: `/thumbnail/${safeTitle}.jpg`,
        tags,
      });
    } else if (msg.status === "error") {
      console.error("Video processing failed:", msg.error);
    }
  });

  worker.once("error", (err) => {
    console.error("Worker error:", err);
  });

  return { status: "processing" };
}
