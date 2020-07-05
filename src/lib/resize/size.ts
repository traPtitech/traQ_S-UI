const MAX_HEIGHT = 1600
const MAX_WIDTH = 2560

export interface Dimensions {
  width: number
  height: number
}

export const needResize = ({ width, height }: Readonly<Dimensions>) =>
  MAX_WIDTH < width || MAX_HEIGHT < height

export const getThumbnailDimensions = ({
  width,
  height
}: Readonly<Dimensions>): Dimensions => {
  const widthRatio = width / MAX_WIDTH
  const heightRatio = height / MAX_HEIGHT
  const ratio = Math.max(widthRatio, heightRatio)
  return { width: width / ratio, height: height / ratio }
}
