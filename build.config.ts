import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: false,
  clean: false, // Avoid to remove build module
  entries: ['src/cli/index.ts'],
  failOnWarn: false, // Disable because of CLI and Module
})
