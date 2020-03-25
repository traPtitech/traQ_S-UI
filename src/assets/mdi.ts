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
  mdiBook,
  mdiTwitter,
  mdiTagMultiple,
  mdiEmail
} from '@mdi/js'

interface MdiIconsMapping {
  [name: string]: string
}

const mdi: MdiIconsMapping = {
  home: mdiHome,
  send: mdiSend,
  file: mdiFile,
  close: mdiClose,
  'file-upload': mdiFileUpload,
  'file-music': mdiFileMusic,
  'file-video': mdiFileVideo,
  'file-image': mdiFileImage,
  'plus-circle-outline': mdiPlusCircleOutline,
  book: mdiBook,
  twitter: mdiTwitter,
  tags: mdiTagMultiple,
  email: mdiEmail
}

export default mdi
