/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, {
    AxiosInstance,//用于定义 Axios 实例的类型
    AxiosRequestConfig,//定义了 Axios 请求配置对象的类型，包含了请求的所有配置项（例如 URL、方法、请求头等）。
    AxiosResponse,//用于定义成功响应对象的类型。
    AxiosError,//用于定义错误响应对象的类型。
    InternalAxiosRequestConfig,
    CancelTokenSource,//用于创建请求取消令牌的源
    AxiosHeaders
} from "axios";

import { message } from "antd";
// 定义基础响应结构（根据后端实际结构调整）
interface BaseResponse<T = any> {
    code: number,
    data: T,
    message: string

}

const service: AxiosInstance = axios.create({
    baseURL: 'http://localhost:3000/hd/api',
    timeout: 10000,
    headers: new AxiosHeaders({
        'Content-Type': 'application/json'
    }),
    // 添加跨域支持
    withCredentials: true  // 允许跨域携带cookie
    //'Content-Type': 'application/json': 设置 Content-Type 请求头为 application/json，表明客户端发送的数据格式为 JSON 格式。这是常用的 API 数据传输格式。
})

//方法为 Axios 实例 service 添加请求拦截器。请求拦截器允许在请求发送之前对请求配置进行修改或拦截
// 请求拦截器

service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        //第一个参数是请求成功的拦截处理函数。当请求配置正确时，会执行这个函数。
        //这里不能使用AxiosRequestConfig会报错 新版本的axiosAxios 1.6版本中针对拦截器的类型定义进行了强化
        const token = localStorage.getItem('access_token')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        config.headers ??= new AxiosHeaders()
        // config.headers['X-CSRF-Token'] = getCSRFToken()
        return config

    },

    (error: AxiosError) => {
        return Promise.reject(error)
    }

)

//响应拦截器

service.interceptors.response.use(
    (response: AxiosResponse<BaseResponse>) => {
        const res = response.data
        // 修改判断逻辑，只有特定的错误码才需要处理
        if (res.code >= 400) {  // 或者根据你的后端约定设置其他错误码范围
            handleBusinessError(res.code, res.message)
            return Promise.reject(new Error(res.message || "Error"))
        }
        // 返回完整的响应数据，而不是只返回 data
        return response
    },
    (error: AxiosError) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    handleUnauthorized()
                    break;
                case 403:
                    message.error('无权访问')
                    break;
                case 404:
                    message.error(`接口 ${error.config?.url} 不存在`)
                    break;
                case 500:
                    message.error("服务器异常")
                    break;
                default:
                    message.error(`请求错误：${error.message}`)
            }
        } else if (error.request) {
            message.error('网络异常，请检查服务器是否正常运行')
        } else {
            message.error(`请求配置错误：${error.message}`)
        }
        return Promise.reject(error)
    }
)

// 错误处理函数
function handleBusinessError(code: number, msg?: string) {
    // 根据业务错误码进行针对性处理
    const errorMap: { [key: number]: string } = {
        1001: '认证过期，请重新登录',
        2001: '参数校验失败',
        3001: '服务限流，请稍后重试'
    }
    message.error(msg || errorMap[code] || '未知错误')

}

// 未授权处理

function handleUnauthorized() {
    message.error('登录已过期，请重新登录')
    localStorage.removeItem('access_token')
    window.location.href = '/login'
}

// 获取CSRF Token（示例实现）

function getCSRFToken() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1]
}

// 导出常用方法（按需扩展）

export const http = {
    get<T = any>(url: string, params?: object, config?: AxiosRequestConfig) {
        return service.get<BaseResponse<T>>(url, { params, ...config })
    },

    post<T = any>(url: string, data?: object, config?: AxiosRequestConfig) {
        return service.post<BaseResponse<T>>(url, data, config)
    },

    put<T = any>(url: string, data?: object, config?: AxiosRequestConfig) {
        return service.put<BaseResponse<T>>(url, data, config)
    },

    delete<T = any>(url: string, config?: AxiosRequestConfig) {
        return service.delete<BaseResponse<T>>(url, config)
    }
}
