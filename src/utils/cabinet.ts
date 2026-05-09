import { marked } from 'marked';
import DOMPurify, { type Config } from 'dompurify';
import type { Adjacent, PageResult, ResponseData } from '@/types/api';
import { dataType } from 'element-plus/es/components/table-v2/src/common.mjs';

// 处理博客内容的渲染和安全问题
export async function markdownToHtml(markdown: string, options?: Config): Promise<string> {
  if (!markdown) return '';

  try {
    // Marked 4.x 默认返回 Promise
    const rawHtml = await marked(markdown);
    const cleanHtml = DOMPurify.sanitize(rawHtml, options);
    return cleanHtml;
  } catch (error) {
    console.error('Markdown 转换失败:', error);
    return `<p class="error">内容解析失败</p>`;
  }
}

/**
 * 默认分页数据
 * @returns 分页数据
 */
export function defaultPageResult<T = any>(): PageResult<T> {
  const result: PageResult<T> = {
    records: [] as T[],
    pagination: {
      total: 1,
      size: 10,
      current: 1
    }
  }
  return result
}

/**
 * 默认响应数据
 * @returns 响应数据
 */
export function defaultResponseData<T = any>(): ResponseData<T> {
  const data: ResponseData<T> = {
    code: 200,
    message: '操作成功',
    success: true,
    data: null as T
  }
  return data
}

/**
 * 默认相邻数据
 * @returns 
 */
export function defaultAdjacent<T = any>(): Adjacent<T> {
  const data: Adjacent<T> = {
    prev: {} as T,
    next: {} as T,
  }
  return data
}

// 延迟
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 格式化时间
export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export const formatDate2 = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

const MAP_URL: Record<string, string> = {
  'A': '/jdmk/blog',
  'C': '/jdmk/comment',
}

export function accessUrl(code: string, url: string) {
  return `${MAP_URL[code]}${url}`
}

// 默认参数值
export const CONS_CURRENT = 1

export const CONS_PAGESIZE = 10

export default {
  CONS_CURRENT,
  CONS_PAGESIZE,
  delay,
  formatDate,
  formatDate2,
  markdownToHtml,
  defaultAdjacent,
  defaultPageResult,
  defaultResponseData
}