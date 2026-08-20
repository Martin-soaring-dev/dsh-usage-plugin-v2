import fs from 'node:fs'

function replaceOnce(text, from, to, label) {
  const i = text.indexOf(from)
  if (i < 0) throw new Error(`missing patch target: ${label}`)
  if (text.indexOf(from, i + from.length) >= 0) throw new Error(`non-unique patch target: ${label}`)
  return text.slice(0, i) + to + text.slice(i + from.length)
}

const pkgPath = 'package.json'
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
pkg.version = '1.13.5'
p