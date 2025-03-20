"use client";
import React, { useEffect, useState } from 'react';
import { Table, Pagination } from 'antd';
import { useFetchVulnerabilities } from '@/api/index';

// 定义表格列
const columns = [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
    },
    {
        title: 'CNVD ID',
        dataIndex: 'cnvdId',
        key: 'cnvdId',
    },
    {
        title: '标题',
        dataIndex: 'cnTitle',
        key: 'cnTitle',
    },
    {
        title: '参考链接',
        dataIndex: 'cnReference',
        key: 'cnReference',
    },
    {
        title: '发布日期',
        dataIndex: 'pubDate',
        key: 'pubDate',
    },
    {
        title: '危害等级',
        dataIndex: 'hazardLevel',
        key: 'hazardLevel',
    },
];

const LatestDataPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const totalVulnSize = 1000;
    const { dataSource, loading, error, fetchVulnerabilities } = useFetchVulnerabilities();

    useEffect(() => {
        const offset = (currentPage - 1) * pageSize + 1; // 后端的offset从1开始
        const limit = pageSize;
        fetchVulnerabilities(offset, limit);
    }, [currentPage, fetchVulnerabilities]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div>
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                loading={loading}
                locale={{ emptyText: error || '暂无数据' }}
                rowKey="id" // 指定每行数据的唯一标识
            />
            <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalVulnSize} // 最新的数据只展示1000条
                onChange={handlePageChange}
                showSizeChanger={false} // 禁用用户选择每页显示数量
                showQuickJumper={false} // 禁用用户快速跳转页码
            />
        </div>
    );
};

export default LatestDataPage;