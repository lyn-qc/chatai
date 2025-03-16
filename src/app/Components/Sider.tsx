'use client'
import React, { useState, useEffect } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Menu } from 'antd';
import axios from 'axios';
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
    height: number
}

type MenuItem = Required<MenuProps>['items'][number];

export default function Sider() {
    const [collapsed, setCollapsed] = useState(true);
    const [items, setItems] = useState<MenuItem[]>([])
    const getitems = () => {
        axios.get('/hd/api/deepseek').then((res) => {
            const itemarr = res.data;
            setItems(itemarr.map((item: ChatMessage) => {
                if (item.messages[0].role === 'user') {
                    return {
                        key: item._id,
                        icon: <UserOutlined />,
                        label: item.messages[0].content,
                    }
                }
                return null;
            }).filter(Boolean))
        })
    }
    useEffect(() => {
        getitems()
    }, [])
    const toggleCollapsed = () => {
        getitems()
        setCollapsed(!collapsed);
    };
    return (
        <div className="w-1/5 h-full fixed left-0 top-0 chat-left">
            <div style={{ width: 256 }}>
                <Button type="primary" onClick={toggleCollapsed} style={{ marginBottom: 6 }}>
                    {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </Button>
                <Menu
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    mode="inline"
                    theme="dark"
                    inlineCollapsed={collapsed}
                    items={items}
                    style={{ padding: '8px 0px', height: '80%', overflowY: 'auto' }}

                />
            </div>
            <div className="absolute bottom-6 left-2 w-full siderbom text-gray-500">
                <p>
                    Copyright © 2025-03-12 liyining. All rights reserved.
                </p>
            </div>
        </div>
    )
}
