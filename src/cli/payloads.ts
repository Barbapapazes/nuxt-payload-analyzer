import fs from 'node:fs'
import { resolve } from 'pathe'
import { PAYLOAD_FILE } from '../payloads'

export function discoverPayloadsPaths(source: string): string[] {
  const payloads: string[] = []

  const files = fs.readdirSync(source)

  files.forEach((file) => {
    const filePath = resolve(source, file)
    const fileStat = fs.lstatSync(filePath)

    const isFile = fileStat.isFile()
    if (isFile && file === PAYLOAD_FILE) {
      payloads.push(filePath)
      return
    }

    const isDirectory = fileStat.isDirectory()
    if (isDirectory) {
      const nestedPayloads = discoverPayloadsPaths(filePath)
      payloads.push(...nestedPayloads)
    }
  })

  return payloads
}
