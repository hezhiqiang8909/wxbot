import { CanvasRenderingContext2D, createCanvas, loadImage } from 'canvas'
import fs from 'fs'

const TIANGOU_F_PATH = 'static/tgrj2.jpg'
const TIANGOU_M_PATH = 'static/tgrj.jpg'

function findBreakPoint (text: string, width: number, ctx: CanvasRenderingContext2D) {
  let min = 0
  let max = text.length - 1
  while (min <= max) {
    const middle = Math.floor((min + max) / 2)
    const middleWidth = ctx.measureText(text.substr(0, middle)).width
    const oneCharWiderThanMiddleWidth = ctx.measureText(text.substr(0, middle + 1)).width
    if (middleWidth <= width && oneCharWiderThanMiddleWidth > width) {
      return middle
    }
    if (middleWidth < width) {
      min = middle + 1
    } else {
      max = middle - 1
    }
  }
  return -1
}

function breakLinesForCanvas (text: string, width: number, font: string) {
  const canvas = createCanvas(400, 2000)
  const ctx = canvas.getContext('2d')
  const result: string[] = []
  let breakPoint = 0
  if (font) {
    ctx.font = font
  }
  while ((breakPoint = findBreakPoint(text, width, ctx)) !== -1) {
    result.push(text.substr(0, breakPoint))
    text = text.substr(breakPoint)
  }
  if (text) {
    result.push(text)
  }
  ctx.clearRect(0, 0, 400, 2000)
  return result
}

export async function getTGImage (text: string, force?: boolean) {
  const day = new Date().getDate()
  const month = new Date().getMonth() + 1
  const filePath = `tmp/tgrj-${month}-${day}.png`
  if (!fs.existsSync(filePath) || force) {
    const result: string[] = [
      `${month}月${day}日 晴`,
      ...breakLinesForCanvas(text, 400 - 20 * 2, 'bold 22px "Microsoft YaHei"')
    ]
    const image = await loadImage(day % 2 ? TIANGOU_F_PATH : TIANGOU_M_PATH)
    const height = 350 + result.length * 30
    const canvas = createCanvas(400, height)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 400, height)
    ctx.fillStyle = '#000000'
    ctx.drawImage(image, 0, 0, 400, 600)
    ctx.font = 'bold 22px "Microsoft YaHei"'
    result.forEach((line, index) => {
      ctx.fillText(line, 20, (index ? 350 : 320) + (30 * index))
    })
    fs.writeFileSync(filePath, canvas.toBuffer())
  }
  return {
    filePath,
    unlinkSync () {
      fs.unlinkSync(filePath)
    }
  }
}

// (async function () {
//   const tg = await getTGImage('嗯，就算这些都是真的，我也依然爱你，因为，我很开心，今天，你愿意和我连麦了。')
//   setTimeout(tg.unlinkSync, 3000)
// })()