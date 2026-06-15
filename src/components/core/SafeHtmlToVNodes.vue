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

<style scoped lang="scss">
/* 2026-06-15 add itself's style for reuse  */
$breakpoint-tablet: 1024px;
$breakpoint-mobile: 768px;
$bg-color: $base-bg-j3;
$border-color: $base-border-j2;
$shadow: $shadow-xs;
$radius: $radius-sm;

.content-html {
  overflow-x: auto;
  font-size: 1.1rem;
  line-height: 1.8;
  // color: $text-primary;
  /* 深灰蓝，不刺眼 */
  color: #1e293b;

  :deep() {

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin-top: 1.2rem;
      margin-bottom: 0.8rem;
      color: $text-primary;
      font-weight: 600;
      line-height: 1.3;
      /* 略微收紧，更现代 */
      letter-spacing: -0.01em;
      /* 锚点跳转时留出空间 */
      scroll-margin-top: 1rem;
    }

    h1 {
      margin-top: 0.2em;
      margin-bottom: 0.6em;
      padding-bottom: 0.3rem;
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #1e293b 0%, #2d4a6e 100%);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      letter-spacing: -0.02em;
      border-bottom: 2px solid #e2e8f0;
    }

    h2 {
      margin-top: 2rem;
      margin-bottom: 1rem;
      padding-left: 0.9rem;
      font-size: 1.875rem;
      /* 清新绿条，增加层次感 */
      border-left: 5px solid var(--accent-color);
      color: #2c3e4e;
    }

    h3 {
      // display: inline-block;
      padding: 0 0.5rem 0 0;
      font-size: 1.5rem;
      color: #2c5a6e;
      // background: linear-gradient(to right, #d9f0e9, transparent);
    }

    h4 {
      display: inline-block;
      margin-bottom: 0.3em;
      font-size: 1.25rem;
      font-weight: 550;
      color: #3b6e62;
      border-bottom: 1px dashed #cbd5e1;
    }

    h5 {
      font-size: 1.1rem;
      font-weight: 550;
      color: #4a7c6b;
      font-style: normal;
    }

    h6 {
      font-size: 1rem;
      font-weight: 500;
      color: #5f8b7a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    p {
      margin-top: 0;
      margin-bottom: 0.8em;
    }

    a {
      color: #2c7a6e;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: all 0.3s ease;

      &:hover {
        color: #1e5a5a;
        border-bottom-color: #2c7a6e;
      }
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: $radius;
      margin: 1.5rem 0;
      box-shadow: $shadow;
    }

    blockquote {
      margin: 1.5rem 0;
      padding: 0.8rem 1.2rem;
      border-left: 4px solid #b9e0c5;
      border-radius: 0 12px 12px 0;
      background-color: #f8fafc;
      font-style: normal;
      color: #2c5a5c;

      p {
        margin: 0;
      }
    }

    code {
      padding: 0.2rem 0.4rem;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      background-color: #f1f5f9;
      border-radius: 6px;
      font-size: 0.9em;
      color: #0f3b3b;
    }

    pre {
      max-height: 350px;
      /* 布局与间距 */
      margin: 1.5rem 0;
      padding: 1.25rem 1.5rem;

      /* 背景与边框 - 极浅灰绿，不刺眼 */
      background-color: #f8fafc;
      border: 1px solid #e2edf2;
      border-radius: 16px;

      /* 排版 */
      font-family: 'SF Mono', 'Menlo', 'Monaco', 'Cascadia Code', 'Consolas', monospace;
      font-size: 0.875rem;
      line-height: 1.55;

      /* 滚动与溢出处理 */
      overflow-x: auto;
      overflow-y: scroll;
      white-space: pre;
      word-break: normal;
      word-wrap: normal;

      /* 增加微妙阴影，提升层次感 */
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.03);

      /* 平滑滚动条（WebKit） */
      scrollbar-width: thin;

      /* 美化滚动条（可选，提升细节） */
      &::-webkit-scrollbar {
        height: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #e9f0f3;
        border-radius: 10px;
      }

      &::-webkit-scrollbar-thumb {
        background: #b9cfda;
        border-radius: 10px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: #92b3c2;
      }

      &::before {
        content: '</>';
        margin-top: -0.3rem;
        margin-bottom: 0.5rem;
        float: right;
        font-size: 0.7rem;
        color: #9bbec7;
        font-family: monospace;
        opacity: 0.7;
      }

      code {
        display: block;
        padding: 0;
        background: none;
        border: none;
        border-radius: 0;
        font-size: inherit;
        color: #1e3a3a;
        font-weight: normal;
      }
    }

    ul,
    ol {
      margin: 0.8em 0 1.2em 1.5em;
      padding-left: 0.5rem;

      li {
        margin: 0.3em 0;

        &::marker {
          color: $primary-color;
        }
      }
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;

      th,
      td {
        padding: 0.75rem 1rem;
        border: 1px solid $border-color;
        text-align: left;
      }

      th {
        background: rgba($primary-color, 0.1);
        font-weight: 600;
        color: $text-primary;
      }

      tr:nth-child(even) {
        background: $bg-color;
      }
    }

    /* 响应式调整 */
    @media (max-width: $breakpoint-mobile) {
      .prose-content h1 {
        font-size: 2rem;
      }

      .prose-content h2 {
        font-size: 1.5rem;
      }

      .prose-content h3 {
        font-size: 1.3rem;
      }

      .prose-content {
        padding: 1rem;
      }
    }
  }
}
</style>
