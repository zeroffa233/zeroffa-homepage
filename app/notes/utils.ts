import fs from 'fs'
import path from 'path'
import { parseFrontmatter } from 'app/blog/utils'

// Notes 目录结构（文件夹即分类，全部自动计算）：
//   posts/notes/<分类>/<slug>.mdx           ← 无小分组，直接平铺
//   posts/notes/<分类>/<小标题>/<slug>.mdx  ← 二级文件夹 = 索引页加粗小标题
// 附件与 mdx 同目录放置，构建时镜像到 public/notes-assets/。
// URL: /notes/<slug>，slug 全局唯一。

const NOTES_ROOT = path.join(process.cwd(), 'posts', 'notes')
const SECTION_ORDER = ['papers', 'books', 'projects', 'misc']

export type NoteListItem = {
    slug: string
    section: string // 一级文件夹名（原样）
    group?: string // 二级文件夹名
    title: string
    summary?: string
    date?: string
}

export function getSectionTitle(dir: string) {
    return dir.charAt(0).toUpperCase() + dir.slice(1)
}

// 分区 = posts/notes 下的一级文件夹；预设顺序优先，其余按字母序
export function getSections(): { name: string; title: string }[] {
    if (!fs.existsSync(NOTES_ROOT)) return []
    const dirs = fs
        .readdirSync(NOTES_ROOT, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
    const preset = SECTION_ORDER.filter((d) => dirs.includes(d))
    const rest = dirs.filter((d) => !SECTION_ORDER.includes(d)).sort()
    return [...preset, ...rest].map((name) => ({ name, title: getSectionTitle(name) }))
}

function collect(list: NoteListItem[], dir: string, segs: string[]) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            collect(list, full, [...segs, entry.name])
        } else if (entry.name.endsWith('.mdx')) {
            const slug = path.basename(entry.name, '.mdx')
            if (list.some((n) => n.slug === slug)) {
                console.warn(`[notes] duplicate slug "${slug}" (${entry.name}) skipped`)
                continue
            }
            const { metadata } = parseFrontmatter(fs.readFileSync(full, 'utf-8'))
            const meta = metadata as Record<string, string | undefined>
            list.push({
                slug,
                section: segs[0],
                group: segs[1],
                title: meta.title ?? slug,
                summary: meta.summary,
                date: meta.date,
            })
        }
    }
}

// 索引页数据：递归收集全部笔记元信息
export function getNoteList(): NoteListItem[] {
    const list: NoteListItem[] = []
    if (fs.existsSync(NOTES_ROOT)) collect(list, NOTES_ROOT, [])
    return list
}

// 单篇笔记：返回 null 时页面走 notFound
export function getNote(slug: string) {
    const note = getNoteList().find((n) => n.slug === slug)
    if (!note) return null
    const rel = [note.section, note.group, `${slug}.mdx`].filter(Boolean).join('/')
    const { metadata, content } = parseFrontmatter(
        fs.readFileSync(path.join(NOTES_ROOT, rel), 'utf-8'),
    )
    return { metadata: metadata as Record<string, string | undefined>, content }
}
