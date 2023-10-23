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
