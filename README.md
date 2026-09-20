# ZeroFFa Homepage

A personal homepage with a blog, written from scratch based on the
[portfolio-blog-starter](https://github.com/vercel/examples/tree/main/solutions/blog)
template. It keeps the template's feature set:

- Next.js 16 (App Router, Turbopack) with `output: "export"` — the whole site
  builds to plain static files
- MDX blog posts stored as plain files under `posts/blog`, no CMS involved
- Post assets colocated with each post, copied to `public/blog-assets` at
  build time
- A Notes section classified entirely by folder structure under `posts/notes`
- SEO out of the box: sitemap, robots and JSON-LD schema
- RSS feed
- Static Open Graph image
- Syntax highlighting via sugar-high
- Tailwind CSS v4
- Music toggle in the nav, playing from a local playlist
- Self-hosted fonts: Lora (Latin) and Noto Serif SC (Chinese serif, sliced
  variable font)
- Vercel Analytics / Speed Insights
