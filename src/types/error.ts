export enum ErrorType {
	NETWORK = 'NETWORK_ERROR',           // 网络错误
	TIMEOUT = 'TIMEOUT_ERROR',           // 超时错误
	UNAUTHORIZED = 'UNAUTHORIZED',       // 未授权（401）
	FORBIDDEN = 'FORBIDDEN',             // 禁止访问（403）
	NOT_FOUND = 'NOT_FOUND',             // 资源不存在（404）
	VALIDATION = 'VALIDATION_ERROR',      // 验证错误（422）
	SERVER = 'SERVER_ERROR',              // 服务器错误（500）
	BUSINESS = 'BUSINESS_ERROR',          // 业务逻辑错误
	UNKNOWN = 'UNKNOWN_ERROR'             // 未知错误
}

export interface AppError {
	type: ErrorType
	code: string | number
	message: string
	details?: any
	timestamp: number
	url?: string
	method?: string
	stack?: string
}

export interface ErrorHandlerOptions {
	showToast?: boolean           // 是否显示提示
	logToConsole?: boolean        // 是否打印到控制台
	logToServer?: boolean         // 是否上报服务器
	redirectOnUnauthorized?: boolean // 未授权是否跳转登录
	retry?: boolean               // 是否允许重试
}