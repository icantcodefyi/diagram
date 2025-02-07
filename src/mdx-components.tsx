import type { MDXComponents } from 'mdx/types'
import React from 'react'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return React.useMemo(
    () => ({
      h1: ({ children }) => <h1 className="text-4xl font-bold mb-6 mt-8">{children}</h1>,
      h2: ({ children }) => <h2 className="text-3xl font-bold mb-4 mt-6">{children}</h2>,
      h3: ({ children }) => <h3 className="text-2xl font-bold mb-3 mt-5">{children}</h3>,
      p: ({ children }) => <p className="mb-4 leading-relaxed text-gray-700">{children}</p>,
      ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
      li: ({ children }) => <li className="mb-2">{children}</li>,
      code: ({ children }) => (
        <code className="bg-gray-100 rounded px-2 py-1 text-sm">{children}</code>
      ),
      pre: ({ children }) => (
        <pre className="bg-gray-100 rounded p-4 overflow-x-auto mb-4">{children}</pre>
      ),
      ...components,
    }),
    [components]
  )
} 