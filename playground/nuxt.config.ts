export default defineNuxtConfig({
  modules: ['../src/module'],
  payloadAnalyzer: {
    // failOnError: true,
  },
  routeRules: {
    '/api/hello': {
      prerender: false,
    },
  },
})
