import fs from 'node:fs'
import path from 'node:path'

// posts/blog/<slug>/ -> public/blog-assets/<slug>/
// posts/notes/**（除 .mdx）-> public/notes-assets/**（保留相对路径）
// (static export can only serve files under public/ or _next/static)
const blogSrc = path.join(process.cwd(), 'posts', 'blog')
const blogDest = path.join(process.cwd(), 'public', 'blog-assets')

fs.rmSync(blogDest, { recursive: true, force: true })
for (const entry of fs.readdirSync(blogSrc, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    fs.cpSync(path.join(blogSrc, entry.name), path.join(blogDest, entry.name), {
        recursive: true,
    })
    console.log(`copied post assets: ${entry.name}`)
}

const notesSrc = path.join(process.cwd(), 'posts', 'notes')
const notesDest = path.join(process.cwd(), 'public', 'notes-assets')

fs.rmSync(notesDest, { recursive: true, force: true })
if (fs.existsSync(notesSrc)) {
    fs.mkdirSync(notesDest, { recursive: true })
    mirrorTree(notesSrc, notesDest)
    console.log('copied notes assets')
}

function mirrorTree(src, dest) {
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name)
        const destPath = path.join(dest, entry.name)
        if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true })
            mirrorTree(srcPath, destPath)
        } else if (
            !entry.name.endsWith('.md') &&
            !entry.name.endsWith('.mdx') &&
            !entry.name.startsWith('.') &&
            entry.name !== 'order.json'
        ) {
            fs.copyFileSync(srcPath, destPath)
        }
    }
}
