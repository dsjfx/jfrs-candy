import http from "./request"
import type { Article, Tag } from "@/types"
import type { PageResult, ResponseData } from "@/types/api"
import { jAccess } from "@/utils/cabinet"

const jMake = jAccess('TA')

/**
 * 获取所有标签列表
 * 对应路由：GET /list
 */
export const fetchAllTags = async (): Promise<ResponseData<Tag[]>> => {
  const res = await http.get(jMake('/list'))
  if (res.data.code !== 200) {
    throw new Error(res.data.message || '获取标签列表失败')
  }
  return res.data
}

/**
 * 获取热门标签
 * 对应路由：GET /popular
 */
export const fetchPopularTags = async (
  limit: number = 5
): Promise<ResponseData<Tag[]>> => {
  const res = await http.get(jMake('/popular'),
    {
      size: limit
    }
  )
  if (res.data.code !== 200) {
    throw new Error(res.data.message || '获取热门标签失败')
  }
  return res.data
}

/**
 * 搜索标签
 * 对应路由：GET /search
 * @param keyword 搜索关键词
 */
export const searchTags = async (keyword: string): Promise<ResponseData<Tag[]>> => {
  const res = await http.get(jMake('/search'), {
    params: { keyword }
  })
  if (res.data.code !== 200) {
    throw new Error(res.data.message || '搜索标签失败')
  }
  return res.data
}

/**
 * 获取单个标签详情
 * 对应路由：GET /:id
 * @param id 标签ID (或者是 slug，取决于你后端的处理)
 */
export const fetchTagById = async (id: number | string): Promise<ResponseData<Tag>> => {
  const res = await http.get(jMake(`/${id}`))
  if (res.data.code !== 200) {
    throw new Error(res.data.message || '获取标签详情失败')
  }
  return res.data
}

/**
 * 获取该标签下的博客列表 (带分页)
 * 对应路由：GET /:id/blogs
 * @param id 标签ID
 * @param page 页码
 * @param pageSize 每页数量
 */
export const fetchTagBlogs = async (
  id: number | string,
  page: { current: number, size: number }
): Promise<ResponseData<PageResult<Article>>> => {
  const res = await http.get(jMake(`/${id}/blogs`),
    {
      ...page
    }
  )
  if (res.data.code !== 200) {
    throw new Error(res.data.message || '获取标签下的文章失败')
  }
  return res.data
}