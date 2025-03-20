import { createDeepSeek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// 创建 DeepSeek 客户端，替换为你的实际 API 密钥
const deepseek = createDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY || "sk-9ccae550b8bf4285b1c54054b133b8b2",
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

export async function POST(req: Request) {
    try {
        // 解析上传的文件
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return new Response(JSON.stringify({ error: '未找到上传的文件' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 获取文件信息
        const fileName = file.name;
        const fileType = file.type;

        // 读取文件内容
        let fileContent: string;
        try {
            fileContent = await file.text();
        } catch (error) {
            // 如果文件太大或不是文本，使用简单描述
            fileContent = `[二进制文件: ${fileName}, 大小: ${(file.size / 1024).toFixed(2)} KB]`;
        }

        // 构建提示
        const userPrompt = `我上传了一个名为 "${fileName}" 的${fileType ? `${fileType}类型` : ''}文件。
            请分析此文件并提供详细内容摘要。如果文件内容包含代码，请解释其功能和主要组件。
            如果是文本文档，请提供主要观点和重要信息的概述。
            文件内容:
            ${fileContent}`;

        // 调用 DeepSeek API
        const result = await streamText({
            model: deepseek('deepseek-v3'),
            system: '你是一个专业的文件分析助手，擅长分析各种文件内容并提供有见解的摘要和解释。',
            messages: [
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
        });

        // 返回流式响应
        return result.toDataStreamResponse(
            { sendReasoning: true, }
        );

    } catch (error) {
        console.error('文件处理错误:', error);
        return new Response(JSON.stringify({ error: '处理文件时出错' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 