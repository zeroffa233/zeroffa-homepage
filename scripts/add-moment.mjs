#!/usr/bin/env node
// 快捷发布一条朋友圈动态：
//   pnpm moment "内容" [图片1 图片2 ...]
// 数据保存在 data/moments.jsonl（一行一条 JSON），图片拷贝到 public/moments/。
import fs from "fs";
import path from "path";

const [text, ...images] = process.argv.slice(2);
if (!text || !text.trim()) {
  console.error('用法: pnpm moment "内容" [图片1 图片2 ...]');
  process.exit(1);
}

const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const datetime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
  now.getDate()
)} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "moments.jsonl");
const imgDest = path.join(process.cwd(), "public", "moments");
fs.mkdirSync(path.dirname(dataFile), { recursive: true });
fs.mkdirSync(imgDest, { recursive: true });

const saved = [];
for (const img of images) {
  if (!fs.existsSync(img)) {
    console.warn(`跳过不存在的图片: ${img}`);
    continue;
  }
  const stamp = datetime.replace(/[-: ]/g, "");
  const dest = `${stamp}-${path.basename(img)}`;
  fs.copyFileSync(img, path.join(imgDest, dest));
  saved.push(dest);
}

const entry = JSON.stringify({
  datetime,
  text: text.trim(),
  images: saved,
});
fs.appendFileSync(dataFile, entry + "\n");

console.log(`已添加动态 (${datetime}): ${text.trim()}`);
if (saved.length) console.log(`图片: ${saved.join(", ")}`);
