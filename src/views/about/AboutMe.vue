<template>
  <div class="about-me-page">
    <section v-if="showHero" class="hero-section">
      <div class="hero-shell">
        <div class="hero-copy">
          <p class="eyebrow">About Me</p>
          <h1>你好，我是 <span>{{ nickname || 'Jfx' }}</span></h1>
          <p class="lead">
            我是一名热爱技术、关注产品体验与内容表达的工程师，喜欢把想法变成可用的产品，
            也喜欢通过写作、整理与分享，把知识沉淀成真正能帮助他人的内容。
          </p>
          <div class="hero-actions">
            <a :href="emailUrl" class="primary-btn">联系我</a>
            <a :href="githubUrl" target="_blank" rel="noopener" class="secondary-btn">GitHub</a>
          </div>
        </div>

        <div class="hero-card">
          <div class="avatar">
            <img :src="author.avatar" alt="头像" loading="lazy" />
          </div>
          <ul>
            <li><span>职业</span><strong>{{ job || '前端工程师 / 内容创作者' }}</strong></li>
            <li><span>所在地</span><strong>{{ location || '中国 · 上海' }}</strong></li>
            <li><span>爱好</span><strong>{{ hobby || '代码、旅行、阅读、摄影' }}</strong></li>
            <li><span>座右铭</span><strong>{{ motto || '把复杂变简单，把灵感变落地' }}</strong></li>
          </ul>
        </div>
      </div>
    </section>

    <main class="content-wrap">
      <section v-if="showIntro" class="section-block">
        <div class="section-title-row">
          <p class="section-tag">Self Introduction</p>
          <h2>关于我</h2>
        </div>

        <div class="intro-grid">
          <div class="intro-text">
            <p>
              我从事前端开发多年，核心关注点是用户体验、工程效率和可维护性。我的工作方式
              往往是先理解问题，再拆解需求，最终通过清晰的代码结构和良好的交互设计，把抽象
              的想法落成真正有价值的产品。
            </p>
            <p>
              我对设计、开发、写作和知识分享都保持强烈兴趣。平常会记录一些技术实践、学习笔记
              和产品思考，也会参与讨论和复盘，以持续提升自己的判断力和表达能力。
            </p>
            <div class="stats-box">
              <div>
                <strong>6+</strong>
                <span>年开发经验</span>
              </div>
              <div>
                <strong>20+</strong>
                <span>个项目落地</span>
              </div>
              <div>
                <strong>100+</strong>
                <span>篇学习记录</span>
              </div>
            </div>
          </div>
          <div class="intro-image">
            <img src="https://picsum.photos/600/400?random=101" alt="关于我们" loading="lazy" />
          </div>
        </div>
      </section>

      <section v-if="showFeatures" class="section-block">
        <div class="section-title-row">
          <p class="section-tag">Strengths</p>
          <h2>我的优势</h2>
        </div>

        <div class="feature-grid">
          <article v-for="item in strengths" :key="item.title" class="feature-card">
            <div class="icon">{{ item.icon }}</div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </article>
        </div>
      </section>

      <section v-if="showTag" class="section-block">
        <div class="section-title-row">
          <p class="section-tag">Preferences</p>
          <h2>我的偏好</h2>
        </div>

        <div class="tag-list">
          <span v-for="item in preferences" :key="item">{{ item }}</span>
        </div>
      </section>

      <section v-if="showSocial" class="section-block">
        <div class="section-title-row">
          <p class="section-tag">Social</p>
          <h2>社交网络</h2>
        </div>

        <div class="social-grid">
          <a v-for="item in socialLinks" :key="item.label" :href="item.url.value" target="_blank" rel="noopener"
            class="social-card">
            <span class="social-icon">{{ item.icon }}</span>
            <div>
              <strong>{{ item.label }}</strong>
              <small>{{ item.value }}</small>
            </div>
          </a>
        </div>
      </section>

      <section v-if="showTools" class="section-block">
        <div class="section-title-row">
          <p class="section-tag">Tools</p>
          <h2>常用工具与链接</h2>
        </div>

        <div class="tool-grid">
          <a v-for="tool in tools" :key="tool.name" :href="tool.url" target="_blank" rel="noopener" class="tool-card">
            <div class="tool-head">
              <span class="tool-icon">{{ tool.icon }}</span>
              <strong>{{ tool.name }}</strong>
            </div>
            <p>{{ tool.desc }}</p>
          </a>
        </div>
      </section>

      <section v-if="showRecommended" class="section-block">
        <div class="section-title-row">
          <p class="section-tag">Recommended</p>
          <h2>推荐栏目</h2>
        </div>

        <div class="recommend-grid">
          <a v-for="item in recommendedColumns" :key="item.name" :href="item.url" target="_blank" rel="noopener"
            class="recommend-card">
            <span class="badge">{{ item.type }}</span>
            <h3>{{ item.name }}</h3>
            <p>{{ item.desc }}</p>
          </a>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useLoading } from '@/composables/useLoading';
