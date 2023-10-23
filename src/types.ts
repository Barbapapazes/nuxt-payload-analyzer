export interface Payload {
  path: string
  size: number
}

export interface TreeItem {
  name: string
  size: number
  children: TreeItem[]
}

export interface TreeLogOptions {
  prefix: string
  warningSize: number
  errorSize: number
}
