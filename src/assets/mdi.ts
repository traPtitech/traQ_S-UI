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
  mdiPhone,
  mdiPin,
  mdiBell,
  mdiDotsHorizontal,
  mdiBook,
  mdiTwitter,
  mdiTagMultiple,
  mdiEmail,
  mdiTag,
  mdiPlus,
  mdiMagnify,
  mdiHistory,
  mdiDownload,
  mdiEmoticonOutline
} from '@mdi/js'

interface MdiIconsMapping {
  [name: string]: string
}

const mdi: MdiIconsMapping = {
  home: mdiHome,
  send: mdiSend,
  file: mdiFile,
  close: mdiClose,
  phone: mdiPhone,
  pin: mdiPin,
  bell: mdiBell,
  search: mdiMagnify,
  history: mdiHistory,
  'file-upload': mdiFileUpload,
  'file-music': mdiFileMusic,
  'file-video': mdiFileVideo,
  'file-image': mdiFileImage,
  'plus-circle-outline': mdiPlusCircleOutline,
  'dots-horizontal': mdiDotsHorizontal,
  book: mdiBook,
  twitter: mdiTwitter,
  tag: mdiTag,
  tags: mdiTagMultiple,
  email: mdiEmail,
  plus: mdiPlus,
  download: mdiDownload,
  'emoticon-outline': mdiEmoticonOutline
}

export default mdi
