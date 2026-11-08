import { describe, expect, it } from 'vitest'
import { stringify } from 'devalue'
import { extractInlinePayload, getInlinePayload } from '../src/inline'

// Same reducers as Nuxt, so the payload has ["ShallowReactive", i] / ["Reactive", i] wrappers.
class Reactive { constructor(readonly value: unknown) {} }
class ShallowReactive { constructor(readonly value: unknown) {} }
function nuxtPayload(root: Record<string, unknown>): string {
  return stringify(new ShallowReactive(root), {
    Reactive: v => v instanceof Reactive && v.value,
    ShallowReactive: v => v instanceof ShallowReactive && v.value,
  })
}

describe('extractInlinePayload', () => {
  it('reads __NUXT_DATA__ whatever the attribute order', () => {
    expect(extractInlinePayload('<script id="__NUXT_DATA__" type="application/json">[1]</script>')).toBe('[1]')
    expect(extractInlinePayload('<html></html>')).toBeUndefined()
  })
})

describe('getInlinePayload', () => {
  it('breaks data, state and pinia down by key, largest first', () => {
    const raw = nuxtPayload({
      data: new Reactive({ page: { title: 'Hello' } }),
      state: new Reactive({ $sdictionary: Object.fromEntries(Array.from({ length: 300 }, (_, i) => [`key_${i}`, `text ${i}`])) }),
      pinia: { user: { name: 'Ann' } },
    })
    const { keys } = getInlinePayload(raw)
    expect(keys[0].name).toBe('state: dictionary')
    expect(keys.map(key => key.name)).toEqual(expect.arrayContaining(['data: page', 'pinia: user']))
  })

  it('counts characters devalue escapes for <script> as they are written', () => {
    // devalue writes every `<` as `\\u003C`: 6 bytes, not 1. Same text with and
    // without `<`: the key must grow exactly as much as the payload does.
    const measure = (text: string) => {
      const raw = nuxtPayload({ data: { html: text } })
      return { raw, ...getInlinePayload(raw) }
    }
    const withTags = measure('<p>bold</p>'.repeat(200))
    const plain = measure('[p]bold[/p]'.repeat(200))
    const keySize = (payload: typeof plain) => payload.keys.find(key => key.name === 'data: html')!.size

    expect(withTags.raw).toContain('\\u003C')
    expect(keySize(withTags) - keySize(plain)).toBe(withTags.size - plain.size)
  })

  it('handles a very large array without exceeding the argument limit', () => {
    const raw = nuxtPayload({ data: { big: Array.from({ length: 200_000 }, (_, i) => i) } })
    expect(() => getInlinePayload(raw)).not.toThrow()
  })
})
