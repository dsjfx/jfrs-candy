<template>
  <div ref="root" v-html="sanitizedHtml"></div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DOMPurify from 'dompurify'

const props = defineProps<{ html: string }>()

const root = ref<HTMLElement | null>(null)

const sanitizedHtml = computed(() => {
  try {
    return DOMPurify.sanitize(props.html || '', { SAFE_FOR_TEMPLATES: true })
  } catch (e) {
    // fallback: escape angle brackets
    return (props.html || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
})

// ensure re-render on html change
watch(() => props.html, () => {
  // computed handles value change; keep this watcher so parent can access root via ref
})

// expose inner root so parent components can query its DOM for headings
defineExpose({ root })
</script>

<style scoped>
/* the component itself is unstyled; it inherits styles from parent */
</style>
