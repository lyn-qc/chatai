import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// 临时存储上传文件的目录
const UPLOAD_DIR = path.resolve('../../../tmp/uploads');

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const chunk = formData.get('file') as File;
        const uploadID = formData.get('uploadID') as string;
        const chunkIndex = formData.get('chunkIndex') as string;
        const fileName = formData.get('fileName') as string;
        const totalChunks = formData.get('totalChunks') as string;

        if (!chunk || !uploadID || !chunkIndex || !fileName || !totalChunks) {
            return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
        }

        // 为每个上传创建唯一目录
        const uploadDir = path.join(UPLOAD_DIR, uploadID);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // 保存分片文件
        const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
        const chunkPath = path.join(uploadDir, `chunk-${chunkIndex}`);
        fs.writeFileSync(chunkPath, chunkBuffer);

        // 检查是否所有分片都已上传
        const isLastChunk = parseInt(chunkIndex) === parseInt(totalChunks) - 1;

        return NextResponse.json({
            success: true,
            chunkIndex,
            isLastChunk,
            uploadID,
            fileName
        });

    } catch (error) {
        console.error('分片上传错误:', error);
        return NextResponse.json({ error: '处理分片时出错' }, { status: 500 });
    }
}