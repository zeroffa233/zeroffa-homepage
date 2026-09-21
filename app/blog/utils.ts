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
  let mdxFiles = getMDXFiles(dir)
  return mdxFiles.map((file) => {
    let absPath = path.join(dir, file)
    let { metadata, content } = readMDXFile(absPath)
    content = rewriteRelativeRefs(content, absPath, dir, '/blog-assets')
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
