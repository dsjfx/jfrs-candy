<template>
  <div class="about-page">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">关于我</h1>
        <p class="hero-subtitle">技术爱好者 & 内容创作者</p >
      </div>
    </section>
    
    <!-- 个人信息 -->
    <section class="profile-section">
      <div class="container">
        <div class="profile-card">
          <div class="profile-header">
            <el-avatar :size="120" :src="user?.avatar || defaultAvatar" />
            <div class="profile-info">
              <h2 class="profile-name">{{ user?.username || '博主' }}</h2>
              <p class="profile-bio">{{ user?.bio || '热爱技术，热爱生活' }}</p >
              <div class="profile-social">
                <a
                  v-for="link in socialLinks"
                  :key="link.name"
                  :href="link.url"
                  target="_blank"
                  class="social-link"
                  :title="link.name"
                >
                  <el-icon :size="24">
                    <component :is="link.icon" />
                  </el-icon>
                </a >
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 技能与专长 -->
    <section class="skills-section">
      <div class="container">
        <h2 class="section-title">技能与专长</h2>
        <div class="skills-grid">
          <div
            v-for="skill in skills"
            :key="skill.name"
            class="skill-card"
          >
            <div class="skill-icon">
              <el-icon :size="40">
                <component :is="skill.icon" />
              </el-icon>
            </div>
            <h3 class="skill-name">{{ skill.name }}</h3>
            <p class="skill-description">{{ skill.description }}</p >
          </div>
        </div>
      </div>
    </section>
    
    <!-- 工作经历 -->
    <section class="experience-section">
      <div class="container">
        <h2 class="section-title">工作经历</h2>
        <div class="timeline">
          <div
            v-for="exp in experiences"
            :key="exp.company"
            class="timeline-item"
          >
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <h3 class="timeline-title">{{ exp.position }}</h3>
                <span class="timeline-period">{{ exp.period }}</span>
              </div>
              <div class="timeline-company">{{ exp.company }}</div>
              <p class="timeline-description">{{ exp.description }}</p >
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 联系方式 -->
    <section class="contact-section">
      <div class="container">
        <h2 class="section-title">联系我</h2>
        <div class="contact-grid">
          <div class="contact-card">
            <el-icon :size="32" class="contact-icon"><Message /></el-icon>
            <h3 class="contact-title">邮箱</h3>
            <p class="contact-value">{{ contactInfo.email }}</p >
          </div>
          <div class="contact-card">
            <el-icon :size="32" class="contact-icon"><Location /></el-icon>
            <h3 class="contact-title">地址</h3>
            <p class="contact-value">{{ contactInfo.location }}</p >
          </div>
          <div class="contact-card">
            <el-icon :size="32" class="contact-icon"><Link /></el-icon>
            <h3 class="contact-title">社交媒体</h3>
            <div class="contact-social">
              <a
                v-for="link in socialLinks"
                :key="link.name"
                :href="link.url"
                target="_blank"
                class="social-link"
              >
                {{ link.name }}
              </a >
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBlogStore } from '@/stores'
import { Printer, Brush, Box, Cpu, Message, Location, Link } from '@element-plus/icons-vue'

const blogStore = useBlogStore()

const user = computed(() => blogStore.user)

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const socialLinks = [
  { name: 'GitHub', url: 'https://github.com', icon: Printer },
  { name: '微信', url: '#', icon: Brush },
  { name: 'QQ', url: '#', icon: Box },
  { name: 'Twitter', url: 'https://twitter.com', icon: Cpu }
]

const skills = [
  { name: '前端开发', icon: 'Monitor', description: 'Vue.js, React, TypeScript, CSS预处理器' },
  { name: '后端开发', icon: 'DataAnalysis', description: 'Node.js, Python, Java, 数据库设计' },
  { name: 'DevOps', icon: 'Cloudy', description: 'Docker, CI/CD, 云服务部署' },
  { name: 'UI/UX设计', icon: 'Brush', description: '用户体验设计, 交互设计, 原型制作' }
]

const experiences = [
  {
    company: '某科技公司',
    position: '高级前端工程师',
    period: '2020 - 至今',
    description: '负责公司核心产品的前端架构设计和开发工作，带领团队完成多个大型项目'
  },
  {
    company: '某互联网公司',
    position: '前端开发工程师',
    period: '2018 - 2020',
    description: '参与公司多个产品的开发，主要负责前端模块的实现和性能优化'
  },
  {
    company: '某创业公司',
    position: '全栈工程师',
    period: '2016 - 2018',
    description: '负责整个项目的技术架构，从前端到后端的全栈开发工作'
  }
]

