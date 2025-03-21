'use client'
import React, { useState, useRef, useEffect } from 'react'
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons'
import axios from 'axios'


const CHUNK_SIZE = 1024 * 1024 * 2;
export default function FileUpload() {
    const [file, setFile] = useState<File | null>(null)
    const [fileName, setFileName] = useState<string>('')
    const [isUploading, setIsUploading] = useState<boolean>(false)
    const [response, setResponse] = useState<string>('')
    const [isStreaming, setIsStreaming] = useState<boolean>(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const responseRef = useRef<HTMLDivElement>(null)

    const [chunkProgress, setChunkProgress] = useState<number[]>([])// 存储每个分片的上传进度
    const [activeChunk, setActiveChunk] = useState<Set<number>>(new Set())// 当前上传的分片索引



    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null
        if (selectedFile) {
            setFile(selectedFile)
            setFileName(selectedFile.name)
        }
    }
    //计算文件唯一哈希标识符


    const resetFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
        setFile(null)
        setFileName('')
    }
    const uploadToDeepseek = async () => {
        if (!file) return
        setIsUploading(true)
        setIsStreaming(true)
        setResponse('')
        try {
            //随机id
            const uploadID = Math.random().toString(36).substring(2)

            //分片处理逻辑
            const chunkCount = Math.ceil(file.size / CHUNK_SIZE)
            setChunkProgress(Array(chunkCount).fill(0))

            //分片上传
            for (let index = 0; index < chunkCount; index++) {
                setActiveChunk(prev => new Set([...prev, index]))

                const start = index * CHUNK_SIZE
                const end = Math.min(file.size, start + CHUNK_SIZE)
                const chunk = file.slice(start, end)
                const formData = new FormData()
                formData.append('file', chunk)
                formData.append('uploadID', uploadID)
                formData.append('chunkIndex', String(index))
                formData.append('fileName', file.name)
                formData.append('totalChunks', String(chunkCount))
                await axios.post('/api/uploadShard', formData, {
                    onUploadProgress: (progressEvent) => {
                        const newProgress = [...chunkProgress]
                        newProgress[index] = progressEvent.progress || 0
                        setChunkProgress(newProgress)
                    }
                })
                setActiveChunk(prev => {
                    const nextActiveChunks = new Set(prev)
                    nextActiveChunks.delete(index)
                    return nextActiveChunks
                })
            }

            // 所有分片上传完成后，请求合并文件
            const mergeResponse = await fetch('/api/mergeChunks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uploadID,
                    fileName: file.name,
                    totalChunks: chunkCount
                }),
            })

            if (!mergeResponse.ok) {
                throw new Error(`合并文件失败: ${mergeResponse.status}`)
            }

            // 处理流式响应
            const reader = mergeResponse.body?.getReader()
            if (!reader) {
                throw new Error('无法读取响应')
            }
            // 解码器
            const decoder = new TextDecoder()
            let responseText = ''

            // 读取流
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                // 解码新收到的块
                const chunk = decoder.decode(value, { stream: true })

                // 处理特殊格式的响应
                const lines = chunk.split('\n')
                for (const line of lines) {
                    // 跳过空行
                    if (!line.trim()) continue
                    // 跳过元数据行
                    if (line.startsWith('e:') || line.startsWith('d:')) continue
                    // 处理内容行 (格式如: 0:"文本内容")
                    if (line.startsWith('0:"')) {
                        // 提取引号中的内容并处理转义字符
                        const content = line.substring(3, line.length - 1)
                            .replace(/\\"/g, '"')  // 处理转义的引号
                            .replace(/\\n/g, '\n') // 处理转义的换行
                            .replace(/\\t/g, '\t') // 处理转义的制表符

                        responseText += content
                        setResponse(responseText)
                    }
                }

                // 自动滚动到底部
                if (responseRef.current) {
                    responseRef.current.scrollTop = responseRef.current.scrollHeight
                }
            }
            resetFileInput()
        } catch (error) {
            console.error('上传文件失败:', error)
            setResponse('文件上传或处理失败，请重试。')
        } finally {
            setIsUploading(false)
            setIsStreaming(false)
        }
    }

    // 自动滚动到底部
    useEffect(() => {
        if (responseRef.current && isStreaming) {
            responseRef.current.scrollTop = responseRef.current.scrollHeight
        }
    }, [response, isStreaming])

    return (
        <div className="max-w-3xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">文件分析</h1>
            <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                    {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                        选择文件上传到 DeepSeek 进行分析
                    </label> */}
                    <div className="flex items-center">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-input"
                        />
                        <label
                            htmlFor="file-input"
                            className="cursor-pointer flex items-center justify-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                            <UploadOutlined className="mr-2" />
                            选择文件
                        </label>
                        <span className="ml-3 text-sm text-gray-500">
                            {fileName || '未选择文件'}
                        </span>
                    </div>
                </div>

                <button
                    onClick={uploadToDeepseek}
                    disabled={!file || isUploading}
                    className={`w-full flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white ${!file || isUploading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                >
                    {isUploading ? (
                        <>
                            <LoadingOutlined className="mr-2" />
                            正在处理...
                        </>
                    ) : (
                        '上传并分析'
                    )}
                </button>

                {
                    (response || isStreaming) && (
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold mb-2">分析结果：</h2>
                            <div
                                ref={responseRef}
                                className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap h-64 overflow-y-auto"
                            >
                                {response || (isStreaming && <span>正在等待 DeepSeek 的响应...</span>)}
                                {isStreaming && <span className="animate-pulse">▌</span>}
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
} 