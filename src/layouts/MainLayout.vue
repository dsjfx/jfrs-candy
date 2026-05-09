<template>
  <div class="main-layout">
    <Header />
    <div class="layout-container">
      <main class="main-content">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
      <!-- <aside class="sidebar">
        <AboutCard />
        <CategoriesCard />
        <TagsCard />
        <RecentArticlesCard />
      </aside> -->
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import AboutCard from '@/components/sidebar/AboutCard.vue'
import CategoriesCard from '@/components/sidebar/CategoriesCard.vue'
import TagsCard from '@/components/sidebar/TagsCard.vue'
import RecentArticlesCard from '@/components/sidebar/RecentArticlesCard.vue'
</script>

<style scoped lang="scss">
$breakpoint-mobile: 768px;

.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-container {
  min-width: 80%;
  max-width: 90%;
  margin: 24px auto;
  padding: 0 20px;
  display: flex;
  gap: 32px;

  @media (max-width: $breakpoint-mobile) {
    min-width: 90%;
    max-width: 100%;
    margin: 10px;
    padding: 0 5px;
  }
}

.main-content {
  flex: 4;
  min-width: 0;
  min-height: 50vh;
}

.sidebar {
  width: 320px;
  flex-shrink: 0;

  &>* {
    margin-bottom: 24px;
  }
}

// @media (max-width: 992px) {
//   .layout-container {
//     flex-direction: column;
//   }

//   .sidebar {
//     width: 100%;
//   }
// }</style>