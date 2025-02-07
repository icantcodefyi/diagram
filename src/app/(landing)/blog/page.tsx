import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import {
  MinimalCard,
  MinimalCardDescription,
  MinimalCardImage,
  MinimalCardTitle,
  MinimalCardContent,
  MinimalCardFooter,
} from "@/components/ui/minimal-card"

export const metadata = {
  title: 'Diagramify | Blogs',
  description: 'Read our latest articles and insights',
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="bg-gradient-to-b from-background via-secondary/20 via-70% pb-28">
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-heading">
            Latest Articles
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover insights, tutorials, and updates from our team
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug}>
              <MinimalCard className="h-full transition-colors hover:bg-muted/60">
                <MinimalCardImage 
                  src={post.image ?? '/blog-placeholder.jpg'} 
                  alt={post.title}
                  className="aspect-[16/9] object-cover"
                />
                <MinimalCardContent className="space-y-4">
                  <MinimalCardTitle className="font-heading">{post.title}</MinimalCardTitle>
                  <MinimalCardDescription className="text-muted-foreground">
                    {post.description}
                  </MinimalCardDescription>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{post.readingTime}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </MinimalCardContent>
                <MinimalCardFooter>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>By {post.author}</span>
                  </div>
                </MinimalCardFooter>
              </MinimalCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
