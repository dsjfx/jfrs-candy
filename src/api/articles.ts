import http from './request'
import type { Article } from '@/types/article'
import type { Adjacent, PageParams, PageResult, ResponseData } from '@/types/api'
import mockArticle, { getArticleDetail } from '@/mock/mockArticle'
import ResponseFactory from '@/utils/responseFactory'
import { accessUrl } from '@/utils/cabinet'

function makeUrl(url: string) {
  return accessUrl('A', url)
}

// 获取文章列表
export const getBlogs = async (
  page: PageParams = {
    current: 1,
    size: 10,
    sort: 'createAt'
  }): Promise<ResponseData<PageResult<Article>>> => {
  let result = ResponseFactory.page<Article>()

  const response = await http.get(makeUrl(`/list`),
    {
      ...page
    })

  if (response.data) {
    result = response.data as ResponseData<PageResult<Article>>
  }

  return result
}

// 获取文章详情
export const getBolgById = async (id: string): Promise<ResponseData<Article>> => {
  let result = ResponseFactory.success<Article>({} as Article)

  const response = await http.get(makeUrl(`/view/${id}`))

  if (response.data) {
    result = response.data as ResponseData<Article>
  }
  return result
  // return mockArticle.getArticleDetail()
}

// 获取相关文章
export const getRelatedBlogs = async (articleId: string): Promise<ResponseData<Article[]>> => {
  let result = ResponseFactory.success<Article[]>([] as Article[])

  const response = await http.get(makeUrl(`/related/${articleId}`))
  if (response.data) {
    result = response.data as ResponseData<Article[]>
  }

  return result
  // return [getArticleDetail]
}

export const getAdjacentBlogs = async (articleId: string): Promise<ResponseData<Adjacent<Article>>> => {
  let result = ResponseFactory.success<Adjacent<Article>>({} as Adjacent<Article>)

  const response = await http.get(makeUrl(`/adjacent/${articleId}`))
  if (response.data) {
    result = response.data as ResponseData<Adjacent<Article>>
  }

  return result
}