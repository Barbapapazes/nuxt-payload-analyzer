import process from 'node:process'
import { defineCommand, runMain } from 'citty'
import { resolve } from 'pathe'
import { consola } from 'consola'
import nuxtPayloadAnalyzer from '../../package.json' assert { type: 'json' }
import { buildTreeLog, createTree } from '../log'
import type { PayloadSizeLevel } from '../types'
import { getPayloads, mustThrowError, payloadSizeLevels } from '../payloads'
import { discoverPayloadsPaths } from './payloads'

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
    // TODO: use a number once available
    warningSize: {
      type: 'string',
      description: 'Warning size in bytes',
      default: (1024 * 50).toString(),
    },
    // TODO: use a number once available
    errorSize: {
      type: 'string',
      description: 'Error size in bytes',
      default: (1024 * 100).toString(),
    },
    failOnError: {
      type: 'boolean',
      description: 'Fail on error',
      default: false,
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
      warningSize: Number(args.warningSize),
      errorSize: Number(args.errorSize),
    })
    const logs = buildTreeLog(tree, {
      prefix: '',
      warningSize: Number(args.warningSize),
      errorSize: Number(args.errorSize),
    })

    consola.log(logs)

    if (args.failOnError && mustThrowError(payloads, Number(args.errorSize))) {
      consola.error('Payloads are too big. Please reduce the size of your payloads.')
      process.exit(1)
    }
  },
})

export { runMain, main }
