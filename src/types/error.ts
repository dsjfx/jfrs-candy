export enum ErrorType {
	NETWORK = 'NETWORK_ERROR',           	// 网络错误
	TIMEOUT = 'TIMEOUT_ERROR',           	// 超时错误
	UNAUTHORIZED = 'UNAUTHORIZED',       	// 未授权（401）
	FORBIDDEN = 'FORBIDDEN',             	// 禁止访问（403）
	NOT_FOUND = 'NOT_FOUND',             	// 资源不存在（404）
	VALIDATION = 'VALIDATION_ERROR',      	// 验证错误（422）
	SERVER = 'SERVER_ERROR',              	// 服务器错误（500）
	BUSINESS = 'BUSINESS_ERROR',          	// 业务逻辑错误
	UNKNOWN = 'UNKNOWN_ERROR',            	// 未知错误
	VUE = 'VUE_ERROR',						// vue 内部错误
}

export interface AppError {
	type: ErrorType
	code: string | number	/** 错误码 */
	message: string			/** 错误信息 */
	details?: any
	timestamp: number		/** 时间戳 */
	// url?: string
	// method?: string
	stack?: string			/** 堆栈 */
	context?: ErrorContext	/** 上下文（可选）*/
}

export interface ErrorHandlerOptions {
	showToast?: boolean           // 是否显示提示
	logToConsole?: boolean        // 是否打印到控制台
	logToServer?: boolean         // 是否上报服务器
	redirectOnUnauthorized?: boolean // 未授权是否跳转登录
	retry?: boolean               // 是否允许重试
}

// Error
export interface ErrorContext {
	// ========== 通用字段（所有错误都可能有）==========
	/** 当前路由路径，如 /user/123 */
	route?: string
	/** 用户标识（脱敏后），如 userId 或 anonymous */
	userId?: string
	/** 浏览器 UA */
	userAgent?: string

	// ========== Vue 组件错误专属 ==========
	/** 组件名，如 UserProfile */
	component?: string
	/** 错误阶段，如 setup / render / mounted hook */
	info?: string

	// ========== 接口错误专属 ==========
	/** 请求 URL */
	url?: string
	/** 请求方法，如 GET / POST */
	method?: string
	/** HTTP 状态码，如 500 */
	status?: number
	/** 业务错误码（后端返回的 code 字段）*/
	bizCode?: string | number
}