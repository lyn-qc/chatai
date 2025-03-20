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
import { debounce } from 'lodash';


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
    reasoning: string
}

interface ChatMessage1 {
    messages: [
        {
            role: string,
            content: string,
            createdAt: Date
        }
    ],
    content: string,
    sessionId: string,
    ipAddress: string,
    userAgent: string,
    createdAt: Date,
    _id: string,
    reasoning: string
}


interface UIMessage {
    role: string,
    content: string,
    id?: string,
    _id: string,
}



export default function Chat() {
    const listRef = useRef<VariableSizeList>(null);
    const rowHeightRef = useRef<Record<number, number>>({});
    const [chatList, setChatList] = useState<ChatMessage[]>([]);
    const [storedMessageIds, setStoredMessageIds] = useState<Set<string>>(new Set());
    const [dwbol, setDwbol] = useState(true);
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        headers: {
            'x-real-ip': '127.0.0.1'
        }
    });
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // 使用useCallback缓存函数，避免重新创建
    const addmessage = useCallback((message: any) => {
        // 检查消息是否已经存储过，使用id字段
        const messageId = message.id;
        if (messageId && storedMessageIds.has(messageId)) {
            return Promise.resolve(); // 已存储过该消息，直接返回
        }

        return axios.post(`/hd/api/deepseek`, {
            messages: message
        }).then(res => {
            // 存储成功后，将消息ID添加到已存储集合中
            if (messageId) {
                setStoredMessageIds(prev => new Set(prev).add(messageId));
            }
        }).catch(err => {
            console.error('添加消息失败:', err);
        });
    }, [storedMessageIds]);

    // 使用useCallback缓存键盘事件处理函数
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { // 增加Shift+Enter支持多行输入
            e.preventDefault();
            handleSubmit();
        }
    }, [handleSubmit]);

    // 使用useCallback缓存API调用函数
    const getDeepseekList = useCallback(async (curpage: number) => {
        if (curpage === 3) {
            setDwbol(false);
        }
        // 如果正在加载，直接返回
        if (isLoadingMore) return;

        try {
            setIsLoadingMore(true);
            const res = await axios.get(`/hd/api/deepseek?page=${curpage}`);
            const currentLength = chatList.length;
            setChatList(prev => [...res.data, ...prev]);

            if (listRef.current) {
                listRef.current.scrollToItem(res.data.length + currentLength - 1, 'start');
            }

        } catch (err) {
            console.error('获取聊天记录失败:', err);
        } finally {
            lock = false;
            setIsLoadingMore(false);
        }
    }, []);

    // 合并并优化hblist计算 - 恢复直接合并数组的方式
    const hblist = useMemo(() => {
        console.log(messages);
        return [...chatList, ...messages];
    }, [chatList, messages]);

    useEffect(() => {

        getDeepseekList(1);
    }, []);

    // 修改消息存储逻辑，批量处理
    useEffect(() => {
        // 只在消息变化且不在加载状态时处理存储
        if (messages.length > 0 && !isLoading) {
            // 找出所有未存储的消息
            const unstoredMessages = messages.filter(
                msg => msg.id && !storedMessageIds.has(msg.id)
            );

            // 按顺序存储未存储的消息
            if (unstoredMessages.length > 0) {
                (async () => {
                    for (const message of unstoredMessages) {
                        try {
                            await addmessage(message);
                        } catch (err) {
                            console.error(`存储消息失败:`, err);
                        }
                    }
                })();
            }
        }
    }, [messages, isLoading]);

    // 优化自动滚动逻辑
    useEffect(() => {

        if ((hblist.length > 0 && dwbol) || isLoading) {
            // 创建防抖函数，使用 lodash 的 debounce
            const debouncedScroll = debounce(() => {
                if (listRef.current) {
                    listRef.current.scrollToItem(hblist.length - 1, 'end');
                }
            }, 100, {
                leading: true,    // 立即执行第一次
                trailing: true,   // 确保最后一次也执行
                maxWait: 150     // 设置最大等待时间
            });
            // 执行滚动
            debouncedScroll();
            // 清理函数
            return () => {
                debouncedScroll.cancel();
            };
        }
    }, [messages, isLoading, dwbol, hblist.length]); // 添加 isLoading 作为依赖项

    // 缓存行高设置函数
    const setRowHeight = useCallback((index: number, height: number) => {
        if (listRef.current && rowHeightRef.current[index] !== height) {
            rowHeightRef.current[index] = height;
            listRef.current.resetAfterIndex(index); // 只重置变化的行之后的内容
        }
    }, []);

    // 缓存获取行高函数
    const getItemSize = useCallback((index: number): number =>
        rowHeightRef.current[index] || 300, []);

    // 使用useMemo缓存Row组件以减少重渲染
    const RowComponent = useMemo(() => {
        return function Row({ data, index, style }: { data: ChatMessage1 | UIMessage, index: number, style: any }) {
            const adjustedStyle = { ...style, height: 'auto' };
            const rowRef = useRowchange({ index, setRowHeight });
            // 使用 in 操作符进行更高效的类型检查
            const isChatMessage = 'messages' in data;
            const messageContent = isChatMessage ? data.messages[0].content : data.content;
            const messageRole = isChatMessage ? data.messages[0].role : data.role;

            // 只在最后一条助手消息上显示加载动画
            const isLastAssistantMessage = messageRole !== 'user' && index === hblist.length - 1 && isLoading && data.content === ''

            return (
                <div ref={rowRef} key={data._id} style={adjustedStyle} className={`flex ${messageRole === 'user' ? 'justify-end' : 'justify-start'} items-center gap-2 msg-box`}>
                    <div className={`${messageRole !== 'user' ? 'assistantbox' : 'userbox'} chat-box-message`}>
                        {messageRole !== 'user' ? <Image src={tximg.src} alt="tx" width={36} height={36} className="w-10 h-10 rounded-full" /> : null}
                        <div>
                            {isLastAssistantMessage && (
                                <div className="loading-indicator">
                                    <span style={{ color: "aqua", display: "flex", alignItems: "center", gap: "4px" }}>
                                        Nexora正在思考 <LoadingOutlined />
                                    </span>
                                    <div className="loading-indicator text-gray-500">
                                        <p>{(data as ChatMessage1).reasoning}</p>
                                    </div>
                                </div>
                            )}

                        </div>
                        <Suspense fallback={<div>加载内容中...</div>}>
                            <MarkdownRenderer content={messageContent} />
                        </Suspense>
                    </div>
                </div>
            );
        };
    }, [isLoading, setRowHeight, hblist.length]);

    // 优化滚动事件处理的防抖实现
    let lock = false; // 简单的请求锁
    const handleScrollEvent = useCallback(
        debounce(({ scrollOffset }) => {
            const needLoad = scrollOffset < 1000; // 顶部30%区域

            if (needLoad && !lock && !isLoadingMore) {
                lock = true;
                setPage(prev => prev + 1);
                getDeepseekList(page + 1);
            }
        }, 300),
        [isLoadingMore, page]
    );

    return (
        <div className="flex h-full w-full chat">

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
                        overscanCount={3}
                        onScroll={handleScrollEvent}
                    >
                        {({ index, style }) => (
                            <RowComponent data={hblist[index] as ChatMessage1 | UIMessage} index={index} style={style} />
                        )}
                    </VariableSizeList>
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
