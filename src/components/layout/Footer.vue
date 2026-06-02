<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-left">
        <div class="footer-copyright">
          &copy; {{ currentYear }}
          <span class="footer-title">
            {{ appName }}
          </span>
          <span class="separator">|</span>
          <span class="footer-slogan">
            {{ appSlogan }}
          </span>
        </div>
        <div class="footer-beian">
          <a v-if="icpLicense" href="https://beian.miit.gov.cn/" target="_blank">
            {{ icpLicense }}
          </a>
          <a v-if="publicSecurityLicense" href="http://www.beian.gov.cn/" target="_blank">
            {{ publicSecurityLicense }}
          </a>
        </div>
      </div>

      <div class="footer-right">

        <!-- <div class="footer-socials">
          <a v-for="s in social" :key="s.href" :href="s.href" class="social-icon" target="_blank" rel="noopener">
            <FaIcon :icon="s.icon" />
          </a>
        </div> -->

        <div class="footer-links">
          <template v-for="(link, idx) in navLinks" :key="link.to">
            <router-link :to="link.to" class="footer-link">{{ link.label }}</router-link>
            <span v-if="idx < navLinks.length - 1" class="separator">|</span>
          </template>
        </div>

        <el-tooltip content="回到顶部" placement="top">
          <button v-show="showBackToTop" class="back-to-top" @click="scrollToTop" aria-label="回到顶部">
            <FaIcon :icon="faArrowUp" />
          </button>
        </el-tooltip>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faWeibo } from '@fortawesome/free-brands-svg-icons'
import { useUserStore } from '@/stores/user'
import { useAppName } from '@/composables/useAppName'

const userStore = useUserStore()

const navLinks = [
  { label: '关于', to: '/about' },
  { label: '归档', to: '/archive' },
  { label: '联系', to: '/about#contact' }
]

const social = [
  { icon: faGithub, href: 'https://github.com/' },
  { icon: faWeibo, href: 'https://weibo.com/' }
]

const showBackToTop = ref(false)
const userId = ref<number>(1)
const icpLicense = ref<string | null>();
const publicSecurityLicense = ref<string | null>();

const { appName } = useAppName()
const appSlogan = import.meta.env.VITE_APP_TITLE_SLOGAN || '记记录生活点滴'
const currentYear = new Date().getFullYear()

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

const fetchSimpleUser = async () => {
  try {
    await userStore.getSimpleUser({})
    let simpleUser = userStore.simpleUser
    if (simpleUser?.icpLicense) {
      icpLicense.value = simpleUser.icpLicense
    }
    if (simpleUser?.publicSecurityLicense) {
      publicSecurityLicense.value = simpleUser.publicSecurityLicense
    }
  } catch (error) {
    console.log(error)
  }
}

onMounted(async () => {
  await fetchSimpleUser()

  window.addEventListener('scroll', handleScroll, { passive: true })
  // initialize
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

</script>

<style scoped lang="scss">
$breakpoint-mobile: 768px;

.footer {
  margin-top: 40px;
  padding: 10px 0;
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);

  @media (max-width: $breakpoint-mobile) {
    padding: 10px;
  }
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  justify-content: space-between;
  align-items: center;
  // max-width: 1200px;
  margin: 0 20px;
  // padding: 0 20px;
  color: var(--text-footer);
  font-size: 0.9rem;
}

.footer-left {
  display: flex;
  flex-direction: row;
  gap: 8px;

  .footer-copyright {
    display: flex;
    justify-content: center;
    color: var(--color-text-secondary);
    font-size: 0.875rem;

    .footer-title {
      margin: 0 5px;
    }

    .footer-slogan {
      margin-left: 5px;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .separator {
      margin: 0 5px;
      color: var(--color-border);
    }
  }

  .footer-beian {
    margin-left: 20px;
    display: inline-block;
    font-size: 0.875rem;

    a {
      color: var(--text-footer);

      &:hover {
        color: var(--text-hover);
      }
    }
  }
}

.footer-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .footer-links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-left: 10px;

    @media (max-width: $breakpoint-mobile) {
      display: none;
    }

    .separator {
      color: var(--color-border);
    }

    .footer-link {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: color 0.3s;

      &:hover {
        color: var(--color-primary);
      }
    }
  }
}

.footer-socials {
  display: flex;
  gap: 8px;
  margin-right: 10px;

  .social-icon {
    color: var(--color-text-secondary);
    display: inline-flex;
    padding: 4px;
    border-radius: 6px;
    transition: background 0.2s, color 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
      color: var(--color-primary);
    }
  }
}

.back-to-top {
  position: fixed;
  right: 1.5rem;
  bottom: 3.5rem;
  z-index: 1200;
  width: 44px;
  height: 44px;
  padding: 0;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  transition: transform 180ms ease, opacity 180ms ease;

  &:hover {
    transform: translateY(-4px);
  }

  @media (max-width: 768px) {
    right: 1rem;
    bottom: 1rem;
    width: 40px;
    height: 40px;
  }
}

// .footer-links {
//   list-style: none;
//   margin: 0;
//   padding: 0;

//   li {
//     margin-bottom: 12px;

//     &:last-child {
//       margin-bottom: 0;
//     }
//   }

//   .footer-link {
//     color: var(--color-text-secondary);
//     text-decoration: none;
//     transition: color 0.3s;

//     &:hover {
//       color: var(--color-primary);
//     }
//   }
// }

// @media (max-width: 768px) {
//   .footer {
//     padding: 32px 0 20px;
//   }

//   .footer-bottom {
//     flex-direction: column;
//     gap: 16px;
//     text-align: center;
//   }
// }
</style>