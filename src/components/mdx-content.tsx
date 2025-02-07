'use client'

import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote'
import { useMDXComponents } from '@/mdx-components'

interface MDXContentProps {
  source: MDXRemoteProps
}

export default function MDXContent({ source }: MDXContentProps) {
  const components = useMDXComponents({})

  return (
    <MDXRemote
      {...source}
      components={components}
    />
  )
} 