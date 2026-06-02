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
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
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
</style>