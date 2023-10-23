export default defineNuxtConfig({
  routeRules: {
    '/api/hello': {
      prerender: true,
    },
  },
})
