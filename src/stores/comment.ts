import { ref } from "vue";
import { defineStore } from "pinia";
import type { Comment } from "@/types/comment";
import { commentApi } from "@/api";
import type { PageResult } from "@/types/api";
import { defaultPageResult } from "@/utils/cabinet";

export const useCommentStore = defineStore('coment', () => {
  const commentPageData = ref<PageResult<Comment>>(defaultPageResult<Comment>())
  const comments = ref<Comment[]>([] as Comment[])

  // 获取评论
  const fetchComments = async (payload = { current: 1, size: 10, articleId: '' }) => {
    const current: number = payload.current
    const size: number = payload.size
    const articleId = payload.articleId

    try {
      const data = await commentApi.getComments(articleId, current, size)
      if (data && data.data) {
        commentPageData.value = data.data
        comments.value = data.data.records
      }
    } catch (error) {
      console.log(error)
      throw new Error('获取评论失败')
    }
  }

  return {
    comments,
    commentPageData,

    fetchComments,
  }
});