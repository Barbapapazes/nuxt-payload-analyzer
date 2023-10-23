import { defineCommand, runMain } from 'citty'
import { resolve } from 'pathe'
import { consola } from 'consola'
import nuxtPayloadAnalyzer from '../package.json' assert { type: 'json' }
import { discoverPayloadsPaths, getPayloads, payloadSizeLevels } from './payloads'
import { buildTreeLog, createTree } from './log'
import type { PayloadSizeLevel } from './types'

const main = defineCommand({
  meta: {
    name: nuxtPayloadAnalyzer.name,
    version: nuxtPayloadAnalyzer.version,
    description: nuxtPayloadAnalyzer.description,
  },
  args: {
    cwd: {
      type: 'string',
      description: 'Current working directory',
    },
    // TODO: use an enum once available
    payloadSizeLevel: {
      type: 'string',
      description: 'Payload size level to display',
      default: 'all',
    },
  },
  async run({ args }) {
    const payloadSizeLevel = args.payloadSizeLevel

    if (!payloadSizeLevels.includes(payloadSizeLevel as PayloadSizeLevel))
      throw new Error(`Invalid payload size level: ${payloadSizeLevel}, must be one of ${payloadSizeLevels.join(', ')}`)

    const cwd = resolve(args.cwd || '.')

    const outputDir = resolve(cwd, '.output')
    const outputPublicDir = resolve(outputDir, 'public')

    const payloadsPaths = discoverPayloadsPaths(outputPublicDir)

    const payloads = getPayloads(payloadsPaths)

    const tree = createTree(payloads, {
      cwd,
      payloadSizeLevel: payloadSizeLevel as PayloadSizeLevel,
      warningSize: 1024 * 50, // 50KB
      errorSize: 1024 * 100, // 100KB
    })
    const logs = buildTreeLog(tree, {
      prefix: '',
      warningSize: 1024 * 50, // 50KB
      errorSize: 1024 * 100, // 100KB
    })

    consola.log(logs)
  },
})

export { runMain, main }
