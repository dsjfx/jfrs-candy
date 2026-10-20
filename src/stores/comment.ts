import { computed, readonly, ref } from "vue";
import { defineStore } from "pinia";
import { commentApi } from "@/api";
import type { Comment, CommentForm, CommentParams, CommentUser, ReportReason } from "@/types/comment";
import type { PageResult } from "@/types/api";
import { defaultPageResult } from "@/utils/cabinet";
import { useUserStore } from "./user";

export const useCommentStore = defineStore('coment', () => {
  const comments = ref<Comment[]>([])
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const hasMore = ref(false)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)
  const currentSort = ref<'newest' | 'oldest' | 'popular'>('newest')
  const currentArticleId = ref<string | number>('')
  const blockedUsers = ref<Set<string>>(new Set()) // 已屏蔽用户列表（本地缓存）

  const commentsCount = readonly(total)
  const isEmpty = computed(() => !isLoading.value && comments.value.length === 0)

  // 排序后的评论（前端）
  const sortedComments = computed(() => {
    const list = [...comments.value]
    switch (currentSort.value) {
      case 'newest':
        return list.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      case 'oldest':
        return list.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      case 'popular':
        return list.sort((a, b) => (b.likes || 0) - (a.likes || 0))
      default:
        return list
    }
  })

  const currentUser = computed<{
    id?: string | number
    name: string
    email: string
    isAdmin: boolean
  } | null>(() => {
    const userStore = useUserStore()
    const user = userStore.userInfo

    if (user) {
      return {
        id: user.id,
        name: user.nickname,
        email: user.email,
        isAdmin: user.roles?.includes('admin') ?? false,
      }
    }

    const guest = JSON.parse(localStorage.getItem('guest_info') || 'null')
    if (guest && guest.id) {
      return {
        id: guest.id,
        name: guest.name,
        email: guest.email,
        isAdmin: false,
      }
    }

    return null
  })

  // 获取评论
  const fetchComments = async (
    articleId: string | number,
    payload: Pick<
      CommentParams,
      'current' | 'size' | 'sort' | 'reset' | 'status' | 'viewerId' | 'viewerEmail'
    > = {}
  ): Promise<PageResult<Comment>> => {
    const {
      current = 1,
      size = 10,
      sort = currentSort.value,
      reset = true,
      status = 'approved',
      viewerId, viewerEmail
    } = payload

    isLoading.value = true
    error.value = null
    currentArticleId.value = articleId

    const result = ref<PageResult<Comment>>(defaultPageResult<Comment>())

    try {
      const response = await commentApi.getComments(articleId, current, size,
        { viewerId, viewerEmail }, sort, status)

      if (response && response.data) {
        result.value = response.data
        if (reset || current === 1) {
          comments.value = response.data.records || []
        } else {
          comments.value.push(...(response.data.records || []))
        }
      }

      currentPage.value = current
      pageSize.value = size
      total.value = response.data.pagination?.total || 0
      hasMore.value = response.data.pagination?.hasNext || false
      currentSort.value = sort

      return result.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取评论失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 加载更多评论
  const loadMoreComments = async (options: { viewerId?: string, viewerEmail?: string }) => {
    if (isLoadingMore.value || !hasMore.value) return

    isLoadingMore.value = true

    try {
      const nextPage = currentPage.value + 1
      const response = await commentApi.getComments(
        currentArticleId.value,
        nextPage,
        pageSize.value,
        options,
        currentSort.value
      )

      comments.value.push(...(response.data.records || []))
      currentPage.value = nextPage
      hasMore.value = response.data.pagination?.hasNext || false

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载更多失败'
      throw err
    } finally {
      isLoadingMore.value = false
    }
  }

  // 新增评论
  const addComment = async (
    articleId: string | number,
    data: CommentForm
  ): Promise<Comment> => {
    isSubmitting.value = true
    error.value = null

    try {
      const result = await commentApi.createComment(articleId, data)

      if (result) {

        // 如果是顶级评论，直接添加到列表
        if (!data.parentId) {
          comments.value.unshift(result)
          total.value++
        } else {
          // 如果是回复，找到父评论并添加
          const parent = findComment(data.parentId)
          if (parent) {
            if (!parent.replies) parent.replies = []
            parent.replies.push(result)
          }
          total.value++
        }

      }

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发表评论失败'
      throw err
    }
  }

  // 更新评论（编辑）
  const updateComment = async (
    commentId: string,
    data: Pick<CommentForm, 'content' | 'status'>
  ) => {
    isSubmitting.value = true
    error.value = null

    try {
      const updated = await commentApi.updateComment(commentId, data)

      // 找到并更新评论
      const comment = findComment(commentId)
      if (comment) {
        comment.content = updated.content
        comment.updatedAt = updated.updatedAt
        comment.isEdited = true
      } else {
        // 本地找不到评论，可能是异步问题
        console.warn(`评论 ${commentId} 在本地未找到，可能需要刷新`)
        // 可选：刷新列表
        await refreshComments()
      }

      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新评论失败'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  // 删除评论
  const removeComment = async (commentId: string, params: { userId: string; }) => {
    isSubmitting.value = true
    error.value = null

    try {
      await commentApi.deleteComment(commentId, params)

      // 从列表中移除
      removeCommentFromList(commentId)
      total.value = Math.max(0, total.value - 1)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除评论失败'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  // 点赞/取消点赞
  const toggleLike = async (commentId: string) => {
    try {
      await commentApi.likeComment(commentId)

      // 更新本地状态
      const comment = findComment(commentId)
      if (comment) {
        if (comment.isLiked) {
          comment.likes = Math.max(0, (comment.likes || 0) - 1)
        } else {
          comment.likes = (comment.likes || 0) + 1
        }
        comment.isLiked = !comment.isLiked
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '点赞失败'
      throw err
    }
  }

  // 举报评论
  const reportComment = async (
    commentId: string, reason: ReportReason, description?: string
  ) => {
    isSubmitting.value = true
    error.value = null

    try {
      await commentApi.reportComment({
        commentId,
        reason,
        description
      })

      // 本地标记为已举报（避免重复举报）
      const comment = findComment(commentId)
      if (comment) {
        comment.isReported = true
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '举报失败'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  // 从 localStorage 加载屏蔽列表
  const loadBlockedUsers = () => {
    try {
      const saved = localStorage.getItem('blocked_users')
      if (saved) {
        const list = JSON.parse(saved)
        blockedUsers.value = new Set(list)
      }
    } catch (err) {
      console.error('加载屏蔽列表失败:', err)
    }
  }

  // 保存屏蔽列表到 localStorage
  const saveBlockedUsers = () => {
    try {
      localStorage.setItem(
        'blocked_users',
        JSON.stringify([...blockedUsers.value])
      )
    } catch (err) {
      console.error('保存屏蔽列表失败:', err)
    }
  }

  // 屏蔽用户
  const blockUser = async (id: string | number | undefined, comment: Comment) => {
    isSubmitting.value = true
    error.value = null

    try {
      if (!id) {
        throw new Error('当前用户异常')
      }

      const blockedId = comment.user.id
      if (!blockedId) {
        throw new Error('无法屏蔽该用户（缺少用户标识）')
      }

      await commentApi.blockUser(`${id}`, `${blockedId}`)

      blockedUsers.value.add(`${blockedId}`)
      saveBlockedUsers()

      // 屏蔽后立即从列表移除该用户评论
      filterBlockedComments()

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '屏蔽失败'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  // 取消屏蔽
  const unblockUser = async (id: string, email: string) => {
    isSubmitting.value = true
    error.value = null

    try {
      await commentApi.unblockUser(id)

      blockedUsers.value.delete(email)
      saveBlockedUsers()

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '取消屏蔽失败'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  // 过滤被屏蔽用户的评论
  const filterBlockedComments = () => {
    if (blockedUsers.value.size === 0) return

    const filterFn = (list: Comment[]): Comment[] => {
      return list
        .filter(c => {
          const ids = [c.user.id].filter(Boolean) as string[]
          return !ids.some(id => blockedUsers.value.has(id))
        })
        .map(c => ({
          ...c,
          replies: c.replies ? filterFn(c.replies) : []
        }))
    }

    comments.value = filterFn(comments.value)
  }

  // 检查是否已屏蔽
  const isUserBlocked = (comment: Comment): boolean => {
    const ids = [comment.user.id, comment.user.email].filter(Boolean) as string[]
    return ids.some(id => blockedUsers.value.has(id))
  }

  // 检查是否已举报
  const isCommentReported = (commentId: string): boolean => {
    const comment = findComment(commentId)
    return comment?.isReported || false
  }

  // 切换排序
  const changeSort = async (sort: 'newest' | 'oldest' | 'popular') => {
    if (currentSort.value === sort) return

    currentSort.value = sort
    currentPage.value = 1

    // 重新获取数据
    return await fetchComments(currentArticleId.value, {
      current: 1,
      sort,
      reset: true
    })
  }

  // 刷新评论
  const refreshComments = async () => {
    return await fetchComments(currentArticleId.value, {
      current: 1,
      sort: currentSort.value,
      reset: true
    })
  }

  // 滚动到指定评论
  const scrollToComment = (commentId: string, options: {
    behavior?: ScrollBehavior
    offset?: number
    highlight?: boolean
  } = {}) => {
    const {
      behavior = 'smooth',
      offset = 100,   // 顶部偏移量（导航栏高度）
      highlight = true
    } = options

    // 延时等待 DOM 渲染
    setTimeout(() => {
      const element = document.getElementById(`comment-${commentId}`)
      if (!element) {
        console.warn(`评论元素未找到: comment-${commentId}`)
        return
      }

      // 计算位置
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      window.scrollTo({
        top: elementPosition - offset,
        behavior
      })

      // 高亮效果
      if (highlight) {
        element.classList.add('highlight')
        setTimeout(() => {
          element.classList.remove('highlight')
        }, 2000)
      }
    }, 100)
  }

  // 辅助方法 Assistants

  // 查找评论（递归） 
  const findComment = (
    commentId: string,
    list: Comment[] = comments.value
  ): Comment | null => {
    for (const comment of list) {
      if (`${comment.id}` === `${commentId}`) {
        return comment
      }
      if (comment.replies && comment.replies.length > 0) {
        const found = findComment(commentId, comment.replies)
        if (found) return found
      }
    }
    return null
  }

  // 从列表中移除评论
  const removeCommentFromList = (
    commentId: string,
    list: Comment[] = comments.value
  ): boolean => {
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (`${item?.id}` === `${commentId}`) {
        list.splice(i, 1)
        return true
      }
      if (item?.replies && item.replies.length > 0) {
        const removed = removeCommentFromList(commentId, item?.replies!)
        if (removed) return true
      }
    }
    return false
  }

  // 清空评论
  const clearComments = () => {
    comments.value = []
    currentPage.value = 1
    total.value = 0
    hasMore.value = false
    error.value = null
  }

  // 重置状态
  const reset = () => {
    clearComments()
    isLoading.value = false
    isLoadingMore.value = false
    isSubmitting.value = false
    currentSort.value = 'newest'
    currentArticleId.value = ''
  }

  return {
    comments,
    sortedComments,
    currentPage,
    pageSize,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    isSubmitting,
    error,
    currentSort,
    commentsCount,
    isEmpty,
    currentArticleId,
    blockedUsers,
    currentUser,

    fetchComments,
    loadMoreComments,
    addComment,
    updateComment,
    removeComment,
    toggleLike,
    reportComment,
    loadBlockedUsers,
    blockUser,
    unblockUser,
    isUserBlocked,
    isCommentReported,
    filterBlockedComments,
    saveBlockedUsers,
    scrollToComment,
    changeSort,
    refreshComments,
    clearComments,
    reset,
  }
});