import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
  return {
    data: 'Hello World!'.repeat(10_000),
  }
})