import { useUserStore } from '@/stores/user';
import type { User } from '@/types';



const userStore = useUserStore()

const {
  // isLoading, 
  startLoading,
  stopLoading
} = useLoading();

interface Props {
  showHero?: boolean;
  showIntro?: boolean;
  showFeatures?: boolean;
  showTag?: boolean;
  showSocial?: boolean;
  showTools?: boolean;
  showRecommended?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showHero: true,
  showIntro: true,
  showFeatures: true,
  showTag: true,
  showSocial: true,
  showTools: true,
  showRecommended: true,
});

const subject = import.meta.env.VITE_APP_SUBJECT || ''
const author = ref<User>({} as User)
const email = ref<string>('hello@example.com')
const github = ref<string>('https://github.com')


const emailUrl = computed(() => `mailto:${email.value}`)
const githubUrl = computed(() => github.value)
const zhihuUrl = computed(() => 'https://www.zhihu.com/people/yourname')
const weiboUrl = computed(() => 'https://weibo.com/yourname')

const nickname = computed(() => author.value.nickname || 'Jfx')
const job = computed(() => author.value.job || '前端工程师 / 内容创作者')
const hobby = computed(() => {
  const hobbies: string[] = author.value.hobbies || []
  return hobbies?.join(', ') || '代码、旅行、阅读、摄影';
})
const location = computed(() => author.value.location || '中国 · 上海')
const motto = computed(() => author.value.motto || '把复杂变简单，把灵感变落地')

const getUser = async () => {
  startLoading();

  try {
    let id = 1;
    if (subject === 'note')
      id = 2;
    await userStore.getUserInfo({ id });
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

onMounted(async () => {
  await getUser();
})

const strengths = [
  {
    icon: '💡',
    title: '产品思维',
    desc: '能从用户需求出发，把功能需求与体验诉求转化为清晰可执行的方案。',
  },
  {
    icon: '⚙️',
    title: '工程实现',
    desc: '熟悉前端工程化、组件设计、接口联调和性能优化，重视稳定与可维护性。',
  },
  {
    icon: '🧠',
    title: '学习能力',
    desc: '对新技术保持好奇，能快速构建学习路径并应用到实际业务中。',
  },
  {
    icon: '✍️',
    title: '表达与协作',
    desc: '能清晰表达设计思路，推动团队协作，帮助多人理解与快速落地。',
  },
]

const preferences = [
  '简洁设计',
  '高可用产品',
  '可读性优先',
  '极简交互',
  '技术与内容结合',
  '长期主义思维',
  '工程规范化',
  '持续学习',
]

const socialLinks = [
  { label: 'GitHub', value: '@yourname', url: githubUrl, icon: 'G' },
  { label: '知乎', value: '@yourname', url: zhihuUrl, icon: '知' },
  { label: '微博', value: '@yourname', url: weiboUrl, icon: '微' },
  { label: 'Email', value: 'hello@example.com', url: emailUrl, icon: '✉' },
]

const tools = [
  {
    name: 'Notion',
    icon: 'N',
    url: 'https://www.notion.so/',
    desc: '知识管理、文档整理和任务规划的工作台。',
  },
  {
    name: 'GitHub',
    icon: 'G',
    url: 'https://github.com/',
    desc: '代码托管、协作与版本管理的核心平台。',
  },
  {
    name: 'Figma',
    icon: 'F',
    url: 'https://www.figma.com/',
    desc: '原型设计、界面评审和产品协同的设计工具。',
  },
  {
    name: 'VS Code',
    icon: 'V',
    url: 'https://code.visualstudio.com/',
    desc: '高效编码与调试的编辑器，支持多种语言与插件。',
  },
  {
    name: 'Obsidian',
    icon: 'O',
    url: 'https://obsidian.md/',
    desc: '知识库和思维连接的个人笔记工具。',
  },
  {
    name: '飞书',
    icon: 'F',
    url: 'https://www.feishu.cn/',
    desc: '文档、会议与团队协同的高效率工作平台。',
  },
]

const recommendedColumns = [
  {
    name: '前端之巅',
    type: '技术',
    url: 'https://example.com/frontend-column',
    desc: '聚焦前端工程、组件设计和性能优化的深度内容。',
  },
  {
    name: '设计与产品',
    type: '产品',
    url: 'https://example.com/product-column',
    desc: '关于产品思维、设计决策和用户体验迭代的思考。',
  },
  {
    name: '知识管理实战',
    type: '成长',
    url: 'https://example.com/knowledge-column',
    desc: '分享整理、复盘和系统化学习的方法与实践。',
  },
]
</script>

<style scoped lang="scss">
.about-me-page {
  width: min(1200px, calc(100% - 32px));
  margin: 0 auto;
  padding: 32px 0 64px;
  color: #0f172a;
}

.hero-section {
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(59, 130, 246, 0.08));
  border: 1px solid rgba(15, 118, 110, 0.1);
  border-radius: 28px;
  padding: 32px;
  margin-bottom: 32px;
}

.hero-shell {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;
  align-items: center;
}

.eyebrow,
.section-tag {
  margin: 0 0 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  color: #059669;
  font-weight: 700;
}

.hero-copy h1 {
  margin: 0;
  font-size: clamp(2.2rem, 4vw, 4rem);
  line-height: 1.1;

  span {
    color: #059669;
  }
}

.lead {
  margin: 16px 0 0;
  max-width: 640px;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 24px;
}

.primary-btn,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  padding: 0 20px;
  border-radius: 999px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.primary-btn {
  background: #059669;
  color: #fff;
  text-decoration: none;
}

.secondary-btn {
  background: #fff;
  color: #065f46;
  border: 1px solid rgba(5, 150, 105, 0.2);
  text-decoration: none;
}

.hero-card {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(15, 118, 110, 0.12);
  border-radius: 22px;
  padding: 22px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
}

.avatar {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #059669, #3b82f6);
  color: #fff;
  font-size: 1.7rem;
  font-weight: 700;
  margin-bottom: 20px;

  & img {
    width: 72px;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
}

.hero-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 14px;
}

.hero-card li {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.hero-card li:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.hero-card li span {
  color: #64748b;
  font-size: 0.75rem;
}

.hero-card li strong {
  font-size: 0.94rem;
  line-height: 1.6;
  color: #0f172a;
}

.content-wrap {
  display: grid;
  gap: 28px;
}

.section-block {
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 22px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.03);
}

.section-title-row {
  margin-bottom: 20px;
}

.section-title-row h2 {
  margin: 0;
  font-size: clamp(1.5rem, 2vw, 2.2rem);
}

.intro-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
}

