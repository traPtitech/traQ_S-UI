export type SourceRange = Readonly<{ from: number; to: number }>

export type MarkdownEnvironment = {
  references?: Record<string, { href: string; title: string }>
}
