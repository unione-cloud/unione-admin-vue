/** 可在线预览类型 */
export const PREVIEW_TYPE = [
  'jpg',
  'jpeg',
  'gif',
  'mp4',
  'png',
  'pdf',
  'swf',
  'odt',
  'ott',
  'sxw',
  'doc',
  'docx',
  'rtf',
  'wpd',
  'txt',
  'ods',
  'ots',
  'sxc',
  'xls',
  'xlsx',
  'csv',
  'tsv',
  'odp',
  'otp',
  'sxi',
  'ppt',
  'pptx',
  'odg',
  'otg',
  'svg'
]

/** 图片后缀 */
export const IMAGE_SUFFIX = ['bmp', 'jpg', 'jpeg', 'png', 'gif']

/** 视频后缀 */
export const VIDEO_SUFFIX = [
  'avi',
  'rmvb',
  'rm',
  'asf',
  'divx',
  'mpg',
  'mpeg',
  'mpe',
  'wmv',
  'mp4',
  'mkv',
  'vob'
]

/** 文档后缀名 */
export const DOCUMENT_SUFFIX = [
  'pdf',
  'swf',
  'html',
  'odt',
  'ott',
  'sxw',
  'doc',
  'docx',
  'rtf',
  'wpd',
  'txt',
  'ods',
  'ots',
  'sxc',
  'xls',
  'xlsx',
  'csv',
  'tsv',
  'odp',
  'otp',
  'sxi',
  'ppt',
  'pptx',
  'odg',
  'otg',
  'svg',
  'css',
  'java',
  'js',
  'xml',
  'sql',
  'json',
  'html',
  'properties',
  'mD',
  'conf',
  'ini',
  'vue',
  'php',
  'py',
  'bat',
  'gitignore',
  'log',
  'htm',
  'cnf'
]

export const PDF_SUFFIX = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx']

/** 音频后缀 */
export const AUDIO_SUFFIX = ['mp3', 'ogg', 'wav', 'ape', 'cda', 'au', 'midi', 'mac', 'aac']

/** 文件类型后缀处理 */
export const FILE_SUFFIX = {
  0: undefined,
  1: IMAGE_SUFFIX,
  2: VIDEO_SUFFIX,
  3: DOCUMENT_SUFFIX,
  4: AUDIO_SUFFIX,
  5: undefined
}
