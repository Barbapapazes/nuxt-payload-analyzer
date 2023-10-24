<script lang="ts" setup>
import { useFetch } from '#app'

const data = await useFetch('/api/hello')
</script>

<template>
  <div>
    <h1>About</h1>
    <p>This is the about page</p>
    <p>{{ data }}</p>
  </div>
</template>
