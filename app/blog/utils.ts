import fs from 'fs'
import path from 'path'

type Metadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
}

// 将 md 内指向本地附件的相对引用改写为镜像后的公开路径。
// 支持两种解析：相对 md 所在目录、相对库根目录；只改写真实存在的文件。
function decodeURIComponentSafe(s: string) {
    try {
        return decodeURIComponent(s)
    } catch {
        return s
    }
}

export function rewriteRelativeRefs(
    content: string,
    mdAbsPath: string,
    rootDir: string,
    publicBase: string,
) {
    const mdDir = path.dirname(mdAbsPath)
    return content.replace(
        /(!?\[[^\]]*\]\()([^)\s]+)(\))/g,
        (whole, prefix: string, target: string, suffix: string) => {
            if (/^(https?:|\/|#|mailto:)/.test(target)) return whole
            const decoded = decodeURIComponentSafe(target)
            for (const base of [mdDir, rootDir]) {
                const resolved = path.resolve(base, decoded)
                if (
                    resolved.startsWith(rootDir) &&
                    fs.existsSync(resolved) &&
                    fs.statSync(resolved).isFile()
                ) {
                    const rel = path
                        .relative(rootDir, resolved)
                        .split(path.sep)
                        .join('/')
                    const url = publicBase + '/' + rel.replace(/ /g, '%20')
                    return `${prefix}${url}${suffix}`
                }
            }
            return whole
        },
    )
}

// Obsidian 兼容层：
// 1. ![[file]] / [[file|display]] 双链 → 按文件名在库内搜索并改写为公开路径
// 2. 代码块/行内代码之外的花括号转义（MDX 会把 {..} 当表达式）
function walkFiles(dir: string, out: string[]) {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) walkFiles(full, out)
        else out.push(full)
    }
}

function fileUrl(resolved: string, rootDir: string, publicBase: string) {
    const rel = path.relative(rootDir, resolved).split(path.sep).join('/')
    return publicBase + '/' + rel.replace(/ /g, '%20')
}

export function normalizeObsidianRefs(
    content: string,
    mdAbsPath: string,
    rootDir: string,
    publicBase: string,
    vaultRoot: string,
) {
    const vaultFiles: string[] = []
    walkFiles(vaultRoot, vaultFiles)
    const byName = new Map<string, string>()
    for (const f of vaultFiles) {
        const base = path.basename(f)
        byName.set(base, f)
        byName.set(path.basename(f, path.extname(f)), f)
    }
    const mdDir = path.dirname(mdAbsPath)

    return content.replace(
        /(!?)\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g,
        (whole, embed: string, targetRaw: string, displayRaw?: string) => {
            const target = targetRaw.trim()
            const resolved =
                byName.get(target) ??
                byName.get(decodeURIComponentSafe(target)) ??
                byName.get(path.basename(decodeURIComponentSafe(target)))
            if (!resolved || !resolved.startsWith(rootDir)) {
                // 解析不到的链接退化为纯文本，避免 MDX 解析崩溃
                return displayRaw ?? target
            }
            const url = resolved.startsWith(rootDir)
                ? fileUrl(resolved, rootDir, publicBase)
                : // 库根目录下的散落文件（如 Obsidian 粘贴图片）：镜像脚本会复制到 publicBase 根
                  publicBase + '/' + path.basename(resolved).replace(/ /g, '%20')
            const display = displayRaw ?? path.basename(target)
            return embed ? `![${display}](${url})` : `[${display}](${url})`
        },
    )
}

export function escapeBracesOutsideCode(content: string) {
    // 代码块/行内代码/数学公式（$..$、$$..$$）中的花括号原样保留
    const segments = content.split(
        /(```[\s\S]*?```|`[^`\n]*`|\$\$[\s\S]*?\$\$|\$[^$\n]*\$)/g,
    )
    return segments
        .map((segment, i) =>
            i % 2 === 1
                ? segment
                : segment.replace(/([{}])/g, '\\$1'),
        )
        .join('')
}

export function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  let match = frontmatterRegex.exec(fileContent)
  if (!match) {
    // 没有/frontmatter 不完整：整篇当作正文，元数据留空
    return { metadata: {} as Metadata, content: fileContent.trim() }
  }
  let frontMatterBlock = match[1]
  let content = fileContent.replace(frontmatterRegex, '').trim()
  let frontMatterLines = frontMatterBlock.trim().split('\n')
  let metadata: Partial<Metadata> = {}

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(': ')
    let value = valueArr.join(': ').trim()
    value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
    metadata[key.trim() as keyof Metadata] = value
  })

  return { metadata: metadata as Metadata, content }
}

function getMDXFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((file) => ['.md', '.mdx'].includes(path.extname(file)))
}

function readMDXFile(filePath) {
  let rawContent = fs.readFileSync(filePath, 'utf-8')
  return parseFrontmatter(rawContent)
}

function getMDXData(dir) {
  const vaultRoot = path.join(process.cwd(), 'posts')
  let mdxFiles = getMDXFiles(dir)
  return mdxFiles.map((file) => {
    let absPath = path.join(dir, file)
    let { metadata, content } = readMDXFile(absPath)
    content = normalizeObsidianRefs(content, absPath, dir, '/blog-assets', vaultRoot)
    content = rewriteRelativeRefs(content, absPath, dir, '/blog-assets')
    content = escapeBracesOutsideCode(content)
    let slug = path.basename(file, path.extname(file))

    return {
      metadata,
      slug,
      content,
    }
  })
}

export function getBlogPosts() {
  return getMDXData(path.join(process.cwd(), 'app', 'blog', 'posts'))
}

export function formatDate(date: string) {
  if (!date.includes('T')) {
    date = `${date}T00:00:00`
  }
  let targetDate = new Date(date)

  let year = targetDate.getFullYear()
  let month = String(targetDate.getMonth() + 1).padStart(2, '0')
  let day = String(targetDate.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
