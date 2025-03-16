/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import { cn } from "@/lib/utils";

export function MarkdownRenderer({
    content,
    className,
}: {
    content: string;
    className?: string;
}) {
    return (
        <div className={cn("prose dark:prose-invert max-w-full", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    a: ({ node, ...props }) => (
                        <a {...props} className="text-blue-500 hover:underline" />
                    ),
                    code: ({ node, className, children, ...props }) => (
                        <code
                            {...props}
                            className={cn(
                                "bg-gray-100 dark:bg-gray-800 p-1 rounded text-sm",
                                className
                            )}
                        >
                            {children}
                        </code>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
