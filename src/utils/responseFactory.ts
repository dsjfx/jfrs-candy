import type { PageResult, ResponseData } from "@/types/api";

// 响应工厂类
class ResponseFactory {
  // 成功响应
  static success<T>(data: T, message: string = '操作成功'): ResponseData<T> {
    return {
      code: 200,
      data,
      message,
      success: true
    }
  }

  // 错误响应
  static error<T = null>(message: string = '操作失败', code = 500, data?: T): ResponseData<T> {
    return {
      code,
      data: data ?? (null as T),
      message,
      success: false
    }
  }

  // 分页响应
  static page<T>(pageData?: Partial<PageResult<T>>): ResponseData<PageResult<T>> {
    return this.success({
      records: [],
      pagination: {
        total: 1,
        size: 10,
        current: 1,
        ...pageData
      }
    })
  }

  // 列表响应
  static list<T>(items: T[] = []): ResponseData<T[]> {
    return this.success(items)
  }

  // 空响应
  static empty(): ResponseData<null> {
    return this.success(null, '暂无数据')
  }
}

export default ResponseFactory