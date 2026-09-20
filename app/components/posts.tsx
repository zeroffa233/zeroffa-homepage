import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'

export function BlogPosts() {
  let allBlogs = getBlogPosts()

  return (
    <div>
      {allBlogs
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1
          }
          return 1
        })
        .map((post) => (
          <Link
            key={post.slug}
            className="flex flex-col space-y-1 mb-4"
            href={`/blog/${post.slug}`}
          >
            <div className="w-full flex flex-row items-baseline space-x-2">
              <p className="text-neutral-600 dark:text-neutral-400 shrink-0 tabular-nums text-lg">
                {formatDate(post.metadata.publishedAt)}
              </p>
              <p className="text-neutral-900 dark:text-neutral-100 tracking-tight text-lg whitespace-nowrap overflow-hidden text-ellipsis">
                {post.metadata.title}
              </p>
            </div>
          </Link>
        ))}
    </div>
  )
}
