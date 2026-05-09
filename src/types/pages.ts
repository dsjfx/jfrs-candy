// 分页属性
export interface PageProps {
    ///// ~~~~~ 必需参数

    // 当前页
    current: number
    // 每页数量
    pageSize: number
    // 总记录数
    total: number

    ///// ~~~~~ 可选参数

    // 最大显示页
    maxVisiblePages?: number
    // 是否显示图标
    showIcons?: boolean
    // 是否显示文字
    showText?: boolean
    // 是否显示跳转
    showJump?: boolean
    // 是否显示页面大小选择
    showPageSize?: boolean
    // 是否显示页面信息
    showInfo?: boolean
    // 是否显示总数
    showTotal?: boolean
    // 自定义类名
    customClass?: string
    // 每页显示记录数下拉框的选项
    pageSizeOptions?: number[]
}

export interface PaginationInfo {
    currentPage: number
    pageSize: number
    totalPages: number
    totalItems: number
}

export interface BlogImage {
    id: number
    title: string
    imageUrl: string
    description: string
    date: string
    tags: string[]
}