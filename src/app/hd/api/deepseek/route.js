/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { deepseekmodel } from "../../db";

export async function POST(request) {
    const { messages } = await request.json();
    // 检查 messages 是否包含 id 属性
    const id = messages.id;

    if (id) {
        const deepseeklist = await deepseekmodel.find({ id: id });
        if (deepseeklist.length > 0) {
            return NextResponse.json(deepseeklist[0]);
        }
    }
    // 如果没有找到或没有提供 id，则创建新记录
    const deepseek = await deepseekmodel.create({ messages });
    return NextResponse.json(deepseek);
}

export async function GET(request) {
    const deepseeklist = await deepseekmodel.find();
    return NextResponse.json(deepseeklist);
}

