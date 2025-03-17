// src/app/component/NavMenu.tsx
"use client";
import React, { useState } from 'react';
import { DesktopOutlined, MenuFoldOutlined, MenuUnfoldOutlined, PieChartOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Menu } from 'antd';
import { useRouter } from 'next/navigation';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
    { key: '1', icon: <PieChartOutlined />, label: '最新数据' },
    { key: '2', icon: <DesktopOutlined />, label: '数据查询' },
];

const NavMenu: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const handleMenuClick = (e: { key: string }) => {
        if (e.key === '1') {
            router.push('/latest-data');
        } else if (e.key === '2') {
            router.push('/data-query');
        }
    };

    return (
        <div style={{ width: 256, height: '100vh', backgroundColor: '#001529' }}>
            <Button type="primary" onClick={toggleCollapsed} style={{ marginBottom: 16, marginLeft: 16, marginTop: 16 }}>
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
            <Menu
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                mode="inline"
                theme="dark"
                inlineCollapsed={collapsed}
                items={items}
                onClick={handleMenuClick}
            />
        </div>
    );
};

export default NavMenu;