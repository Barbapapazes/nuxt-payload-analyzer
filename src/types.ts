import type { payloadSizeLevels } from './payloads'

export interface Payload {
  path: string
  size: number
}

export interface TreeItem {
  name: string
  size: number
  children: TreeItem[]
}

export type PayloadSizeLevel = typeof payloadSizeLevels[number]

export interface CreateTreeOptions {
  cwd: string
  payloadSizeLevel: PayloadSizeLevel
  warningSize: number
  errorSize: number
}

export interface TreeLogOptions {
  prefix: string
  warningSize: number
  errorSize: number
}

export interface InlinePayloadKey {
  /** `data: <key>`, `state: <key>`, `pinia: <store>` or a top-level entry like `_errors`. */
  name: string
  size: number
}

export interface InlinePayload {
  size: number
  /** Largest first. */
  keys: InlinePayloadKey[]
}
