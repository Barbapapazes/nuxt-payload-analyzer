import { Buffer } from 'node:buffer'
import type { InlinePayload, InlinePayloadKey } from './types'

/**
 * Server-rendered pages inline their payload in the HTML instead of
 * `_payload.json`: `<script type="application/json" id="__NUXT_DATA__">`.
 *
 * It is serialized with devalue: a flat array where objects and arrays point
 * at other entries by index, and entry 0 is the root (`{ data, state, pinia, … }`).
 * We don't revive the values, only follow the references to size each key.
 */

const NUXT_DATA_RE = /<script\b[^>]*\bid=["']__NUXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i

/** Sections whose keys are reported one by one. */
const GROUPS = new Set(['data', 'state', 'pinia'])

/** Built-in devalue types whose arguments are literals, not references. */
const LITERAL_TYPES = new Set(['Date', 'RegExp', 'BigInt', 'URL', 'URLSearchParams'])

/** Nuxt reducers that wrap exactly one value: ["Reactive", index]. */
const WRAPPERS = new Set(['Reactive', 'ShallowReactive', 'Ref', 'ShallowRef', 'EmptyRef', 'EmptyShallowRef', 'null'])

function isIndex(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0
}

export function extractInlinePayload(html: string): string | undefined {
  return html.match(NUXT_DATA_RE)?.[1]
}

function references(entry: unknown): number[] {
  if (Array.isArray(entry)) {
    if (typeof entry[0] === 'string') {
      const [type, ...args] = entry
      return LITERAL_TYPES.has(type) ? [] : args.filter(isIndex)
    }
    return entry.filter(isIndex)
  }
  if (entry !== null && typeof entry === 'object')
    return Object.values(entry).filter(isIndex)
  return []
}

function unwrap(payload: unknown[], index: number): number {
  const seen = new Set<number>()
  let current = index
  while (!seen.has(current)) {
    const entry = payload[current]
    if (!Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== 'string' || !WRAPPERS.has(entry[0]) || !isIndex(entry[1]))
      return current
    seen.add(current)
    current = entry[1]
  }
  return current
}

function objectAt(payload: unknown[], index: number): Record<string, number> | undefined {
  const entry = payload[unwrap(payload, index)]
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry))
    return undefined
  return entry as Record<string, number>
}

/**
 * Bytes of every entry reachable from `start`. Entries shared by several keys
 * (devalue stores repeats once) count towards each of them, so the keys can
 * add up to more than the payload itself.
 */
function reachableSize(payload: unknown[], start: number): number {
  const seen = new Set<number>()
  const stack = [start]
  let size = 0
  while (stack.length) {
    const index = stack.pop()!
    if (seen.has(index) || index >= payload.length)
      continue
    seen.add(index)
    // +1 for the comma that separates entries in the serialized array.
    size += Buffer.byteLength(JSON.stringify(payload[index] ?? null)) + 1
    stack.push(...references(payload[index]))
  }
  return size
}

export function getInlinePayload(raw: string): InlinePayload {
  const payload: unknown = JSON.parse(raw)
  if (!Array.isArray(payload))
    throw new Error('__NUXT_DATA__ is not a devalue array')

  const keys: InlinePayloadKey[] = []
  for (const [section, index] of Object.entries(objectAt(payload, 0) ?? {})) {
    const group = GROUPS.has(section) ? objectAt(payload, index) : undefined
    if (!group) {
      keys.push({ name: section, size: reachableSize(payload, index) })
      continue
    }
    for (const [key, child] of Object.entries(group)) {
      // `useState` keys are stored as `$s<key>`.
      const name = section === 'state' ? key.replace(/^\$s/, '') : key
      keys.push({ name: `${section}: ${name}`, size: reachableSize(payload, child) })
    }
  }

  keys.sort((a, b) => b.size - a.size)
  return { size: Buffer.byteLength(raw), keys }
}

export async function fetchInlinePayload(url: string): Promise<InlinePayload> {
  const response = await fetch(url, { headers: { accept: 'text/html' } })
  if (!response.ok)
    throw new Error(`${url} answered ${response.status} ${response.statusText}`)

  const raw = extractInlinePayload(await response.text())
  if (raw === undefined)
    throw new Error(`No __NUXT_DATA__ found on ${url}: it must be a server-rendered Nuxt 3+ page`)

  return getInlinePayload(raw)
}
