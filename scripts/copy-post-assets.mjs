import fs from 'node:fs'
import path from 'node:path'

// Colocated post assets: posts/blog/<slug>/ -> public/blog-assets/<slug>/
// (static export can only serve files under public/ or _next/static)
const postsDir = path.join(process.cwd(), 'posts', 'blog')
const destDir = path.join(process.cwd(), 'public', 'blog-assets')

fs.rmSync(destDir, { recursive: true, force: true })

for (const entry of fs.readdirSync(postsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    fs.cpSync(path.join(postsDir, entry.name), path.join(destDir, entry.name), {
        recursive: true,
    })
    console.log(`copied post assets: ${entry.name}`)
}
