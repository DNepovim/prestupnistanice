type ImageUi = { previewSrc: string; validate?: undefined }

const CONTENT_IMAGES_URL = '/src/content/images/'

const previewSrc = (src: string) =>
  src.startsWith('../images/')
    ? `${CONTENT_IMAGES_URL}${src.slice('../images/'.length)}`
    : src

export const imageUi = { previewSrc } as unknown as ImageUi
