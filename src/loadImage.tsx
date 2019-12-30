const Jimp = require('jimp-compact');
const util = require('util');
const exec = util.promisify(require('child_process').exec);


let currentImage = null

export const getPixelColor = (x:number, y: number) => {
  if (!currentImage) {
    console.log("image not loaded!")
    return
  }
  const hex = currentImage.getPixelColor(x,y)
  return Jimp.intToRGBA(hex);
}

export const loadImage = fileUrl => Jimp.read(fileUrl)
  .then((image: any) => {
    console.log(`load image with w:${image.bitmap.width} h:${image.bitmap.height}`)
    currentImage = image
    return currentImage
  })
  .catch(e => {
    console.warn("failed to load image", e)
  })

export const takeScreenshot = async (path) => {
  const {stdout} = await exec("screencapture " + path)
  return stdout
}