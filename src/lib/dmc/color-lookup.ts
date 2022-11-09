import { VPTree } from 'vantage-point-tree'
import { palette, codeToColor } from './palette'
import { ColorSpace, sRGB, OKLab, to as convert, parse } from 'colorjs.io/fn'

ColorSpace.register(sRGB)
ColorSpace.register(OKLab)

const items = palette.map(item => {
  const [code, hex] = item
  const srgb = parse('#' + hex)
  const oklab = convert(srgb, "oklab").coords
  return { code, hex, oklab, rgb: srgb.coords }
})

function distance(a: any, b: any) {
  const dl = a.oklab[0] - b.oklab[0]
  const da = a.oklab[1] - b.oklab[1]
  const db = a.oklab[2] - b.oklab[2]
  const distance = Math.sqrt((dl * dl) + (da * da) + (db * db))
  return distance
}

const tree = new VPTree(items, distance)

type Item = {
  id: { code: string, oklab: number[], rgb: number[] }
  dist: number
}

export function closestThread(code: string) {
  const color = codeToColor.get(code)
  return color ? closestColor(color, 7).filter((item: any) => item.code !== code) : []
}

export function closestColor(hex: string, n: number = 6) {
  const srgb = parse('#' + hex)
  const oklab = convert(srgb, "oklab").coords
  const closest = tree.find({ oklab, rgb: srgb.coords }, n)
  return closest.map((item: Item) => item.id)
}

export function threadColor(rgb: number[]) {
  return thread(rgb).rgb
}

export function thread(rgb: number[]) {
  const color = { space: sRGB, coords: rgb.map(x => x / 255) }
  const oklab = convert(color, "oklab").coords
  const closest: Item = tree.find({ oklab, rgb }, 1)
  return closest.id
}