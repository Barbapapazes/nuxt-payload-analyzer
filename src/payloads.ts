import fs from 'node:fs'
import type { Payload } from './types'

export const PAYLOAD_FILE = '_payload.json'
export const payloadSizeLevels = ['warning', 'error', 'all'] as const

export function mustThrowError(payloads: Payload[], errorSize: number) {
  let mustThrow = false

  for (const payload of payloads) {
    if (payload.size >= errorSize) {
      mustThrow = true
      break
    }
  }

  return mustThrow
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
