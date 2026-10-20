<template>
  <div class="comment-skeleton">
    <div class="skeleton-header">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-info">
        <div class="skeleton-line short"></div>
        <div class="skeleton-line tiny"></div>
      </div>
    </div>
    <div class="skeleton-content">
      <div class="skeleton-line"></div>
      <div class="skeleton-line medium"></div>
    </div>
    <div class="skeleton-footer">
      <div class="skeleton-line tiny"></div>
      <div class="skeleton-line tiny"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.comment-skeleton {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-header {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.skeleton-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-info {
  flex: 1;
}

.skeleton-line {
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  margin-bottom: 0.5rem;

  &.short {
    width: 40%;
  }

  &.medium {
    width: 70%;
  }

  &.tiny {
    width: 20%;
    height: 12px;
  }
}

.skeleton-footer {
  display: flex;
  gap: 1rem;
}

@keyframes skeleton-pulse {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>