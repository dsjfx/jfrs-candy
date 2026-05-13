import { ref, watch, type Ref } from 'vue'

/**
 * useDebouncedRef
 * Watches a source ref and updates a debounced ref after delay ms.
 * Returns the debounced ref.
 */
export default function useDebouncedRef<T>(source: Ref<T>, delay = 300) {
  const debounced = ref<T>(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(
    source,
    (val) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        debounced.value = val
        timer = null
      }, delay)
    },
    { immediate: false }
  )

  return debounced
}
