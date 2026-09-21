import fs from 'fs'
import path from 'path'
import { parseFrontmatter, rewriteRelativeRefs } from 'app/blog/utils'

// Notes 目录结构（文件夹即分类，全部自动计算）：
//   posts/notes/<分类>/<slug>.mdx           ← 无小分组，直接平铺
//   posts/notes/<分类>/<小标题>/<slug>.mdx  ← 二级文件夹 = 索引页加粗小标题
// 附件与 mdx 同目录放置，构建时镜像到 public/notes-assets/。
// URL: /notes/<slug>，slug 全局唯一。
// 渲染顺序：posts/notes/order.json 的 sections / groups 指定优先级（数字越大越靠前，
// 未指定默认 -1），同级按字母序。块内文章按 date 正序（新的在下面）。

const NOTES_ROOT = path.join(process.cwd(), 'posts', 'notes')
const ORDER_FILE = path.join(NOTES_ROOT, 'order.json')

export type NoteListItem = {
    slug: string
    section: string
    group?: string
    title: string
    date?: string
    acceptedBy?: string
    content: string
}

export type NoteGroup = { name: string; notes: NoteListItem[] }
export type NoteSection = {
    name: string
    title: string
    flat: NoteListItem[]
    groups: NoteGroup[]
}

type SectionSort = 'date-asc' | 'date-desc'

type OrderConfig = {
    sections?: Record<string, number | { priority?: number; sort?: SectionSort }>
    groups?: Record<string, number>
}

function sectionConfig(
    order: OrderConfig,
    name: string,
): { priority: number; sort: SectionSort } {
    const value = order.sections?.[name]
    if (typeof value === 'number') return { priority: value, sort: 'date-asc' }
    if (value && typeof value === 'object')
        return { priority: value.priority ?? -1, sort: value.sort ?? 'date-asc' }
    return { priority: -1, sort: 'date-asc' }
}

function getOrderConfig(): OrderConfig {
    try {
        const parsed = JSON.parse(fs.readFileSync(ORDER_FILE, 'utf-8'))
        return { sections: parsed.sections ?? {}, groups: parsed.groups ?? {} }
    } catch {
        return {}
    }
}

export function getSectionTitle(dir: string) {
    return dir.charAt(0).toUpperCase() + dir.slice(1)
}

function sortEntries(notes: NoteListItem[], mode: SectionSort = 'date-asc') {
    return [...notes].sort((a, b) => {
        const dateCmp =
            mode === 'date-desc'
                ? (b.date ?? '').localeCompare(a.date ?? '')
                : (a.date ?? '').localeCompare(b.date ?? '')
        return dateCmp || a.title.localeCompare(b.title)
    })
}

// 递归收集全部笔记；segs 为相对 NOTES_ROOT 的文件夹层级
function collectInto(
    sections: Map<
        string,
        {
            flat: NoteListItem[]
            groups: Map<string, NoteListItem[]>
        }
    >,
    dir: string,
    segs: string[],
    order: OrderConfig,
    seenSlugs: Map<string, string>,
) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            collectInto(sections, full, [...segs, entry.name], order, seenSlugs)
        } else if (
            (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) &&
            segs.length > 0
        ) {
            const slug = path.basename(
                entry.name,
                path.extname(entry.name),
            )
            if (seenSlugs.has(slug)) {
                console.warn(
                    `[notes] duplicate slug "${slug}" (${entry.name}, first seen at ${seenSlugs.get(slug)}) skipped`,
                )
                continue
            }
            seenSlugs.set(slug, entry.name)
            const { metadata, content } = parseFrontmatter(fs.readFileSync(full, 'utf-8'))
            const meta = metadata as Record<string, string | undefined>
            const rewritten = rewriteRelativeRefs(content, full, NOTES_ROOT, '/notes-assets')
            const section = segs[0]
            const group = segs[1]
            if (!sections.has(section)) {
                sections.set(section, { flat: [], groups: new Map() })
            }
            const sectionData = sections.get(section)!
            const note: NoteListItem = {
                slug,
                section,
                group,
                title: meta.title ?? slug,
                date: meta.date ?? meta.publishedAt,
                acceptedBy: meta.acceptedBy,
                content: rewritten,
            }
            if (group) {
                if (!sectionData.groups.has(group)) {
                    sectionData.groups.set(group, [])
                }
                sectionData.groups.get(group)!.push(note)
            } else {
                sectionData.flat.push(note)
            }
        }
    }
}

export function getNotesStructure(): NoteSection[] {
    const order = getOrderConfig()
    const raw = new Map<
        string,
        { flat: NoteListItem[]; groups: Map<string, NoteListItem[]> }
    >()
    const seenSlugs = new Map<string, string>()
    if (fs.existsSync(NOTES_ROOT)) {
        collectInto(raw, NOTES_ROOT, [], order, seenSlugs)
    }

    const result: NoteSection[] = []
    for (const [name, data] of Array.from(raw.entries())) {
        const config = sectionConfig(order, name)
        const sortedGroups = Array.from(data.groups.entries())
            .map(([groupName, notes]) => ({
                name: groupName,
                priority: order.groups?.[`${name}/${groupName}`] ?? -1,
                notes: sortEntries(notes, config.sort),
            }))
            .sort(
                (a, b) =>
                    b.priority - a.priority || a.name.localeCompare(b.name),
            )
        result.push({
            name,
            title: getSectionTitle(name),
            flat: sortEntries(data.flat, config.sort),
            groups: sortedGroups.map(({ name: gName, notes: gNotes }) => ({
                name: gName,
                notes: gNotes,
            })),
        })
    }
    result.sort(
        (a, b) =>
            sectionConfig(order, b.name).priority -
                sectionConfig(order, a.name).priority ||
            a.title.localeCompare(b.title),
    )
    return result
}

export function getNoteList(): NoteListItem[] {
    return getNotesStructure().flatMap((s) => [
        ...s.flat,
        ...s.groups.flatMap((g) => g.notes),
    ])
}

// 单篇笔记：返回 null 时页面走 notFound
export function getNote(slug: string) {
    const note = getNoteList().find((n) => n.slug === slug)
    if (!note) return null
    return {
        metadata: { title: note.title, date: note.date },
        content: note.content,
    }
}
