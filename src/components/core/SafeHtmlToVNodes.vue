<template>
  <div ref="root">
    <component v-if="vnodes.length === 1" :is="vnodes[0]" />
    <template v-else>
      <component v-for="(node, i) in vnodes" :key="i" :is="node" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, h } from 'vue'
import DOMPurify from 'dompurify'

const props = defineProps<{
  html: string
  tagMap?: Record<string, any>
}>()

const root = ref<HTMLElement | null>(null)

// Utility: parse style string into object
const parseStyle = (styleStr: string) => {
  const out: Record<string, string> = {}
  if (!styleStr) return out
  styleStr.split(';').forEach((part) => {
    const [k, v] = part.split(':')
    if (k && v) {
      out[k.trim()] = v.trim()
    }
  })
  return out
}

// Convert DOM node to VNode recursively
const nodeToVNode = (node: Node): any => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || ''
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const el = node as Element
  const tag = el.tagName.toLowerCase()

  // map to custom component if provided
  const mapped = props.tagMap && props.tagMap[tag]

  // collect attributes
  const attrs: any = {}
  for (let i = 0; i < el.attributes.length; i++) {
    const a = el.attributes[i]
    if (!a) continue
    const name = a.name
    const value = a.value
    if (name === 'style') {
      attrs.style = parseStyle(value)
    } else if (name === 'class') {
      attrs.class = value
    } else {
      attrs[name] = value
    }
  }

  // default behavior for links: open in new tab and noopener
  if (tag === 'a') {
    attrs.target = attrs.target || '_blank'
    attrs.rel = attrs.rel || 'noopener noreferrer'
  }

  // children
  const childNodes = Array.from(el.childNodes || [])
    .map(nodeToVNode)
    .filter((c) => c !== null)

  const children = childNodes.length === 0 ? undefined : childNodes

  const nodeTag = mapped || tag
  return h(nodeTag as any, attrs, children)
}

const vnodes = ref<any[]>([])

const buildVNodes = (rawHtml: string) => {
  try {
    const clean = DOMPurify.sanitize(rawHtml || '', { SAFE_FOR_TEMPLATES: true })
    const parser = new DOMParser()
    const doc = parser.parseFromString(clean, 'text/html')
    const body = doc.body
    const nodes = Array.from(body.childNodes || [])
    const converted = nodes.map(nodeToVNode).filter((n) => n !== null)
    vnodes.value = converted
  } catch (err) {
    // fallback: render as simple text node
    vnodes.value = [h('div', { innerHTML: '' })]
    console.error('SafeHtmlToVNodes build error', err)
  }
}

watch(() => props.html, (v) => buildVNodes(v), { immediate: true })

defineExpose({ root })
</script>

<style scoped>
/* no-op */
</style>
