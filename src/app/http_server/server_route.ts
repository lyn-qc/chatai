import { http } from './axios';

// 定义接口类型
interface User {
    id: number;
    username: string;
    email: string;
}

interface LoginParams {
    username: string;
    password: string;
}

// API 调用示例
export const userApi = {
    // GET 请求示例：获取用户列表
    getUserList() {
        return http.get<User[]>('/route');
    },

    // GET 请求带参数示例：获取单个用户
    getUserById(id: number) {
        return http.get<User>(`/route/${id}`);
    },

    // POST 请求示例：用户登录
    login(data: LoginParams) {
        return http.post<{ token: string }>('/auth/login', data);
    },

    // PUT 请求示例：更新用户信息
    updateUser(id: number, data: Partial<User>) {
        return http.put<User>(`/route/${id}`, data);
    },

    // DELETE 请求示例：删除用户
    deleteUser(id: number) {
        return http.delete(`/route/${id}`);
    },

    // GET 请求带查询参数示例：搜索用户
    searchUsers(query: string) {
        return http.get<User[]>('/route/search', { keyword: query });
    }
};


