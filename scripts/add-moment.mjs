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

// 抓取 macOS 剪贴板中的图片并保存到 dest；返回 [是否成功, 诊断信息]
function grabClipboardImage(dest) {
  if (process.platform !== "darwin") {
    return [false, "剪贴板抓图目前仅支持 macOS"];
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
  if (res.error) return [false, String(res.error)];
  if (res.status !== 0)
    return [false, `swift exit ${res.status}: ${String(res.stderr).slice(0, 150)}`];
  if (res.stdout.includes("OK")) return [true, ""];
  return [false, `swift stdout: ${String(res.stdout).trim().slice(0, 100)}`];
}

function appendMoment(text, images) {
  const entry = JSON.stringify({ datetime, text: text.trim(), images });
  fs.appendFileSync(dataFile, entry + "\n");
  console.log(`\n已添加动态 (${datetime}): ${text.trim()}`);
  if (images.length) console.log(`图片: ${images.join(", ")}`);
  autoPush(text.trim());
}

// 发布后自动提交并推送本条动态涉及的文件；失败时提示手动推送
function autoPush(text) {
  if (!fs.existsSync(path.join(process.cwd(), ".git"))) return;
  const git = (...args) => spawnSync("git", args, { encoding: "utf-8" });
  git("add", "data/moments.jsonl", "public/moments");
  const commit = git("commit", "-m", `moment: ${text.slice(0, 40)}`);
  if (commit.status !== 0) {
    console.log("（未自动提交：无变化或提交失败，请手动 git push）");
    return;
  }
  const push = git("push", "origin", "main");
  console.log(
    push.status === 0
      ? "已自动提交并推送，VPS 将自动部署上线。"
      : "自动推送失败，请手动 git push。"
  );
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
    let grabErr = "";
    if (usePngpaste) {
      try {
        execFileSync("pngpaste", [dest]);
        ok = fs.existsSync(dest) && fs.statSync(dest).size > 0;
        if (!ok) grabErr = "pngpaste 未写出图片";
      } catch (e) {
        grabErr = String(e);
      }
    } else {
      [ok, grabErr] = grabClipboardImage(dest);
    }
    if (ok) {
      images.push(path.basename(dest));
      console.log(`已保存: ${path.basename(dest)}`);
    } else {
      console.log(
        "剪贴板中没有图片（或抓取失败），可再粘贴重试，或输入 s 结束。"
      );
      if (grabErr) {
        console.log(`诊断: ${grabErr.slice(0, 200)}`);
      }
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
