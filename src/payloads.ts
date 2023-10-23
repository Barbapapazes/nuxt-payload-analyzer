import fs from 'node:fs'
import { resolve } from 'pathe'
import type { Payload } from './types'

export const PAYLOAD_FILE = '_payload.json'

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

export function getPayloads(payloadsPaths: string[]): Payload[] {
  const payloads: Payload[] = []

  payloadsPaths.forEach((payloadPath) => {
    const payload = getPayload(payloadPath)
    payloads.push(payload)
  })

  return payloads
}

export function getPayload(payloadPath: string): Payload {
  const size = getPayloadSize(payloadPath)

  return {
    path: payloadPath,
    size,
  }
}

export function getPayloadSize(payloadPath: string): number {
  const size = fs.statSync(payloadPath).size

  return size
}
