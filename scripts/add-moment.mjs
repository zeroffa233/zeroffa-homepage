#!/usr/bin/env node
// 发布朋友圈动态。
//   带参数（脚本模式）: pnpm moment "内容" [图片1 图片2 ...]
//   无参数（交互模式）: pnpm moment
//     1. 逐行输入文字，空行结束
//     2. 回车抓取剪贴板图片（可多次），输入 s 结束图片
// 数据保存在 data/moments.jsonl（一行一条 JSON），图片拷贝到 public/moments/。
import fs from "fs";
import path from "path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { execFileSync, spawnSync } from "node:child_process";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "moments.jsonl");
const imgDest = path.join(process.cwd(), "public", "moments");
fs.mkdirSync(path.dirname(dataFile), { recursive: true });
fs.mkdirSync(imgDest, { recursive: true });

const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const datetime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
  now.getDate()
)} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
const stamp = datetime.replace(/[-: ]/g, "");

function hasCommand(cmd) {
  try {
    spawnSync(cmd, ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// 抓取 macOS 剪贴板中的图片并保存到 dest；返回是否成功
function grabClipboardImage(dest) {
  if (process.platform !== "darwin") {
    console.error("剪贴板抓图目前仅支持 macOS。");
    return false;
  }
  const script = [
    "import AppKit",
    "import Foundation",
    "let pb = NSPasteboard.general",
    "let data = pb.data(forType: .png) ?? pb.data(forType: .tiff).flatMap { NSBitmapImageRep(data: $0)?.representation(using: .png, properties: [:]) }",
    'guard let data = data else { print("NOIMAGE"); exit(0) }',
    'try! data.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))',
    'print("OK")',
  ].join("; ");
  const res = spawnSync("swift", ["-e", script, dest], { encoding: "utf-8" });
  return res.status === 0 && res.stdout.includes("OK");
}

function appendMoment(text, images) {
  const entry = JSON.stringify({ datetime, text: text.trim(), images });
  fs.appendFileSync(dataFile, entry + "\n");
  console.log(`\n已添加动态 (${datetime}): ${text.trim()}`);
  if (images.length) console.log(`图片: ${images.join(", ")}`);
}

async function interactive() {
  const rl = readline.createInterface({ input, output });

  console.log("— 交互模式 —");
  const lines = [];
  for (;;) {
    const line = await rl.question("输入内容（空行结束输入）: ");
    if (!line.trim()) break;
    lines.push(line);
  }
  if (lines.length === 0) {
    console.log("未输入内容，退出。");
    rl.close();
    process.exit(0);
  }
  const text = lines.join("\n");

  const images = [];
  const usePngpaste = hasCommand("pngpaste");
  for (;;) {
    const answer = await rl.question(
      "粘贴图片后回车抓取（输入 s 结束图片采集）: "
    );
    if (answer.trim().toLowerCase() === "s") break;
    const dest = path.join(
      imgDest,
      `${stamp}-${String(images.length + 1).padStart(2, "0")}.png`
    );
    let ok = false;
    if (usePngpaste) {
      try {
        execFileSync("pngpaste", [dest]);
        ok = fs.existsSync(dest) && fs.statSync(dest).size > 0;
      } catch {
        ok = false;
      }
    } else {
      ok = grabClipboardImage(dest);
    }
    if (ok) {
      images.push(path.basename(dest));
      console.log(`已保存: ${path.basename(dest)}`);
    } else {
      console.log("剪贴板中没有图片（或抓取失败），可再粘贴重试，或输入 s 结束。");
    }
  }
  rl.close();

  appendMoment(text, images);
}

function scriptMode() {
  const [text, ...images] = process.argv.slice(2);
  const saved = [];
  for (const img of images) {
    if (!fs.existsSync(img)) {
      console.warn(`跳过不存在的图片: ${img}`);
      continue;
    }
    const dest = `${stamp}-${path.basename(img)}`;
    fs.copyFileSync(img, path.join(imgDest, dest));
    saved.push(dest);
  }
  appendMoment(text, saved);
}

if (process.argv.slice(2).length === 0) {
  await interactive();
} else {
  scriptMode();
}
