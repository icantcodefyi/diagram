import { type Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "content");

export function getPostSlugs() {
  try {
    return fs.readdirSync(postsDirectory);
  } catch (error) {
    console.error('Error reading posts directory:', error);
    return [];
  }
}

export function getPostBySlug(slug: string) {
  try {
    const realSlug = slug.replace(/\.md$/, "");
    const fullPath = join(postsDirectory, `${realSlug}.md`);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    if (!data || !content) {
      console.error('Invalid post data for slug:', slug);
      return null;
    }

    return { ...data, slug: realSlug, content } as Post;
  } catch (error) {
    console.error('Error reading post file:', error);
    return null;
  }
}

export function getAllPosts(): Post[] {
  try {
    const slugs = getPostSlugs();
    const posts = slugs
      .map((slug) => getPostBySlug(slug))
      .filter((post): post is Post => post !== null) // Type guard to filter out null values
      .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
    return posts;
  } catch (error) {
    console.error('Error getting all posts:', error);
    return [];
  }
} 