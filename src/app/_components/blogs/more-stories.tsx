import { type Post } from "@/interfaces/post";
import { PostPreview } from "@/app/_components/blogs/post-preview";

type Props = {
  posts: Post[];
};

export function MoreStories({ posts }: Props) {
  return (
    <section>
      <h2 className="font-heading mb-12 text-4xl md:text-5xl font-bold tracking-tight leading-tight text-neutral-800">
        More Articles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12 lg:gap-x-16 gap-y-16 md:gap-y-24 mb-32">
        {posts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
            slug={post.slug}
            excerpt={post.excerpt}
          />
        ))}
      </div>
    </section>
  );
} 