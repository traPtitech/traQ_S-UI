import { loadRuntime, presets } from '@traq-flavored-markdown/sdk/browser'

const runtime = await loadRuntime()
export const markdownParser = runtime.createParser(presets.traq.v1)
