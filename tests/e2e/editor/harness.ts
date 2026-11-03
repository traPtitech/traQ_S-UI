export interface EditorDraft {
  text: string
  markdown: boolean
  mode?: 'message' | 'search'
  readonly?: boolean
}

declare global {
  interface Window {
    editorHarness: {
      ready: Promise<void>
      load: (draft: EditorDraft) => Promise<void>
    }
  }
}
