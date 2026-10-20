<template>
  <div class="comment-empty">
    <div class="empty-icon">💭</div>
    <p class="empty-text">还没有评论，快来抢沙发吧！</p>
    <p class="empty-sub">发表您的想法，与大家交流互动</p>
  </div>
</template>

<style lang="scss" scoped>
.comment-empty {
  text-align: center;
  padding: 3rem 1rem;

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 1.1rem;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  .empty-sub {
    font-size: 0.95rem;
    color: #9ca3af;
  }
}
</style>