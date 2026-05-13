<template>
  <div class="archive-container">
    <h1>文章归档</h1>

    <div v-if="isLoading" class="loading">
      <LoadingSpinner />
    </div>

    <div v-else class="archive-layout">
      <div v-if="!isLoading && years.length === 0" class="empty-state">
        暂无归档文章
      </div>
      <main class="archive-main" ref="mainRef">
        <el-timeline :mode="mode">
          <template v-for="year in visibleYears" :key="year.year">
            <el-timeline-item :timestamp="`${year.year}`" :color="timeColor">
              <div :id="`year-${year.year}`" class="year-block">
                <div class="year-card">
                  <div class="year-header">
                    <div class="year-title">{{ year.year }}</div>
                    <div class="year-meta">
                      <span class="year-count">{{ year.count }}</span>
                      <el-button plain class="toggle-btn" @click="toggleYear(year)">
                        <span v-if="year.expanded">收起</span>
                        <span v-else>展开</span>
                      </el-button>
                    </div>
                  </div>

                  <div class="months">
                    <div v-for="month in year.months" :key="month.month" class="month-panel"
                      :class="{ open: month.expanded && year.expanded }">
                      <div class="month-header" @click="toggleMonth(year, month)">
                        <div class="month-title">
                          <i :class="['chev', month.expanded ? 'open' : '']"></i>
                          {{ month.monthName }}
                        </div>
                        <div class="month-count">{{ month.count }}</div>
                      </div>

                      <transition name="fade-slide">
                        <ul v-show="month.expanded && year.expanded" class="month-list">
                          <li v-for="post in month.posts" :key="post.id" class="post-item">
                            <router-link :to="{ name: 'ArticleDetail', params: { id: post.id } }" class="post-link">
                              <div class="post-title">{{ post.title }}</div>
                              <div class="post-meta">{{ formatDate(post.publishedAt) }}</div>
                            </router-link>
                          </li>
                        </ul>
                      </transition>
                    </div>
                  </div>
                </div>
              </div>
            </el-timeline-item>
          </template>
        </el-timeline>

        <!-- sentinel for lazy loading more years -->
        <div ref="sentinelRef" class="sentinel" />
      </main>

      <!-- sidebar years -->
      <aside class="archive-sidebar">
        <div class="sidebar-inner">
          <h3>年份</h3>
          <ul class="year-nav">
            <li v-for="y in years" :key="y.year">
              <button class="nav-item" @click="scrollToYear(y.year)">
                <span class="year-label">{{ y.year }}</span>
                <span class="badge">{{ y.count }}</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { useArticleStore } from '@/stores/article'
import LoadingSpinner from '@/components/core/LoadingSpinner.vue'
import type { ArchiveResponse, ArchiveYear } from '@/types/article'
import type { TimelineProps } from 'element-plus'

const articleStore = useArticleStore()
const isLoading = articleStore.archiveLoading
const years = computed(() => (articleStore.archiveYears || []) as ArchiveYear[])
const timeColor = ref<string>('#059669')

// UI state
const isMobile = ref(false)

// use a simple ref for mode and update it on resize to ensure plain string passed to el-timeline
const mode = ref<TimelineProps['mode']>('alternate')
const mainRef = ref<HTMLElement | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)

// lazy load: initially show latest N years
const INITIAL_YEARS = 3
const visibleCount = ref(INITIAL_YEARS)
const visibleYears = computed(() => years.value.slice(0, visibleCount.value))

let observer: IntersectionObserver | null = null
let loadingMore = false

const fetchArchive = async () => {
  // reset archive flags (do not clear loaded years by default)
  articleStore.resetArchiveState({ clearYears: false })
  await articleStore.fetchArchive({ year: undefined, month: undefined, limit: INITIAL_YEARS })
  // initialize expanded states
  years.value.forEach((y, yi) => {
    if (typeof y.expanded === 'undefined') y.expanded = yi < INITIAL_YEARS
    y.months.forEach((m, mi) => {
      if (typeof m.expanded === 'undefined') m.expanded = yi < INITIAL_YEARS
    })
  })
  // set up observer after DOM painted
  await nextTick()
  setupObserver()
}

const setupObserver = () => {
  if (!sentinelRef.value) return
  if (observer) observer.disconnect()
  observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !loadingMore && !articleStore.archiveNoMore) {
        const lastYear = years.value.length ? years.value[years.value.length - 1]?.year : undefined
        const prevLen = (articleStore.archiveYears as any[]).length

        loadingMore = true

        const startYear = lastYear ? lastYear - INITIAL_YEARS : undefined
        if (!startYear) {
          loadingMore = false
          return
        }

        articleStore.loadMoreArchiveYears({ startYear, limit: (INITIAL_YEARS - 1) }).then(() => {
          const newLen = (articleStore.archiveYears as any[]).length
          const added = Math.max(0, newLen - prevLen)
          if (added > 0) {
            visibleCount.value = Math.min((articleStore.archiveYears as any[]).length, visibleCount.value + added)
          }
        }).catch(() => {
          // ignore
        }).finally(() => {
          loadingMore = false
        })
      }
    }
  }, { root: mainRef.value, threshold: 0.1 })

  observer.observe(sentinelRef.value)
}

