import fs from "fs";
import path from "path";

// 朋友圈版块：数据在 data/moments.jsonl（一行一条 JSON），图片在 public/moments/。
// 添加方式：pnpm moment "内容" [图片1 图片2 ...]

type Moment = {
  datetime: string;
  text: string;
  images: string[];
};

const DATA_FILE = path.join(process.cwd(), "data", "moments.jsonl");
const IMAGES_DIR = path.join(process.cwd(), "public", "moments");

export function getMoments(): Moment[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  const seen: Moment[] = [];
  for (const line of fs.readFileSync(DATA_FILE, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const obj = JSON.parse(trimmed);
      if (typeof obj.text === "string" && typeof obj.datetime === "string") {
        seen.push({
          datetime: obj.datetime,
          text: obj.text,
          images: Array.isArray(obj.images) ? obj.images : [],
        });
      }
    } catch {
      console.warn(`[moments] invalid jsonl line skipped: ${trimmed.slice(0, 40)}`);
    }
  }
  // 时间降序（新的在上）；datetime 需为 YYYY-MM-DD HH:mm 格式，可直接按字符串比较
  return seen.sort((a, b) => b.datetime.localeCompare(a.datetime));
}

export function Moments() {
  const moments = getMoments();
  return (
    <section className="text-lg">
      <div className="flex justify-between items-baseline my-3">
        <h2 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100">
          Moments
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          共 {moments.length} 条
        </p>
      </div>
      <div>
        {moments.map((moment, i) => {
          const availableImages = moment.images.filter((img) => {
            if (fs.existsSync(path.join(IMAGES_DIR, img))) return true;
            console.warn(`[moments] missing image skipped: ${img}`);
            return false;
          });
          return (
            <div key={i} className="mb-8">
              <div className="flex items-baseline gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                <span className="tabular-nums">
                  #{String(moments.length - i).padStart(2, "0")}
                </span>
                <span>{moment.datetime}</span>
              </div>
              <p className="mt-1 whitespace-pre-line">{moment.text}</p>
              {availableImages.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-3">
                  {availableImages.map((img) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={img}
                      src={`/moments/${img.split("/").map(encodeURIComponent).join("/")}`}
                      alt={img}
                      className="max-h-72 w-auto rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
