import { defineCommand, runMain } from 'citty'
import { resolve } from 'pathe'
import { consola } from 'consola'
import nuxtPayloadAnalyzer from '../package.json' assert { type: 'json' }
import { discoverPayloadsPaths, getPayloads } from './payloads'
import { buildTreeLog, createTree } from './log'

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
  },
  async run({ args }) {
    const cwd = resolve(args.cwd || '.')

    const outputDir = resolve(cwd, '.output')
    const outputPublicDir = resolve(outputDir, 'public')

    const payloadsPaths = discoverPayloadsPaths(outputPublicDir)

    const payloads = getPayloads(payloadsPaths)

    const tree = createTree(payloads, cwd)
    const logs = buildTreeLog(tree, {
      prefix: '',
      warningSize: 1024 * 50, // 50KB
      errorSize: 1024 * 100, // 100KB
    })

    consola.log(logs)
  },
})

export { runMain, main }
