const { parentPort, workerData } = require("worker_threads");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const { inputPath, title, outputDir } = workerData;
const videoDir = path.join(outputDir, title);

// Create output folders
fs.mkdirSync(videoDir, { recursive: true });

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr || stdout || err.message);
      else resolve();
    });
  });
}

async function convertToHLS() {
  console.log("Working");

  // Use path.normalize to make Windows-compatible paths
  const input = path.normalize(inputPath);
  const output = path.normalize(videoDir);

  const cmd =
    `ffmpeg -i "${input}" ` +
    `-filter_complex "` +
    `[0:v]split=3[v1][v2][v3];` +
    `[v1]scale=w=1920:h=1080:force_original_aspect_ratio=decrease:force_divisible_by=2[v1out];` +
    `[v2]scale=w=1280:h=720:force_original_aspect_ratio=decrease:force_divisible_by=2[v2out];` +
    `[v3]scale=w=854:h=480:force_original_aspect_ratio=decrease:force_divisible_by=2[v3out]" ` +
    `-map "[v1out]" -map a -c:v:0 h264 -b:v:0 5400k -maxrate:v:0 5400k -bufsize:v:0 10800k -preset veryfast -c:a:0 aac -b:a:0 128k ` +
    `-map "[v2out]" -map a -c:v:1 h264 -b:v:1 3000k -maxrate:v:1 3000k -bufsize:v:1 6000k -preset veryfast -c:a:1 aac -b:a:1 128k ` +
    `-map "[v3out]" -map a -c:v:2 h264 -b:v:2 1500k -maxrate:v:2 1500k -bufsize:v:2 3000k -preset veryfast -c:a:2 aac -b:a:2 128k ` +
    `-var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" ` +
    `-master_pl_name master.m3u8 ` +
    `-f hls -hls_time 4 -hls_list_size 0 ` +
    `-hls_segment_filename "${output}\\v%v\\seg_%03d.ts" "${output}\\v%v\\prog.m3u8"`;

  try {
    await runCommand(cmd);
    parentPort.postMessage({ status: "done", dir: videoDir });
  } catch (err) {
    parentPort.postMessage({ status: "error", error: err });
  }
}

convertToHLS();
