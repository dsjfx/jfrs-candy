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

// 统计文字数量（不包括 HTML 标签）
export function getDisplayWordCount(htmlContent: string): number {
  const plainText = getPlainText(htmlContent);

  // 普通展示用这个就够了
  return plainText.length;
}

function getPlainText(html: string): string {
  // 创建临时元素提取纯文本
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

// Medium 风格的阅读时间估算
export function getReadTimeMedium(htmlContent: string, wpm: number): string {
  // 1. 基础字数
  const plainText = getPlainText(htmlContent);
  let adjustedWordCount = plainText.length;

  // 2. 图片调整（每张图 +10 秒 ≈ 50 字视觉开销）
  const imageCount = (htmlContent.match(/<img/g) || []).length;
  adjustedWordCount += imageCount * 50;

  // 3. 代码块调整（用户会放慢）
  const codeCount = (htmlContent.match(/<pre>/g) || []).length;
  adjustedWordCount += codeCount * 80;

  // 4. 标题调整（小标题帮助加快阅读，减少计数）
  const headingCount = (htmlContent.match(/<h[2-3]>/g) || []).length;
  adjustedWordCount -= headingCount * 20;

  // 5. 计算分钟数
  let minutes = Math.ceil(adjustedWordCount / wpm);

  // 6. 人性化边界
  minutes = Math.max(1, Math.min(minutes, 60)); // 最多 1 小时

  return formatReadTime(minutes || 0);
}

function formatReadTime(minutes: number): string {
  if (minutes < 1) return '小于 1 分钟';
  if (minutes === 1) return '1 分钟';
  return `${minutes} 分钟`;
}

// helper: convert hex or rgb string to 'r,g,b' string for CSS usage
export function tagColorRgb(color?: string | null) {
  if (!color) return '5,150,105' // fallback to brand green
  // hex #rrggbb
  const hexMatch = String(color).trim().match(/^#?([0-9a-f]{6})$/i)
  if (hexMatch) {
    const v = hexMatch[1]
    if (v !== undefined && v.length) {
      const r = parseInt(v.slice(0, 2), 16)
      const g = parseInt(v.slice(2, 4), 16)
      const b = parseInt(v.slice(4, 6), 16)
      return `${r},${g},${b}`
    }
  }
  // rgb(r,g,b) or rgba(...)
  const rgbMatch = String(color).match(/(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/)
  if (rgbMatch) {
    return `${rgbMatch[1]},${rgbMatch[2]},${rgbMatch[3]}`
  }
  return '5,150,105'
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
  'BL': '/blog',
  'CO': '/comment',
  'AU': '/auth',
}

export function accessUrl(code: string, url: string) {
  return `${MAP_URL[code]}${url}`
}

const subject = import.meta.env.VITE_APP_SUBJECT || ''
// daily app
export const isDaily = subject === 'daily'
// note app
export const isNote = subject === 'note'

export default {
  isDaily,
  isNote,
  delay,
  formatDate,
  formatDate2,
  markdownToHtml,
  defaultAdjacent,
  defaultPageResult,
  defaultResponseData
}