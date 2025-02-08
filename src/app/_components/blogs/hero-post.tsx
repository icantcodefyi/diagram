import Avatar from "@/app/_components/blogs/avatar";
import CoverImage from "@/app/_components/blogs/cover-image";
import { type Author } from "@/interfaces/author";
import Link from "next/link";
import DateFormatter from "./date-formatter";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  author: Author;
  slug: string;
};

export function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}: Props) {
  return (
    <section className="relative pb-20">
      <div className="mb-8 md:mb-16 rounded-2xl overflow-hidden">
        <CoverImage title={title} src={coverImage} slug={slug} />
      </div>
      <div className="md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28">
        <div>
          <h3 className="font-heading mb-4 text-4xl lg:text-5xl font-bold tracking-tight leading-tight hover:text-neutral-700 transition-colors">
            <Link href={`/blog/${slug}`}>
              {title}
            </Link>
          </h3>
          <div className="mb-4 md:mb-0 text-neutral-600">
            <DateFormatter dateString={date} />
          </div>
        </div>
        <div>
          <p className="text-lg leading-relaxed mb-4 text-neutral-600">{excerpt}</p>
          <Avatar name={author.name} picture={author.picture} />
        </div>
      </div>
    </section>
  );
} 