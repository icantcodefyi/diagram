export interface BlogPost {
  slug: string
  title: string
  date: string
  description: string
  author: string
  readingTime: string
  tags: string[]
  image?: string
}

export interface BlogMeta {
  title: string
  description: string
  date: string
  author: string
  readingTime: string
  tags: string[]
} 