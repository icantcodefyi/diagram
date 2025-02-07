import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { type BlogPost, type BlogMeta } from '@/types/blog'

const POSTS_PATH = path.join(process.cwd(), 'content/blog')

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = fs.readdirSync(POSTS_PATH)
    .filter((path) => /\.mdx?$/.test(path))
    .map((fileName) => {
      const source = fs.readFileSync(path.join(POSTS_PATH, fileName), 'utf8')
      const slug = fileName.replace(/\.mdx?$/, '')
      const { data } = matter(source)

      return {
        slug,
        ...(data as BlogMeta),
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return posts
}

export async function getPostBySlug(slug: string): Promise<{ meta: BlogMeta; content: string }> {
  const postPath = path.join(POSTS_PATH, `${slug}.mdx`)
  const source = fs.readFileSync(postPath, 'utf8')
  const { data, content } = matter(source)

  return {
    meta: data as BlogMeta,
    content,
  }
} 