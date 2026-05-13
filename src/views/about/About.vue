<template>
  <div class="about-page">
    <!-- 顶部背景区域 -->
    <!-- <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">关于我们</h1>
        <p class="hero-subtitle">用镜头记录美好，用文字诉说故事</p >
      </div>
      <div class="hero-overlay"></div>
    </div> -->

    <!-- 主要内容区域 -->
    <div class="content-wrapper">
      <!-- 关于简介 -->
      <section class="about-intro">
        <div class="intro-content">
          <h2 class="section-title">我们的故事</h2>
          <p class="section-text">
            我们是一个热爱生活、热爱摄影的团队。在这个快节奏的时代，我们希望通过镜头捕捉那些容易被忽视的美好瞬间，
            用图片讲述故事，用文字记录情感。每一张照片背后都有一个独特的故事，每一个故事都值得被看见。
          </p>
          <p class="section-text">
            自2018年创立以来，我们走遍了山川湖海，记录下了无数动人的瞬间。从繁华都市到静谧乡村，
            从日出东方到星辰大海，我们用镜头诉说着这个世界的美好。
          </p>
        </div>
        <div class="intro-image">
          <img src="https://picsum.photos/600/400?random=101" alt="关于我们" loading="lazy" />
        </div>
      </section>

      <!-- 团队理念 -->
      <section class="philosophy-section">
        <h2 class="section-title">我们的理念</h2>
        <div class="philosophy-grid">
          <div class="philosophy-card">
            <div class="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3>真实记录</h3>
            <p>我们不追求完美的构图，只追求真实的瞬间。最动人的画面往往来自于最真实的生活。</p>
          </div>

          <div class="philosophy-card">
            <div class="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
              </svg>
            </div>
            <h3>情感连接</h3>
            <p>每一张照片都应该能够唤起共鸣，连接人与人之间的情感，让美好传递更远。</p>
          </div>

          <div class="philosophy-card">
            <div class="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <h3>持续分享</h3>
            <p>我们相信分享的力量。通过持续的分享，让更多人看到世界的多样性和美好。</p>
          </div>
        </div>
      </section>

      <!-- 数据统计 -->
      <!-- <section class="stats-section">
        <h2 class="section-title">数字背后</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number" ref="photoCount">0</div>
            <div class="stat-label">精选图片</div>
          </div>
          <div class="stat-item">
            <div class="stat-number" ref="storyCount">0</div>
            <div class="stat-label">故事记录</div>
          </div>
          <div class="stat-item">
            <div class="stat-number" ref="countryCount">0</div>
            <div class="stat-label">踏足国家</div>
          </div>
          <div class="stat-item">
            <div class="stat-number" ref="memberCount">0</div>
            <div class="stat-label">团队成员</div>
          </div>
        </div>
      </section> -->
    </div>

  </div>
</template>

<script setup lang="ts">
import { userApi } from '@/api'
import { ref, onMounted, reactive } from 'vue'

// 表单数据
const form = reactive({
  name: '',
  email: '',
  message: ''
})

const isSubmitting = ref(false)

// 统计数字的引用
const photoCount = ref<HTMLElement>()
const storyCount = ref<HTMLElement>()
const countryCount = ref<HTMLElement>()
const memberCount = ref<HTMLElement>()

// 处理表单提交
const handleSubmit = async () => {
  isSubmitting.value = true

  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 1500))

  alert('感谢您的消息！我们会尽快回复您。')

  // 重置表单
  form.name = ''
  form.email = ''
  form.message = ''
  isSubmitting.value = false
}

// 数字增长动画
const animateCounter = (element: HTMLElement, target: number, duration: number = 2000) => {
  const start = 0
  const increment = target / (duration / 16) // 60fps
  let current = start

  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      current = target
      clearInterval(timer)
    }
    element.textContent = Math.floor(current).toString()
  }, 16)
}

// 初始化页面
onMounted(async () => {
  await userApi.getUserProfile({ id: 10 })

  // 初始化数字动画
  setTimeout(() => {
    if (photoCount.value) animateCounter(photoCount.value, 3567)
    if (storyCount.value) animateCounter(storyCount.value, 1234)
    if (countryCount.value) animateCounter(countryCount.value, 42)
    if (memberCount.value) animateCounter(memberCount.value, 8)
  }, 500)
})
</script>

<style lang="scss" scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

// 顶部英雄区域
.hero-section {
  position: relative;
  height: 400px;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
    url('https://picsum.photos/1920/400?random=100');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(52, 152, 219, 0.8), rgba(155, 89, 182, 0.8));
    mix-blend-mode: multiply;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    animation: fadeInUp 1s ease;
  }

  .hero-title {
    font-size: 4rem;
    font-weight: 300;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .hero-subtitle {
    font-size: 1.5rem;
    opacity: 0.9;
    font-weight: 300;
  }
}

// 主要内容包装
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px;
}

// 关于简介
.about-intro {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  margin-bottom: 100px;

  .intro-content {
    .section-title {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 30px;
      font-weight: 300;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -10px;
        width: 100px;
        height: 3px;
        background: linear-gradient(90deg, $base-color-j9, $base-color-j10);
      }
    }

    .section-text {
      font-size: 1.1rem;
      line-height: 1.8;
      color: #4a5568;
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .intro-image {
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    transform: rotate(2deg);
    transition: transform 0.3s ease;

    &:hover {
      transform: rotate(0deg) scale(1.02);
    }

    img {
      width: 100%;
      height: auto;
      display: block;
      transition: transform 0.5s ease;

      &:hover {
        transform: scale(1.05);
      }
    }
  }
}

// 团队理念
.philosophy-section {
  margin-bottom: 100px;

  .section-title {
    text-align: center;
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 60px;
    font-weight: 300;
  }

  .philosophy-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;

    .philosophy-card {
      background: white;
      padding: 40px 30px;
      border-radius: 15px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-10px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
      }

      .icon-wrapper {
        width: 80px;
        height: 80px;
        margin: 0 auto 25px;
        background: linear-gradient(135deg, #3498db, #9b59b6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          width: 36px;
          height: 36px;
          stroke: white;
        }
      }

      h3 {
        font-size: 1.5rem;
        color: #2c3e50;
        margin-bottom: 15px;
        font-weight: 500;
      }

      p {
        color: #718096;
        line-height: 1.6;
        font-size: 1rem;
      }
    }
  }
}

// 数据统计
.stats-section {
  margin-bottom: 100px;

  .section-title {
    text-align: center;
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 60px;
    font-weight: 300;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;

    .stat-item {
      text-align: center;
      padding: 30px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);

      .stat-number {
        font-size: 3rem;
        font-weight: 700;
        color: #3498db;
        margin-bottom: 10px;
        font-family: 'Arial', sans-serif;
      }

      .stat-label {
        font-size: 1.1rem;
        color: #4a5568;
        font-weight: 500;
      }
    }
  }
}

// 响应式设计
@media (max-width: 992px) {
  .hero-section {
    height: 300px;

    .hero-title {
      font-size: 3rem;
    }

    .hero-subtitle {
      font-size: 1.2rem;
    }
  }

  .about-intro {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .philosophy-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .footer-content {
    grid-template-columns: 1fr !important;
    gap: 40px !important;
    text-align: center;

    .footer-social {
      justify-content: center !important;
    }
  }
}

@media (max-width: 768px) {
  .philosophy-grid {
    grid-template-columns: 1fr !important;
  }

  .stats-grid {
    grid-template-columns: 1fr !important;
  }

}

// 动画
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes countUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>