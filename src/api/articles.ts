import http from './request'
import type { Article, ReactionResponse } from '@/types/article'
import type { Adjacent, PageParams, PageResult, ResponseData } from '@/types/api'
import mockArticle, { getArticleDetail } from '@/mock/mockArticle'
import ResponseFactory from '@/utils/responseFactory'
import { jAccess, reactionTranslate } from '@/utils/cabinet'

const jMake = jAccess('BL')

/**
 * 获取文章列表
 * @param page 
 * @returns 
 */
export const getBlogs = async (
  page: PageParams = {} as PageParams): Promise<ResponseData<PageResult<Article>>> => {
  const {
    current = 1,
    size = 10,
    sort = 'createAt',
    userId = null,
    anonymousId = null,
    tagId = null,
    categoryId = null,
    status = 'published',
    search = ''
  } = page;
  console.log('page:', page)
  const response = await http.get(jMake(`/list`),
    {
      current, size, sort, userId, anonymousId, tagId, categoryId, status, search
    }
  )

  const result = response.data as ResponseData<PageResult<Article>>
  if (result.code !== 200) {
    throw new Error(result.message || '获取文章列表失败')
  }

  return result
}

// 获取文章详情
export const getBolgById = async (
  id: string,
  userId: string | null,
  anonymousId: string | null
): Promise<ResponseData<Article>> => {
  let result = ResponseFactory.success<Article>({} as Article)

  const response = await http.get(jMake(`/view/${id}`),
    {
      userId, anonymousId
    }
  )

  if (response.data) {
    result = response.data as ResponseData<Article>
  }
  return result
  // return mockArticle.getArticleDetail()
}

// 获取相关文章
export const getRelatedBlogs = async (articleId: string): Promise<ResponseData<Article[]>> => {
  let result = ResponseFactory.success<Article[]>([] as Article[])

  const response = await http.get(jMake(`/related/${articleId}`))
  if (response.data) {
    result = response.data as ResponseData<Article[]>
  }

  return result
  // return [getArticleDetail]
}

export const getAdjacentBlogs = async (articleId: string): Promise<ResponseData<Adjacent<Article>>> => {
  let result = ResponseFactory.success<Adjacent<Article>>({} as Adjacent<Article>)

  const response = await http.get(jMake(`/adjacent/${articleId}`))
  if (response.data) {
    result = response.data as ResponseData<Adjacent<Article>>
  }

  return result
}

export const reactionArticle = async (id: string, payload:
  {
    type: 1 | -1 | 0,
    userId: string | null,
    anonymousId: string | null
  }
): Promise<ReactionResponse> => {

  const response = await http.post(jMake(`/reactions/toggle`),
    {
      blogId: id,
      ...payload
    }
  )

  const res = response.data
  if (!res || res.code !== 200) {
    throw new Error(res?.message || `${payload.type === 1 ? '点赞' : '踩踏'}失败`)
  }

  const result = res.data as ReactionResponse
  result['reactionType'] = reactionTranslate(result.reaction)

  return result
}

