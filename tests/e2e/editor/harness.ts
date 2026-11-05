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
      setEcoMode: (enabled: boolean) => Promise<void>
      load: (draft: EditorDraft) => Promise<void>
    }
  }
}
