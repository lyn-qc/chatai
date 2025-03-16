import { http } from "./axios";





interface Deepseek {
    messages: [
        {
            role: string, // 'user' 或 'assistant'
            content: string,
            createdAt: Date
        }
    ],
    _id: string,
    sessionId: string,     // 可选：会话ID
    ipAddress: string,     // 请求IP
    userAgent: string,     // 用户浏览器信息
    createdAt: Date,
    height: number
}



export const deepseekApi = {
    getDeepseekList() {
        return http.get<Deepseek[]>('/deepseek');
    },
    addDeepseek(data: Deepseek) {
        return http.post<Deepseek>('/deepseek', data);
    }
}

