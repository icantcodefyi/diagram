import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import { CMS_NAME } from "@/lib/constants";
import markdownToHtml from "@/lib/markdownToHtml";
import Container from "@/app/_components/blogs/container";
import Header from "@/app/_components/blogs/header";
import { PostBody } from "@/app/_components/blogs/post-body";
import { PostHeader } from "@/app/_components/blogs/post-header";
import { CtaButton } from "@/components/landing/cta-button";

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function Post(props: Params) {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  try {
    const content = await markdownToHtml(post.content || "");

    return (
      <main>
        <Container>
          <Header />
          <article className="mb-32">
            <PostHeader
              title={post.title}
              coverImage={post.coverImage}
              date={post.date}
              author={post.author}
            />
            <PostBody content={content} />
          </article>
        </Container>
        <div className="flex justify-center">
          <CtaButton
            text="Try AutoDiagram for Free"
            href="/"
          />
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error rendering blog post:', error);
    return notFound();
  }
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const title = `${post.title} | ${CMS_NAME}`;

  return {
    title,
    openGraph: {
      title,
      images: [post.ogImage.url],
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
