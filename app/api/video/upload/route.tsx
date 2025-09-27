import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import Busboy from "busboy";
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
  await fs.promises.appendFile(DEBUG_LOG, message);
}

export const config = {
  api: {
    bodyParser: false, // disable built-in parser for streaming
  },
};

export async function POST(req: any) {
  return new Promise(async (resolve) => {
    await logToFile("=== New upload started ===");

    if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR, { recursive: true });
    if (!fs.existsSync(BACKUP_DIR))
      fs.mkdirSync(BACKUP_DIR, { recursive: true });

    const headers = Object.fromEntries(req.headers);
    const busboy = Busboy({ headers });

    let rawTitle = "";
    let description = "";
    let tags: string[] = [];
    let safeTitle = "";
    let thumbPath = "";
    let videoPath = "";

    const filesToCleanup: string[] = [];

    busboy.on("field", (fieldname, val) => {
      if (fieldname === "title") rawTitle = val;
      if (fieldname === "description") description = val;
      if (fieldname === "tags")
        tags = val
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
    });

    busboy.on("file", (fieldname, file, filename) => {
      if (!safeTitle) {
        safeTitle = slugify(String(rawTitle || filename));
      }

      if (fieldname === "thumbnail") {
        thumbPath = path.join(THUMB_DIR, `${safeTitle}.jpg`);
        filesToCleanup.push(thumbPath);
        const out = fs.createWriteStream(thumbPath);
        file.pipe(out);
      }

      if (fieldname === "videoFile") {
        const ext = path.extname(String(filename)) || ".mp4";
        videoPath = path.join(BACKUP_DIR, `${safeTitle}_${Date.now()}${ext}`);
        filesToCleanup.push(videoPath);
        const out = fs.createWriteStream(videoPath);
        file.pipe(out);
      }

      file.on("error", async (err) => {
        await logToFile("File stream error:", err);
        filesToCleanup.forEach((p) => fs.existsSync(p) && fs.unlinkSync(p));
      });
    });

    // cleanup on client abort
    req.on("aborted", async () => {
      await logToFile("Upload aborted by client");
      filesToCleanup.forEach((p) => fs.existsSync(p) && fs.unlinkSync(p));
    });

    busboy.on("finish", async () => {
      try {
        await logToFile("Parsed fields:", {
          rawTitle,
          description,
          tags,
          thumbPath,
          videoPath,
        });

        if (!rawTitle || !description || !thumbPath || !videoPath) {
          filesToCleanup.forEach((p) => fs.existsSync(p) && fs.unlinkSync(p));
          await logToFile("Error: Missing required fields");
          resolve(
            NextResponse.json(
              { error: "Missing required fields" },
              { status: 400 }
            )
          );
          return;
        }

        // Start your worker thread
        const worker = new Worker(path.resolve("./workers/videoProcessor.js"), {
          workerData: {
            inputPath: videoPath,
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

        worker.once(
          "error",
          async (err) => await logToFile("Worker error:", err)
        );
        worker.once("exit", async (code) => {
          if (code !== 0) await logToFile("Worker exit code:", code);
        });

        resolve(
          NextResponse.json({
            status: "processing",
            title: safeTitle,
            thumbnailUrl: `/thumbnail/${safeTitle}.jpg`,
          })
        );
      } catch (err: any) {
        filesToCleanup.forEach((p) => fs.existsSync(p) && fs.unlinkSync(p));
        await logToFile("Upload error:", err.message ?? err);
        resolve(
          NextResponse.json(
            { error: err.message ?? "Upload failed" },
            { status: 500 }
          )
        );
      }
    });

    // pipe request body to busboy
    if (req.body && typeof (req.body as any).pipe === "function") {
      (req.body as any).pipe(busboy);
    } else {
      // handle Web Streams (Next 13 Request.body is a ReadableStream)
      const reader = req.body.getReader();
      const { Readable } = require("stream");
      const nodeStream = new Readable({
        async read() {
          const { done, value } = await reader.read();
          if (done) this.push(null);
          else this.push(value);
        },
      });
      nodeStream.pipe(busboy);
    }
  });
}
