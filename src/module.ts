import process from 'node:process'
import { defineNuxtModule } from '@nuxt/kit'
import { resolve } from 'pathe'
import { getPayloads, mustThrowError } from './payloads'
import { buildTreeLog, createTree } from './log'
import type { PayloadSizeLevel } from './types'

// Module options TypeScript interface definition
export interface ModuleOptions {
  payloadSizeLevel: PayloadSizeLevel
  warningSize: number
  errorSize: number
  failOnError: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-payload-analyzer',
    configKey: 'payloadAnalyzer',
  },
  defaults: {
    payloadSizeLevel: 'all',
    warningSize: 1024 * 50, // 50KB
    errorSize: 1024 * 100, // 100KB
    failOnError: false,
  },
  setup(options, nuxt) {
    const payloadsPaths: string[] = []

    nuxt.hooks.hook('nitro:init', async (nitro) => {
      const cwd = nitro.options.output.publicDir
      nitro.hooks.hook('prerender:generate', async (ctx) => {
        if (ctx.fileName?.endsWith('_payload.json')) {
          const relativeFileName = `.${ctx.fileName}`
          payloadsPaths.push(resolve(cwd, relativeFileName))
        }
      })

      nitro.hooks.hook('close', () => {
        nitro.logger.info('Nuxt Payload Analyzer')

        const payloads = getPayloads(payloadsPaths)

        const tree = createTree(payloads, {
          cwd,
          payloadSizeLevel: options.payloadSizeLevel,
          warningSize: options.warningSize,
          errorSize: options.errorSize,
        })
        const logs = buildTreeLog(tree, {
          prefix: '  ',
          warningSize: options.warningSize,
          errorSize: options.errorSize,
        })

        nitro.logger.log(logs)

        if (options.failOnError && mustThrowError(payloads, options.errorSize)) {
          nitro.logger.error('Payloads are too big. Please reduce the size of your payloads.')
          process.exit(1)
        }

        nitro.logger.success('Payloads analyzed')
      })
    })
  },
})
