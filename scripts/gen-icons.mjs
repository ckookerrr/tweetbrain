// Generates icon-192.png and icon-512.png using Canvas API via node-canvas
// Run: node scripts/gen-icons.mjs
import { createCanvas } from "canvas"
import { writeFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dir = dirname(fileURLToPath(import.meta.url))

function makeIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext("2d")

  // Background
  ctx.fillStyle = "#7c3aed"
  roundRect(ctx, 0, 0, size, size, size * 0.22)
  ctx.fill()

  // Brain emoji-style: draw "TB" text
  ctx.fillStyle = "#ffffff"
  ctx.font = `bold ${size * 0.42}px sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("TB", size / 2, size / 2)

  return canvas.toBuffer("image/png")
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

const publicDir = resolve(__dir, "../public")
writeFileSync(resolve(publicDir, "icon-192.png"), makeIcon(192))
writeFileSync(resolve(publicDir, "icon-512.png"), makeIcon(512))
console.log("Icons generated!")
