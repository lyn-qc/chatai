"use client";
import { ArrowUpOutlined, LoadingOutlined } from '@ant-design/icons';
import { useState, useEffect, useMemo, Suspense, lazy, useCallback } from "react";
import { useChat } from '@ai-sdk/react';
import { useRef } from 'react';
import axios from "axios";
import tximg from '../../../public/tx.png'
import { useRowchange } from "../hooks/useRowchange";
import Image from "next/image";
import { VariableSizeList } from 'react-window';
import { MarkdownRenderer } from '../Components/MarkdownRenderer';
// Lazy load components
const Sider = lazy(() => import("../Components/Sider"));

const LogoutButton = lazy(() => import("../Components/Logout"));


interface ChatMessage {
    messages: [
        {
            role: string,
            content: string,
            createdAt: Date
        }
    ],
    sessionId: string,
    ipAddress: string,
    userAgent: string,
    createdAt: Date,
    _id: string,
}

// 添加缺失的UIMessage接口定义
interface UIMessage {
    role: string,
    content: string,
    _id: string,
}

export default function Chat() {
    const listRef = useRef<VariableSizeList>(null);
    const rowHeightRef = useRef<Record<number, number>>({});
    const [chatList, setChatList] = useState<ChatMessage[]>([]);
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        headers: {
            'x-real-ip': '127.0.0.1'
        }
    });
    const endRef = useRef<HTMLDivElement>(null);

    // 使用useCallback缓存函数，避免重新创建
    const addmessage = useCallback((message: ChatMessage) => {
        axios.post('/hd/api/deepseek', {
            messages: message
        }).then(res => {
            console.log(res);
        }).catch(err => {
            console.error('添加消息失败:', err);
        });
    }, []);

    // 使用useCallback缓存键盘事件处理函数
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { // 增加Shift+Enter支持多行输入
            e.preventDefault();
            handleSubmit();
        }
    }, [handleSubmit]);

    // 使用useCallback缓存API调用函数
    const getDeepseekList = useCallback(async () => {
        try {
            const res = await axios.get('/hd/api/deepseek');
            setChatList(res.data);
        } catch (err) {
            console.error('获取聊天记录失败:', err);
        }
    }, []);

    // 合并并优化hblist计算
    const hblist = useMemo(() => {
        return [...chatList, ...messages];
    }, [chatList, messages]);

    // 简化为单一的初始化Effect
    useEffect(() => {
        getDeepseekList();
    }, [getDeepseekList]);

    // 合并消息和滚动逻辑的Effect
    useEffect(() => {
        // 处理消息存储
        // if (messages.length > 1 && !isLoading) {
        //     const userMessage = messages[messages.length - 2];
        //     const newLastMessage = messages[messages.length - 1];

        //     // 并行处理API调用
        //     Promise.all([
        //         addmessage(userMessage as unknown as ChatMessage),
        //         addmessage(newLastMessage as unknown as ChatMessage)
        //     ]).catch(err =>
        //         console.error('消息存储失败:', err)
        //     );
        // }

        // 处理滚动 (防抖)
        const scrollTimeout = setTimeout(() => {
            if (endRef.current) {
                endRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);

        return () => clearTimeout(scrollTimeout); // 清理定时器
    }, [messages, isLoading, addmessage]);

    // 优化列表滚动Effect
    useEffect(() => {
        if (listRef.current && hblist.length > 0) {
            // 滚动到最新消息
            const scrollTimeout = setTimeout(() => {
                listRef.current?.scrollToItem(hblist.length - 1, 'end');
            }, 50);

            return () => clearTimeout(scrollTimeout);
        }
    }, [hblist]);

    // 缓存行高设置函数
    const setRowHeight = useCallback((index: number, height: number) => {
        if (listRef.current) {
            listRef.current.resetAfterIndex(0);
            rowHeightRef.current = { ...rowHeightRef.current, [index]: height };
        }
    }, []);

    // 缓存获取行高函数
    const getItemSize = useCallback((index: number): number =>
        rowHeightRef.current[index] || 300, []);

    // 使用useMemo缓存Row组件以减少重渲染
    const RowComponent = useMemo(() => {
        return function Row({ data, index, style }: { data: ChatMessage | UIMessage, index: number, style: any }) {
            delete style.height;
            const rowRef = useRowchange({ index, setRowHeight });

            // 使用 in 操作符进行更高效的类型检查
            const isChatMessage = 'messages' in data;
            const messageContent = isChatMessage ? data.messages[0].content : data.content;
            const messageRole = isChatMessage ? data.messages[0].role : data.role;

            return (
                <div ref={rowRef} key={data._id} style={style} className={`flex ${messageRole === 'user' ? 'justify-end' : 'justify-start'} items-center gap-2 msg-box`}>
                    <div className={`${messageRole !== 'user' ? 'assistantbox' : 'userbox'} chat-box-message`}>
                        {messageRole !== 'user' ? <Image src={tximg.src} alt="tx" width={36} height={36} className="w-10 h-10 rounded-full" /> : null}
                        <Suspense fallback={<div>加载内容中...</div>}>
                            <MarkdownRenderer content={messageContent} />
                        </Suspense>
                        {messageRole !== 'user' && isLoading && <span style={{ color: "aqua" }}>Nexora正在思考<LoadingOutlined /></span>}
                    </div>
                </div>
            );
        };
    }, [isLoading, setRowHeight]);

    return (
        <div className="flex h-full w-full chat">
            <Suspense fallback={<div>加载侧边栏...</div>}>
                <Sider />
            </Suspense>
            <div className="w-4/5 h-full bg-gray-100 chat-right">
                <Suspense fallback={<div>加载中...</div>}>
                    <LogoutButton />
                </Suspense>
                <div className="w-5/6 h-5/6 px-4">
                    <VariableSizeList
                        height={500}
                        width={'100%'}
                        itemSize={getItemSize}
                        itemCount={hblist.length}
                        ref={listRef}
                    >
                        {({ index, style }) => (
                            <RowComponent data={hblist[index] as ChatMessage | UIMessage} index={index} style={style} />
                        )}
                    </VariableSizeList>
                    <div className="h-3" ref={endRef}></div>
                </div>

                <div className="w-2/3 h-1/6 relative pt-6 chat-text-area">
                    <div className="w-full h-5/6 chat-box">
                        <textarea
                            className="text-area h-full bg-white tare"
                            name="prompt"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="输入您的问题..."
                        />
                    </div>
                    <div className="w-full h-1/6 bg-white chat-box-button flex justify-between items-center bdiv">
                        <span className="version">
                            deepseek-r1
                        </span>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="w-1/5 h-full flex justify-center items-center bg-gary-100 dbtn"
                            disabled={isLoading || !input.trim()}
                        >
                            <ArrowUpOutlined />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
