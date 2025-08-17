"use server";

import path from "path";
import fs from "fs";
import { Worker } from "worker_threads";
import { slugify } from "@/lib/utils";
import { insertVideo } from "@/lib/db/queries";

const THUMB_DIR = path.resolve("./thumbnail");
const VIDEO_DIR = path.resolve("./video-stream");

export async function uploadVideo(formData: FormData) {
  const userId = Number(formData.get("userId"));
  const rawTitle = formData.get("title") as string;
  console.log(rawTitle, formData);
  const safeTitle = slugify(rawTitle);
  const description = formData.get("description") as string;
  const tags = (formData.get("tags") as string)
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const thumbnailFile = formData.get("thumbnail") as File;
  const videoFile = formData.get("videoFile") as File;

  if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR);
  if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR);

  // Save thumbnail
  const thumbPath = path.join(THUMB_DIR, `${safeTitle}.jpg`);
  fs.writeFileSync(thumbPath, Buffer.from(await thumbnailFile.arrayBuffer()));

  // Save raw video temporarily
  const tempVideoPath = path.join(
    VIDEO_DIR,
    "backup",
    `${safeTitle}_${Date.now()}`
  );
  fs.writeFileSync(tempVideoPath, Buffer.from(await videoFile.arrayBuffer()));

  console.log("Adding worker");
  // Spawn worker for HLS processing
  const worker = new Worker(path.resolve("./workers/videoProcessor.js"), {
    workerData: {
      inputPath: tempVideoPath,
      title: safeTitle,
      outputDir: VIDEO_DIR,
    },
  });

  worker.on("message", async (msg) => {
    if (msg.status === "done") {
      console.log("done worker");
      // Save DB entry after conversion
      // await insertVideo({
      //   title: safeTitle,
      //   description,
      //   url: `/video-stream/${safeTitle}/master.m3u8`,
      //   thumbnail: `/thumbnail/${safeTitle}.jpg`,
      //   uploaderId: userId,
      //   tags,
      // });
    } else if (msg.status === "error") {
      console.error("Video processing failed:", msg.error);
    }
  });

  worker.on("error", (err) => {
    console.error("Worker error:", err);
  });

  return { status: "processing" };
}
