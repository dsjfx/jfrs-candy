<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="copyright">
        &copy; {{ currentYear }} {{ appTitle }}
      </div>
      <div class="footer-links">
        <router-link to="/about" class="footer-link">关于</router-link>
        <span class="separator">|</span>
        <router-link to="/about" class="footer-link">归档</router-link>
        <span class="separator">|</span>
        <router-link to="/about" class="footer-link">订阅</router-link>
        <span class="separator">|</span>
        <router-link to="/about" class="footer-link">联系</router-link>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">

const appTitle = import.meta.env.VITE_APP_FOOT_TITLE || '个人博客'
const currentYear = new Date().getFullYear()


</script>

<style scoped lang="scss">
$breakpoint-mobile: 768px;

.footer {
  margin-top: 40px;
  padding: 15px 0;
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);

  @media (max-width: $breakpoint-mobile) {
    padding: 10px;
  }
}

.footer-content {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  justify-content: space-between;
  align-items: center;
  color: var(--text-footer);
  font-size: 0.9rem;

  .copyright {
    display: flex;
    justify-content: center;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  .footer-links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;

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
// }</style>