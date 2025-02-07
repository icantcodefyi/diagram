import { type Author } from "@/interfaces/author";
import Link from "next/link";
import Avatar from "./avatar";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  author: Author;
  slug: string;
};

export function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}: Props) {
  return (
    <div className="group">
      <div className="mb-5 rounded-xl overflow-hidden transition-transform duration-200 ease-in-out group-hover:scale-[1.02]">
        <CoverImage slug={slug} title={title} src={coverImage} />
      </div>
      <h3 className="font-heading text-2xl mb-3 leading-snug font-bold tracking-tight">
        <Link href={`/blog/${slug}`} className="hover:text-neutral-700 transition-colors">
          {title}
        </Link>
      </h3>
      <div className="text-sm mb-4 text-neutral-600">
        <DateFormatter dateString={date} />
      </div>
      <p className="text-base leading-relaxed mb-4 text-neutral-600 line-clamp-3">{excerpt}</p>
      <Avatar name={author.name} picture={author.picture} />
    </div>
  );
} 