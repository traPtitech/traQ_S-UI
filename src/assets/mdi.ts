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
  mdiEmail,
  mdiTag,
  mdiPlus
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
  tag: mdiTag,
  tags: mdiTagMultiple,
  email: mdiEmail,
  plus: mdiPlus
}

export default mdi
