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
          <h2 class="section-title">关于我</h2>
          <p class="section-text">
            {{ author.bio }}
          </p>
          <!-- <p class="section-text">
            自2018年创立以来，我们走遍了山川湖海，记录下了无数动人的瞬间。从繁华都市到静谧乡村，
            从日出东方到星辰大海，我们用镜头诉说着这个世界的美好。
          </p> -->
        </div>
        <div class="intro-image">
          <img src="https://picsum.photos/600/400?random=101" alt="关于我们" loading="lazy" />
        </div>
      </section>

      <!-- 个人信息 / 爱好 / 社交 -->
      <section class="philosophy-section">
        <h2 class="section-title">个人档案</h2>
        <div class="philosophy-grid">
          <!-- 个人信息：居住地 / 座右铭 / 工作 -->
          <div class="philosophy-card">
            <div class="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </div>
            <h3>个人信息</h3>
            <ul class="info-list">
              <li><strong>居住地：</strong>{{ author.location || '某地' }}</li>
              <li><strong>座右铭：</strong>{{ author.motto || '拥抱好奇，持续学习' }}</li>
              <li><strong>深耕：</strong>{{ author.job || '前端工程师 / 内容创作者' }}</li>
            </ul>
          </div>

          <!-- 爱好 -->
          <div class="philosophy-card">
            <div class="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M20.84 4.61a5 5 0 00-7.07 0L12 6.38l-1.77-1.77a5 5 0 10-7.07 7.07L12 21.07l8.84-8.99a5 5 0 000-7.47z" />
              </svg>
            </div>
            <h3>兴趣爱好</h3>
            <div class="hobbies">
              <ul v-if="author.hobbies && author.hobbies.length">
                <li v-for="(h, i) in author.hobbies" :key="i">{{ h }}</li>
              </ul>
              <p v-else>摄影 · 旅行 · 阅读 · 编程 · 咖啡</p>
            </div>
          </div>

          <!-- 社交账号 -->
          <div class="philosophy-card">
            <div class="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 8V7a2 2 0 00-2-2h-3.5" />
                <rect x="3" y="7" width="18" height="13" rx="2" ry="2" />
                <path d="M7 11h0" />
              </svg>
            </div>
            <h3>社交账号</h3>
            <div class="socials">
              <ul>
                <li v-if="author.social?.github" class="social-row">
                  <FaIcon :icon="faGithub" />
                  <span class="social-label">GitHub</span>
                  <a :href="getAccountHref('github', author.social.github)" target="_blank" rel="noopener"
                    class="social-link">
                    {{ /^https?:\/\//.test(author.social.github) ? author.social.github : `@${author.social.github}` }}
                  </a>
                  <button class="tiny-btn" @click="copyToClipboard(author.social.github)">复制</button>
                  <button v-if="author.social?.githubQr || author.social?.github_qr" class="tiny-btn"
                    @click="openQr('github')">二维码</button>
                </li>

                <li v-if="author.social?.weibo" class="social-row">
                  <FaIcon :icon="faWeibo" />
                  <span class="social-label">Weibo</span>
                  <a :href="getAccountHref('weibo', author.social.weibo)" target="_blank" rel="noopener"
                    class="social-link">
                    {{ /^https?:\/\//.test(author.social.weibo) ? author.social.weibo : `@${author.social.weibo}` }}
                  </a>
                  <button class="tiny-btn" @click="copyToClipboard(author.social.weibo)">复制</button>
                  <button v-if="author.social?.weiboQr || author.social?.weibo_qr" class="tiny-btn"
                    @click="openQr('weibo')">二维码</button>
                </li>

                <li v-if="author.social?.qq" class="social-row">
                  <FaIcon :icon="faQq" />
                  <span class="social-label">QQ</span>
                  <a :href="getAccountHref('qq', author.social.qq)" target="_blank" rel="noopener" class="social-link">
                    {{ /^https?:\/\//.test(author.social.qq) ? author.social.qq : author.social.qq }}
                  </a>
                  <button class="tiny-btn" @click="copyToClipboard(author.social.qq)">复制</button>
                  <button v-if="author.social?.qqQr || author.social?.qq_qr" class="tiny-btn"
                    @click="openQr('qq')">二维码</button>
                </li>
              </ul>

              <!-- fallback 静态链接（当 author.social 未提供时显示） -->
              <div v-if="!author.social || Object.keys(author.social).length === 0" class="social-fallback">
                <a href="https://github.com/" target="_blank" rel="noopener">GitHub</a>
                <a href="https://weibo.com/" target="_blank" rel="noopener">Weibo</a>
                <a href="https://qzone.qq.com/" target="_blank" rel="noopener">QQ</a>
              </div>
            </div>
          </div>
        </div>
      </section>


      <el-dialog v-model="showQrDialog" title="二维码" width="360px">
        <div style="text-align:center">
          <img v-if="qrImageUrl" :src="qrImageUrl" alt="QR" style="max-width:100%;height:auto" />
          <p v-else>暂无二维码</p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showQrDialog = false">关闭</el-button>
        </span>
      </el-dialog>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { faGithub, faWeibo, faQq, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { useLoading } from '@/composables/useLoading';
// import { userApi } from '@/api'
import type { User } from '@/types/user'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const {
  // isLoading, 
  startLoading,
  stopLoading
} = useLoading();

const author = ref<User>({} as User)
const showQrDialog = ref(false)
const qrImageUrl = ref('')


const getUser = async () => {
  startLoading();

  try {
    await userStore.getUserInfo({ id: 1 });
    if (userStore.user) {
      // const user: User = userStore.user;
      author.value = userStore.user;
    }
  } catch (error) {
    console.error('获取用户信息失败：', error);
  } finally {
    stopLoading();
  }
}

// 初始化页面
onMounted(async () => {
  await getUser();
})

const copyToClipboard = async (text: string) => {
  try {
    if (!text) {
      ElMessage.warning('无可复制内容')
      return
    }
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (err) {
    console.error('复制失败', err)
    ElMessage.error('复制失败，请手动复制')
  }
}

const getAccountHref = (type: string, val: string) => {
  if (!val) return '#'
  if (/^https?:\/\//.test(val)) return val
  switch (type) {
    case 'github':
      return `https://github.com/${val}`
    case 'weibo':
      return `https://weibo.com/${val}`
    case 'qq':
      return `https://qzone.qq.com/${val}`
    case 'twitter':
      return `https://twitter.com/${val}`
    default:
      return val
  }
}

const openQr = (type: string) => {
  const social = author.value.social || {}
  // prefer explicit QR field e.g. wechatQr, githubQr
  const key = `${type}Qr`
  const url = social[key] || social[`${type}Qr`] || ''
  if (url) {
    qrImageUrl.value = url
    showQrDialog.value = true
  } else {
    ElMessage.info('当前账号未提供二维码')
  }
}

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

    .info-list {
      list-style: none;
      padding: 0;
      margin: 0;
      text-align: left;

      li {
        margin-bottom: 8px;
        color: #4a5568;
        font-size: 1rem;
      }
    }

    .hobbies ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        display: inline-block;
        margin-right: 10px;
        background: rgba(52, 152, 219, 0.08);
        padding: 6px 10px;
        border-radius: 12px;
        color: #2c3e50;
        font-size: 0.95rem;
      }
    }

    .socials {
      text-align: center;

      ul {
        list-style: none;
        padding: 0;
        margin: 0 0 12px 0;

        li {
          margin-bottom: 8px;
        }
      }

      .social-fallback a {
        display: inline-block;
        margin: 6px 8px;
        padding: 6px 12px;
        background: rgba(155, 89, 182, 0.08);
        border-radius: 8px;
        color: #6b46c1;
        text-decoration: none;
      }
    }

    .social-row {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
    }

    .social-label {
      font-weight: 600;
      color: #2c3e50;
      margin-right: 6px;
    }

    .social-link {
      color: #4a5568;
      text-decoration: none;
      margin-right: 6px;
    }

    .tiny-btn {
      background: transparent;
      border: 1px solid rgba(0, 0, 0, 0.06);
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
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