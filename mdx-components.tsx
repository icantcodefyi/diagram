import type { MDXComponents } from 'mdx/types'
import { cn } from '@/lib/utils'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ className, ...props }) => (
      <h1 
        className={cn(
          "text-4xl font-bold font-heading mb-6 mt-8 text-foreground",
          className
        )} 
        {...props} 
      />
    ),
    h2: ({ className, ...props }) => (
      <h2 
        className={cn(
          "text-3xl font-bold font-heading mb-4 mt-6 text-foreground",
          className
        )} 
        {...props} 
      />
    ),
    h3: ({ className, ...props }) => (
      <h3 
        className={cn(
          "text-2xl font-bold font-heading mb-3 mt-5 text-foreground",
          className
        )} 
        {...props} 
      />
    ),
    p: ({ className, ...props }) => (
      <p 
        className={cn(
          "mb-4 leading-relaxed text-muted-foreground",
          className
        )} 
        {...props} 
      />
    ),
    a: ({ className, ...props }) => (
      <a 
        className={cn(
          "text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
          className
        )} 
        {...props} 
      />
    ),
    ul: ({ className, ...props }) => (
      <ul 
        className={cn(
          "list-disc pl-6 mb-4 text-muted-foreground",
          className
        )} 
        {...props} 
      />
    ),
    ol: ({ className, ...props }) => (
      <ol 
        className={cn(
          "list-decimal pl-6 mb-4 text-muted-foreground",
          className
        )} 
        {...props} 
      />
    ),
    li: ({ className, ...props }) => (
      <li 
        className={cn(
          "mb-2",
          className
        )} 
        {...props} 
      />
    ),
    blockquote: ({ className, ...props }) => (
      <blockquote 
        className={cn(
          "border-l-4 border-primary pl-4 italic text-muted-foreground my-4",
          className
        )} 
        {...props} 
      />
    ),
    code: ({ className, ...props }) => (
      <code 
        className={cn(
          "bg-accent text-accent-foreground rounded px-2 py-1 text-sm font-mono",
          className
        )} 
        {...props} 
      />
    ),
    pre: ({ className, ...props }) => (
      <pre 
        className={cn(
          "bg-accent text-accent-foreground rounded-lg p-4 overflow-x-auto mb-4",
          className
        )} 
        {...props} 
      />
    ),
    img: ({ className, alt, ...props }) => (
      <img 
        className={cn(
          "rounded-lg my-4 w-full",
          className
        )} 
        alt={alt}
        {...props} 
      />
    ),
    hr: ({ className, ...props }) => (
      <hr 
        className={cn(
          "my-8 border-border",
          className
        )} 
        {...props} 
      />
    ),
    table: ({ className, ...props }) => (
      <div className="overflow-x-auto my-6">
        <table 
          className={cn(
            "w-full text-sm border-collapse",
            className
          )} 
          {...props} 
        />
      </div>
    ),
    th: ({ className, ...props }) => (
      <th 
        className={cn(
          "border border-border px-4 py-2 text-left font-bold bg-muted",
          className
        )} 
        {...props} 
      />
    ),
    td: ({ className, ...props }) => (
      <td 
        className={cn(
          "border border-border px-4 py-2 text-muted-foreground",
          className
        )} 
        {...props} 
      />
    ),
    ...components,
  }
} 