.intro-text {
  color: #334155;
  line-height: 1.9;
}

.intro-text p {
  margin: 0 0 16px;
}

.stats-box {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.stats-box div {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.05));
  border: 1px solid rgba(15, 118, 110, 0.08);
  border-radius: 18px;
  padding: 18px 14px;
  text-align: center;
}

.stats-box strong {
  display: block;
  font-size: 1.7rem;
  color: #0f172a;
}

.stats-box span {
  color: #64748b;
  font-size: 0.78rem;
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

.feature-grid,
.social-grid,
.tool-grid,
.recommend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.feature-card,
.social-card,
.tool-card,
.recommend-card {
  display: block;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  padding: 18px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-decoration: none;
  color: inherit;
}

.feature-card:hover,
.social-card:hover,
.tool-card:hover,
.recommend-card:hover,
.primary-btn:hover,
.secondary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.06);
}

.icon,
.tool-icon,
.social-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.12), rgba(59, 130, 246, 0.12));
  font-size: 1.2rem;
  margin-bottom: 14px;
}

.feature-card h3,
.recommend-card h3 {
  margin: 0 0 8px;
  font-size: 1.08rem;
}

.feature-card p,
.tool-card p,
.recommend-card p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-list span {
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(5, 150, 105, 0.08);
  border: 1px solid rgba(5, 150, 105, 0.14);
  color: #065f46;
  font-weight: 600;
}

.social-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.social-card div {
  display: flex;
  flex-direction: column;
}

.social-card strong {
  font-size: 1rem;
}

.social-card small {
  color: #64748b;
  margin-top: 4px;
}

.tool-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.badge {
  display: inline-block;
  margin-bottom: 10px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.08);
  color: #1d4ed8;
  font-size: 0.7rem;
  font-weight: 700;
}

@media (max-width: 768px) {

  .hero-shell,
  .intro-grid {
    grid-template-columns: 1fr;
  }

  .section-block,
  .hero-section {
    padding: 20px;
  }

  .stats-box {
    grid-template-columns: 1fr;
  }
}
</style>
