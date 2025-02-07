import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { serialize } from "next-mdx-remote/serialize";
import MDXContent from "@/components/mdx-content";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface Props {
  params: Params;
  searchParams: SearchParams;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(props: Props) {
  const params = await props.params;
  if (!params?.slug) {
    return {
      title: "Post Not Found | Diagramify",
      description: "The requested blog post could not be found.",
    };
  }

  try {
    const { meta } = await getPostBySlug(params.slug);
    return {
      title: `${meta.title} | Diagramify`,
      description: meta.description,
    };
  } catch {
    return {
      title: "Post Not Found | Diagramify",
      description: "The requested blog post could not be found.",
    };
  }
}

export default async function BlogPost(props: Props) {
  const params = await props.params;
  if (!params?.slug) {
    notFound();
  }

  try {
    const { meta, content } = await getPostBySlug(params.slug);
    const mdxSource = await serialize(content, {
      parseFrontmatter: false,
      mdxOptions: {
        development: process.env.NODE_ENV === "development",
      },
    });

    return (
      <article className="container mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="link" className="pl-0">
              <ArrowLeft className="h-4 w-4" />
              Back to Articles
            </Button>
          </Link>
        </div>
        <header className="mb-12 space-y-8">
          <h1 className="font-heading text-4xl font-bold leading-tight md:text-5xl">
            {meta.title}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{new Date(meta.date).toLocaleDateString()}</span>
            <span>•</span>
            <span>{meta.readingTime}</span>
            <span>•</span>
            <span>By {meta.author}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {meta.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>
        <div className="prose prose-lg dark:prose-invert prose-headings:font-heading prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-pre:bg-accent prose-pre:text-accent-foreground max-w-none">
          <MDXContent source={mdxSource} />
        </div>
      </article>
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error rendering blog post:", error.message);
    }
    notFound();
  }
}
