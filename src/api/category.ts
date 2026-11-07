import http from "./request"
import type { PageParams, PageResult, ResponseData } from "@/types/api"
import type { Article, Category } from "@/types/article"
import { jAccess } from "@/utils/cabinet"

const jMake = jAccess('CA')

/**
 * 获取所有分类 (用于归档页、侧边栏等)
 * GET /list
 */
export const getAllCategories = async (
  page: PageParams = {
    current: 1,
    size: 10,
    sort: 'createAt'
  }): Promise<ResponseData<Category[]>> => {
  const res = await http.get(
    jMake('/list'),
    { ...page }
  )

  const data = res.data as ResponseData<Category[]>
  if (data.code !== 200) throw new Error(data.message)

  return data
}

/**
 * 获取热门分类 (例如侧边栏展示，可能按文章数排序)
 * GET /popular
 */
export const getPopularCategories = async (
  limit: number = 5
): Promise<ResponseData<Category[]>> => {
  const res = await http.get(jMake('/popular'),
    {
      size: limit
    }
  )

  const data = res.data as ResponseData<Category[]>
  if (data.code !== 200) throw new Error(data.message)

  return data
}

/**
 * 搜索分类 (可选，若前端有搜索框)
 * GET /search
 */
export const searchCategories = async (
  param: { current: number, size: number, keyword: string } = {
    current: 1,
    size: 10,
    keyword: ''
  }
): Promise<ResponseData<PageResult<Category>>> => {
  const res = await http.get(jMake('/search'),
    {
      ...param
    }
  )

  const data = res.data as ResponseData<PageResult<Category>>
  if (data.code !== 200) throw new Error(data.message)

  return data
}

/**
 * 获取单个分类详情 (例如进入分类页时展示分类头部的介绍)
 * GET /:id
 */
export const getCategoryById = async (id: number): Promise<Category> => {
  const res = await http.get(jMake(`/${id}`))

  const data = res.data as ResponseData<Category>
  if (data.code !== 200) throw new Error(data.message)

  return data.data
}

/**
 * 获取某个分类下的博客列表 (分类详情页的核心)
 * GET /:id/blogs
 */
export const getCategoryBlogs = async (
  id: number,
  page: PageParams = {
    current: 1,
    size: 10,
    sort: 'createAt'
  }
): Promise<PageResult<Article>> => {
  const res = await http.get(jMake(`/${id}/blogs`), {
    params: { ...page }
  })

  const data = res.data as ResponseData<PageResult<Article>>
  if (data.code !== 200) throw new Error(data.message)
  return data.data
}