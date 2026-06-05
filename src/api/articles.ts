import http from './request'
import type { ArchiveResponse, Article, ladyArticleParams } from '@/types/article'
import type { Adjacent, PageParams, PageResult, ResponseData } from '@/types/api'
import mockArticle, { getArticleDetail } from '@/mock/mockArticle'
import ResponseFactory from '@/utils/responseFactory'
import { accessUrl } from '@/utils/cabinet'

function makeUrl(url: string) {
  return accessUrl('BL', url)
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

export const getArchive = async ({ year, month, limit = 5 }:
  { year?: number; month?: number, limit?: number }): Promise<ResponseData<ArchiveResponse>> => {
  let result = ResponseFactory.success<ArchiveResponse>({} as ArchiveResponse)

  const response = await http.get(makeUrl(`/archive`), { year, month, limit })
  if (response.data) {
    result = response.data as ResponseData<ArchiveResponse>
  }

  return result
}

export const getArchiveMore = async (
  {
    years,
    startYear,
    endYear,
    limit = 5
  }: ladyArticleParams): Promise<ResponseData<ArchiveResponse>> => {
  let result = ResponseFactory.success<ArchiveResponse>({} as ArchiveResponse)

  const response = await http.get(makeUrl(`/archive/more`), { years, startYear, endYear, limit })
  if (response.data) {
    result = response.data as ResponseData<ArchiveResponse>
  }

  return result
}

export const likeArticle = async ({ id }: { id: number }): Promise<ResponseData<null>> => {
  let result = ResponseFactory.success<null>(null)

  const response = await http.post(makeUrl(`/like`), { id })
  if (response.data) {
    result = response.data as ResponseData<null>
  }

  return result
}

export const dislikeArticle = async ({ id }: { id: number }): Promise<ResponseData<null>> => {
  let result = ResponseFactory.success<null>(null)

  const response = await http.post(makeUrl(`/dislike`), { id })
  if (response.data) {
    result = response.data as ResponseData<null>
  }

  return result
}