const contactInfo = {
  email: 'contact@example.com',
  location: '中国 · 北京'
}
</script>

<style scoped lang="scss">
.about-page {
  .hero-section {
    text-align: center;
    padding: 80px 0 60px;
    background: linear-gradient(135deg, var(--color-primary), #66b1ff);
    color: white;
    
    .hero-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 16px;
    }
    
    .hero-subtitle {
      font-size: 1.5rem;
      opacity: 0.9;
    }
  }
  
  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .section-title {
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 48px;
    color: var(--color-text);
  }
}

.profile-section {
  padding: 60px 0;
  
  .profile-card {
    background-color: var(--color-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    padding: 40px;
    margin-top: -40px;
  }
  
  .profile-header {
    display: flex;
    align-items: center;
    gap: 32px;
    
    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
      gap: 24px;
    }
  }
  
  .profile-info {
    flex: 1;
    
    .profile-name {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 12px;
      color: var(--color-text);
    }
    
    .profile-bio {
      font-size: 1.125rem;
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin-bottom: 20px;
    }
    
    .profile-social {
      display: flex;
      gap: 16px;
      
      .social-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: var(--color-bg-secondary);
        color: var(--color-text);
        transition: all 0.3s;
        
        &:hover {
          background-color: var(--color-primary);
          color: white;
          transform: translateY(-2px);
        }
      }
    }
  }
}

.skills-section {
  padding: 60px 0;
  background-color: var(--color-bg-secondary);
  
  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 32px;
  }
  
  .skill-card {
    background-color: var(--color-bg);
    border-radius: var(--radius-lg);
    padding: 32px;
    text-align: center;
    box-shadow: var(--shadow-sm);
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }
    
    .skill-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--color-primary), #66b1ff);
      border-radius: 50%;
      margin-bottom: 24px;
      
      .el-icon {
        color: white;
      }
    }
    
    .skill-name {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--color-text);
    }
    
    .skill-description {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      line-height: 1.6;
    }
  }
}

.experience-section {
  padding: 60px 0;
  
  .timeline {
    position: relative;
    max-width: 800px;
    margin: 0 auto;
    
    &::before {
      content: '';
      position: absolute;
      left: 30px;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: var(--color-border);
      
      @media (max-width: 768px) {
        left: 20px;
      }
    }
  }
  
  .timeline-item {
    position: relative;
    padding-left: 80px;
    margin-bottom: 48px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    @media (max-width: 768px) {
      padding-left: 60px;
    }
    
    .timeline-dot {
      position: absolute;
      left: 24px;
      top: 8px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: var(--color-primary);
      border: 3px solid var(--color-bg);
      
      @media (max-width: 768px) {
        left: 14px;
      }
    }
    
    .timeline-content {
      background-color: var(--color-bg);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-sm);
      
      .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
        flex-wrap: wrap;
        gap: 8px;
        
        .timeline-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          color: var(--color-text);
        }
        
        .timeline-period {
          font-size: 0.875rem;
          color: var(--color-primary);
          background-color: rgba(var(--color-primary-rgb), 0.1);
          padding: 4px 12px;
          border-radius: var(--radius-sm);
        }
      }
      
      .timeline-company {
        font-size: 1.125rem;
        font-weight: 500;
        color: var(--color-text-secondary);
        margin-bottom: 12px;
      }
      
      .timeline-description {
        margin: 0;
        color: var(--color-text);
        line-height: 1.6;
      }
    }
  }
}

.contact-section {
  padding: 60px 0;
  background-color: var(--color-bg-secondary);
  
  .contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 32px;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .contact-card {
    background-color: var(--color-bg);
    border-radius: var(--radius-lg);
    padding: 32px;
    text-align: center;
    box-shadow: var(--shadow-sm);
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }
    
    .contact-icon {
      color: var(--color-primary);
      margin-bottom: 20px;
    }
    
    .contact-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--color-text);
    }
    
    .contact-value {
      font-size: 1rem;
      color: var(--color-text-secondary);
      margin-bottom: 0;
    }
    
    .contact-social {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      .social-link {
        color: var(--color-text-secondary);
        text-decoration: none;
        transition: color 0.3s;
        
        &:hover {
          color: var(--color-primary);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .about-page {
    .hero-section {
      padding: 60px 0 40px;
      
      .hero-title {
        font-size: 2.5rem;
      }
      
      .hero-subtitle {
        font-size: 1.25rem;
      }
    }
    
    .section-title {
      font-size: 1.75rem;
      margin-bottom: 32px;
    }
  }
}
</style>