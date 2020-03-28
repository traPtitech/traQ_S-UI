import {
  mdiHome,
  mdiSend,
  mdiFileUpload,
  mdiFile,
  mdiFileMusic,
  mdiFileVideo,
  mdiFileImage,
  mdiClose,
  mdiPlusCircleOutline,
  mdiEmoticonOutline,
  mdiMagnify
} from '@mdi/js'

interface MdiIconsMapping {
  [name: string]: string
}

const mdi: MdiIconsMapping = {
  home: mdiHome,
  send: mdiSend,
  file: mdiFile,
  close: mdiClose,
  search: mdiMagnify,
  'file-upload': mdiFileUpload,
  'file-music': mdiFileMusic,
  'file-video': mdiFileVideo,
  'file-image': mdiFileImage,
  'plus-circle-outline': mdiPlusCircleOutline,
  'emoticon-outline': mdiEmoticonOutline
}

export default mdi
