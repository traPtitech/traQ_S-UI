import { mdiHome, mdiSend, mdiFileUpload } from '@mdi/js'

interface MdiIconsMapping {
  [name: string]: string
}

const mdi: MdiIconsMapping = {
  home: mdiHome,
  send: mdiSend,
  fileUpload: mdiFileUpload
}

export default mdi