// loadMore handled by store: articleStore.loadMoreArchiveYears

onUnmounted(() => {
  if (observer) observer.disconnect()
  window.removeEventListener('resize', handleResize)
})

const formatDate = (d: string) => {
  if (!d) return ''
  const date = new Date(d)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

onMounted(async () => {
  handleResize()
  window.addEventListener('resize', handleResize)

  await fetchArchive()
})

const toggleYear = (year: ArchiveYear) => {
  year.expanded = !year.expanded
}

const toggleMonth = (year: ArchiveYear, month: any) => {
  month.expanded = !month.expanded
}

const scrollToYear = (yearNum: number) => {
  const id = `year-${yearNum}`
  const el = document.getElementById(id)
  if (!el) return
  // if mainRef is scroll container, use it for smooth scrolling
  if (mainRef.value) {
    const top = el.getBoundingClientRect().top - (mainRef.value.getBoundingClientRect().top)
    mainRef.value.scrollTo({ top: top + mainRef.value.scrollTop, behavior: 'smooth' })
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
// resize handler (single reference so we can add/remove it reliably)
function handleResize() {
  const mobile = window.innerWidth <= 900
  isMobile.value = mobile
  mode.value = mobile ? 'start' : 'alternate'
}
</script>

<style scoped lang="scss">
$breakpoint-mobile: 768px;

.archive-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  flex: 1;

  @media (max-width: $breakpoint-mobile) {
    padding: 10px;
  }

  h1 {
    margin-bottom: 24px;
    font-size: 2.5rem;
    font-weight: 300;
    color: #333;
    text-align: center;
  }

  .year-title {
    font-weight: 700;
    margin-bottom: 8px;
  }

  // layout for sidebar + main
  .archive-layout {
    display: flex;
    gap: 2rem;
  }

  .archive-main {
    flex: 1 1 0;
    min-width: 0;
    max-height: calc(100vh - 160px);
    padding: 0 10px;
    overflow: auto;
  }

  .archive-sidebar {
    width: 160px;
    flex: 0 0 160px;
    position: sticky;
    top: 100px;
    height: calc(100vh - 160px);
    overflow: auto;
  }

  .sidebar-inner {
    background: var(--color-bg);
    border-radius: 8px;
    padding: 12px;
    border: 1px solid var(--color-border);
  }

  .sidebar-inner h3 {
    margin: 0 0 8px;
    font-size: 1.05rem
  }

  .year-nav .nav-item:hover {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 6px
  }

  .year-nav {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 6px 8px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
  }

  .badge {
    background: var(--color-primary);
    color: white;
    border-radius: 999px;
    padding: 2px 8px;
    font-size: 0.8rem;
  }


  .year-block {
    padding-bottom: 16px;
  }

  .year-card {
    background: var(--color-card, #fff);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    padding: 12px 14px;
    box-shadow: 0 2px 8px rgba(20, 20, 20, 0.04);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .year-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 18px rgba(20, 20, 20, 0.08);
  }

  .year-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .year-title {
    font-weight: 800;
    font-size: 1.15rem;
  }

  .year-meta {
    display: flex;
    align-items: center;
    gap: 8px
  }

  .year-count {
    background: rgba(44, 160, 98, 0.1);
    color: var(--color-primary);
    padding: 4px 8px;
    border-radius: 999px;
    font-weight: 700
  }

  .toggle-btn {
    font-size: 0.9rem
  }

  .month-panel {
    border-top: 1px dashed var(--color-border);
    padding-top: 8px;
    margin-top: 8px
  }

  .month-panel.open {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(0, 0, 0, 0.02));
  }

  .month-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 6px 2px
  }

  .month-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600
  }

  .month-count {
    background: var(--color-primary);
    color: #fff;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.85rem
  }

  .month-list {
    list-style: none;
    margin: 8px 0 12px;
    padding: 0
  }

  .post-item {
    padding: 8px 6px;
    border-radius: 6px;
    transition: background 0.12s
  }

  .post-item:hover {
    background: rgba(0, 0, 0, 0.02)
  }

  .post-link {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    text-decoration: none;
    color: var(--color-text)
  }

  .post-title {
    font-weight: 600
  }

  .post-meta {
    color: var(--color-text-secondary);
    font-size: 0.9rem
  }

  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.18s ease
  }

  .fade-slide-enter-from {
    opacity: 0;
    transform: translateY(-6px)
  }

  .fade-slide-enter-to {
    opacity: 1;
    transform: translateY(0)
  }

  .fade-slide-leave-from {
    opacity: 1;
    transform: translateY(0)
  }

  .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-6px)
  }

  .meta {
    color: var(--color-text-secondary);
    margin-left: 8px;
  }

  .sentinel {
    height: 1px;
  }

  .chev {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-left: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(-45deg);
    margin-right: 6px;
    transition: transform 0.2s
  }

  .chev.open {
    transform: rotate(45deg)
  }

  @media (max-width: 900px) {
    .archive-layout {
      flex-direction: column;
    }

    .archive-sidebar {
      width: 100%;
      position: static;
      height: auto;
    }

    .archive-main {
      max-height: none;
    }
  }
}
</style>
