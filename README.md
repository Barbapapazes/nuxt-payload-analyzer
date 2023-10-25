# Nuxt Payload Analyzer

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A Nuxt module used to analyze [payload](https://nuxt.com/docs/api/nuxt-config#payloadextraction) size in your Nuxt application.

When you generate a Nuxt application, payloads from `useFetch` and `useAsyncData` are extracted into JSON files that are fetched at runtime. If you forget to filter the output of these functions, you could generate an enormous payload that will slow down your application. For example, if you use [Nuxt Content](https://content.nuxt.com) to generate a list of articles, you could forget to remove the body of the articles, which is not used, from the output. You can easily get a payload of more than 150kB.

This module will help you to detect these mistakes.

## Features

- Analyze size of payloads in your Nuxt application during build time
- Reject a build if a payload is too big
- Use CLI to analyze payloads locally
- Print a report of payloads in your Nuxt application

## Usage

You can use this module in two ways:

- As a Nuxt module
- As a CLI

### Nuxt module

Install the module

```bash
npm install nuxt-payload-analyzer
```

Add the module to your `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  modules: [
    'nuxt-payload-analyzer'
  ]
})
```

_You're good to go!_ The module will analyze your payloads after build time and print a report. Try to generate your application and you should see something like this:

```bash
ℹ Nuxt Payload Analyzer
  ├─ about
  │  └─ _payload.json (117.3 KB) [TOO BIG]
  └─ _payload.json (62 B)
✔ Payloads analyzed
```

### CLI

Simply use npx

```bash
npx nuxt-payload-analyzer@latest
```

_That's it._ The CLI will print you a report similar to the one above.

You can specify the directory of your Nuxt application with the `--cwd` option.

```bash
npx nuxt-payload-analyzer@latest --cwd ./my-nuxt-app
```

### Options

The following options are similar for the Nuxt module and the CLI. For the module, you must use the `payloadAnalyzer` key in your `nuxt.config.ts`.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `payloadSizeLevel` | `string` | `'all'` | The level of payload to analyze. Can be `'all'`, `'warning'` or `'error'`. |
| `warningSize` | `number` | `1024 * 50` | The size of payload that will trigger a warning. |
| `errorSize` | `number` | `1024 * 100` | The size of payload that will trigger an error. |
| `failOnError` | `boolean` | `false` | If `true`, the build will fail if a payload is too big. |

You can use `npx nuxt-payload-analyzer@latest --help` to get the list of options for the CLI.

## Development

Install dependencies

```bash
pnpm install
```

Prepare the repo

```bash
pnpm run dev:prepare
```

Build Stub

```bash
pnpm run build:stub
```

Play with **module** using the Nuxt app in the playground folder

```bash
pnpm run dev
```

You can also generate the playground Nuxt app

```bash
pnpm run dev:generate
```

Play with the **CLI** in the playground folder

```bash
pnpm run nuxt-payload-analyzer
```

_Please, do not commit change in the playground folder._

## License

[MIT License](./LICENSE)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-payload-analyzer/latest.svg?style=flat&colorA=18181B&colorB=38bdf8
[npm-version-href]: https://npmjs.com/package/nuxt-payload-analyzer

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-payload-analyzer.svg?style=flat&colorA=18181B&colorB=38bdf8
[npm-downloads-href]: https://npmjs.com/package/nuxt-payload-analyzer

[license-src]: https://img.shields.io/npm/l/nuxt-payload-analyzer.svg?style=flat&colorA=18181B&colorB=38bdf8
[license-href]: https://npmjs.com/package/nuxt-payload-analyzer

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
