import { getColor } from 'consola/utils'
import type { Payload, TreeItem, TreeLogOptions } from './types'
import { PAYLOAD_FILE } from './payloads'

export function createTree(payloads: Payload[], cwd: string): TreeItem[] {
  const tree: TreeItem[] = []
  for (const payload of payloads) {
    const path = payload.path.replace(cwd, '').split('/').filter(Boolean)
    let current = tree
    for (const name of path) {
      let child = current.find(item => item.name === name)
      if (!child) {
        child = { name, size: 0, children: [] }
        current.push(child)
      }
      child.size += payload.size
      current = child.children
    }
  }
  return tree
}

export function buildTreeLog(tree: TreeItem[], options: TreeLogOptions): string {
  let log: string = ''

  const total = tree.length - 1
  for (let i = 0; i <= total; i++) {
    const item = tree[i]
    const isLast = i === total
    const currentPrefix = isLast ? `${options.prefix}└─ ` : `${options.prefix}├─ `

    log += buildTreeItemLog(currentPrefix, item.name, item.size, { warningSize: options.warningSize, errorSize: options.errorSize })

    if (item.children.length) {
      const nestedPrefix = `${options.prefix}${isLast ? '  ' : '│  '}`
      log += buildTreeLog(item.children, {
        ...options,
        prefix: nestedPrefix,
      })
    }
  }

  return log
}

export function buildTreeItemLog(prefix: string, text: string, size: number, options: { warningSize: number; errorSize: number }): string {
  const payloadColor = getColor('blue')
  const warningColor = getColor('yellow')
  const errorColor = getColor('red')

  const isPayload = text === PAYLOAD_FILE
  if (isPayload && size >= options.errorSize)
    return `${prefix}${errorColor(text)} (${toHumanSize(size)}) [TOO BIG]\n`

  if (isPayload && size >= options.warningSize)
    return `${prefix}${warningColor(text)} (${toHumanSize(size)}) [BIG]\n`

  if (text === PAYLOAD_FILE)
    return `${prefix}${payloadColor(text)} (${toHumanSize(size)})\n`

  return `${prefix}${text}\n`
}

export function toHumanSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0)
    return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  if (i === 0)
    return `${bytes} ${sizes[i]}`
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`
}
