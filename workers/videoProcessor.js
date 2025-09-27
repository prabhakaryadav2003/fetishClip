const { parentPort, workerData } = require("worker_threads");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Destructure worker data
const { inputPath, title, outputDir } = workerData;

// Define the video output folder
const videoDir = path.join(outputDir, title);
fs.mkdirSync(videoDir, { recursive: true });

// Path to local FFmpeg static binary
const ffmpegPath = path
  .join(
    "ffmpeg-7.0.2-amd64-static",
    process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg"
  )
  .replace(/\\/g, "/");

// Bitrate / resolution variants
const variants = [
  {
    name: "1080p",
    width: 1920,
    height: 1080,
    videoBitrate: "5400k",
    audioBitrate: "384k",
  },
  {
    name: "720p",
    width: 1280,
    height: 720,
    videoBitrate: "3000k",
    audioBitrate: "256k",
  },
  {
    name: "480p",
    width: 854,
    height: 480,
    videoBitrate: "1500k",
    audioBitrate: "128k",
  },
];

// Create per-variant folders (v0, v1, v2)
variants.forEach((v, i) =>
  fs.mkdirSync(path.join(videoDir, `v${i}`), { recursive: true })
);

// Log file
const logFilePath = path.join(videoDir, "ffmpeg.log");

function runFFmpeg(cmdArgs) {
  return new Promise((resolve, reject) => {
    const logStream = fs.createWriteStream(logFilePath, { flags: "a" });
    const ffmpeg = spawn(ffmpegPath, cmdArgs, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    ffmpeg.stdout.pipe(logStream, { end: false });
    ffmpeg.stderr.pipe(logStream, { end: false });

    ffmpeg.on("close", (code) => {
      logStream.write(`\n==== FFmpeg exited with code ${code} ====\n`);
      logStream.end();
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });

    ffmpeg.on("error", (err) => {
      logStream.write(`\n==== FFmpeg error: ${err.message} ====\n`);
      logStream.end();
      reject(err);
    });
  });
}

// Encode a single variant
async function convertVariant(v, idx) {
  const input = path.normalize(inputPath);
  const outputFolder = path.join(videoDir, `v${idx}`);
  fs.mkdirSync(outputFolder, { recursive: true });

  const hlsSegmentPath = path
    .join(outputFolder, "seg_%03d.ts")
    .replace(/\\/g, "/");
  const hlsPlaylistPath = path
    .join(outputFolder, "prog.m3u8")
    .replace(/\\/g, "/");

  const filterComplex = `[0:v]scale=w=${v.width}:h=${v.height}:force_original_aspect_ratio=decrease:force_divisible_by=2[v]`;

  const cmdArgs = [
    "-i",
    input,
    "-filter_complex",
    filterComplex,
    "-map",
    "[v]",
    "-map",
    "a",
    "-c:v",
    "libx264",
    "-b:v",
    v.videoBitrate,
    "-maxrate",
    v.videoBitrate,
    "-bufsize",
    `${parseInt(v.videoBitrate) * 2}k`,
    "-preset",
    "veryfast",
    "-threads",
    "4", // Limit CPU threads
    "-c:a",
    "aac",
    "-ac",
    "6", // 5.1 audio
    "-b:a",
    v.audioBitrate,
    "-f",
    "hls",
    "-hls_time",
    "4",
    "-hls_list_size",
    "0",
    "-hls_segment_filename",
    hlsSegmentPath,
    hlsPlaylistPath,
  ];

  await runFFmpeg(cmdArgs);
}

// Main conversion loop (step-by-step)
async function convertToHLS() {
  try {
    console.log(`Starting HLS conversion for ${title}`);

    for (let i = 0; i < variants.length; i++) {
      console.log(`Encoding variant: ${variants[i].name}`);
      await convertVariant(variants[i], i);
    }

    // Generate master playlist after all variants are done
    const masterPl = path.join(videoDir, "master.m3u8");
    const masterContent = variants
      .map(
        (v, i) =>
          `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(v.videoBitrate) * 1000},RESOLUTION=${v.width}x${v.height}\nv${i}/prog.m3u8`
      )
      .join("\n");
    fs.writeFileSync(masterPl, `#EXTM3U\n${masterContent}`);

    parentPort.postMessage({ status: "done", dir: videoDir, log: logFilePath });
  } catch (err) {
    parentPort.postMessage({
      status: "error",
      error: err.message,
      log: logFilePath,
    });
  }
}

// Start conversion safely
(async () => {
  try {
    await convertToHLS();
  } catch (err) {
    parentPort.postMessage({ status: "error", error: err.message });
  }
})();
