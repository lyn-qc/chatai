import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

const UPLOAD_DIR = path.resolve('../../../tmp/uploads');
const MERGED_DIR = path.resolve('../../../tmp/merged');

// 确保合并目录存在
if (!fs.existsSync(MERGED_DIR)) {
    fs.mkdirSync(MERGED_DIR, { recursive: true });
}

// 创建 DeepSeek 客户端
const deepseek = createDeepSeek({
    apiKey: "sk-9ccae550b8bf4285b1c54054b133b8b2",
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

export async function POST(req: Request) {
    try {
        const { uploadID, fileName, totalChunks } = await req.json();

        if (!uploadID || !fileName || !totalChunks) {
            return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
        }

        const uploadDir = path.join(UPLOAD_DIR, uploadID);
        if (!fs.existsSync(uploadDir)) {
            return NextResponse.json({ error: '找不到上传文件' }, { status: 404 });
        }

        // 合并文件路径
        const filePath = path.join(MERGED_DIR, fileName);

        // 创建写入流
        const writeStream = fs.createWriteStream(filePath);

        // 按顺序合并分片
        for (let i = 0; i < parseInt(totalChunks); i++) {
            const chunkPath = path.join(uploadDir, `chunk-${i}`);
            if (fs.existsSync(chunkPath)) {
                const chunkBuffer = fs.readFileSync(chunkPath);
                writeStream.write(chunkBuffer);
            } else {
                writeStream.close();
                return NextResponse.json({ error: `缺少分片: ${i}` }, { status: 400 });
            }
        }

        // 完成写入
        writeStream.end();

        // 等待文件写入完成
        await new Promise<void>((resolve) => {
            writeStream.on('finish', () => {
                resolve();
            });
        });

        // 获取文件类型
        const fileExt = path.extname(fileName).toLowerCase();
        let fileType = '';

        // 根据扩展名推断文件类型
        switch (fileExt) {
            case '.txt': fileType = 'text/plain'; break;
            case '.pdf': fileType = 'application/pdf'; break;
            case '.doc': case '.docx': fileType = 'application/msword'; break;
            case '.xls': case '.xlsx': fileType = 'application/vnd.ms-excel'; break;
            case '.json': fileType = 'application/json'; break;
            case '.csv': fileType = 'text/csv'; break;
            case '.js': fileType = 'application/javascript'; break;
            case '.html': fileType = 'text/html'; break;
            case '.xml': fileType = 'application/xml'; break;
            default: fileType = 'application/octet-stream';
        }

        // 读取文件内容
        let fileContent: string;
        try {
            fileContent = fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            // 如果文件太大或不是文本，使用简单描述
            const stats = fs.statSync(filePath);
            fileContent = `[二进制文件: ${fileName}, 大小: ${(stats.size / 1024).toFixed(2)} KB]`;
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

        // 删除临时文件夹
        setTimeout(() => {
            try {
                fs.rmSync(uploadDir, { recursive: true, force: true });
            } catch (e) {
                console.error('删除临时文件夹失败:', e);
            }
        }, 5000);

        // 返回流式响应
        return result.toDataStreamResponse({ sendReasoning: true });

    } catch (error) {
        console.error('合并文件错误:', error);
        return NextResponse.json({ error: '处理文件时出错' }, { status: 500 });
    }
}