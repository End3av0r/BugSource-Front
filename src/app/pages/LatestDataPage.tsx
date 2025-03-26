"use client";
import React, {useEffect, useState} from 'react';
import {Table, Pagination, Modal} from 'antd';
import {useFetchVulnerabilities} from '@/api/index';
import {VulnerabilityInfoVO} from '@/types/VulnerabilityInfoVO';
import './LatestDataPage.css';

// 定义表格列
const LatestDataPage: React.FC = () => {
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
        {
            title: '操作',
            key: 'action',
            render: (_, record: VulnerabilityInfoVO) => (
                <a onClick={() => handleShowModal(record)}>查看详情</a>
            ),
        },
    ];
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const totalVulnSize = 1000;
    const {dataSource, loading, error, fetchVulnerabilities} = useFetchVulnerabilities();

    const [open, setOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<VulnerabilityInfoVO | null>(null);

    useEffect(() => {
        const offset = (currentPage - 1) * pageSize; // 后端的offset从1开始
        const limit = pageSize;
        fetchVulnerabilities(offset, limit);
    }, [currentPage, fetchVulnerabilities]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleShowModal = (record: VulnerabilityInfoVO) => {
        setSelectedRecord(record);
        setOpen(true);
    };

    const handleOk = () => {
        setOpen(false);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    return (
        <div>
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                loading={loading}
                locale={{emptyText: error || '暂无数据'}}
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
            <Modal
                title="数据详情"
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
                style={{
                    top: 20, // 调整模态框距离顶部的距离
                }}
                width={600} // 设置模态框的宽度
                styles={{ body: { padding: '20px' } }}
            >
                {selectedRecord && (
                    <div className="vulnerability-details">
                        <div className="detail-row">
                            <span className="detail-label">ID:</span>
                            <span className="detail-value">{selectedRecord.id}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">CNVD ID:</span>
                            <span className="detail-value">{selectedRecord.cnvdId}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">CN URL:</span>
                            <a className="detail-value" href={selectedRecord.cnUrl} target="_blank"
                               rel="noopener noreferrer">
                                {selectedRecord.cnUrl}
                            </a>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">标题:</span>
                            <span className="detail-value">{selectedRecord.cnTitle}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">发布日期:</span>
                            <span className="detail-value">{selectedRecord.pubDate}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">危害等级:</span>
                            <span className="detail-value">{selectedRecord.hazardLevel || '空'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">影响:</span>
                            <span className="detail-value">{selectedRecord.cnImpact || '空'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">CVE ID:</span>
                            <span className="detail-value">{selectedRecord.cveId || '空'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">类型:</span>
                            <span className="detail-value">{selectedRecord.cnTypes || '空'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">描述:</span>
                            <span className="detail-value">{selectedRecord.cnDescribe || '空'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">参考链接:</span>
                            <a className="detail-value" href={selectedRecord.cnReference} target="_blank"
                               rel="noopener noreferrer">
                                {selectedRecord.cnReference || '空'}
                            </a>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">解决方案:</span>
                            <span className="detail-value">{selectedRecord.cnSolution || '空'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">补丁:</span>
                            <span className="detail-value">{selectedRecord.cnPatch || ""}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">标签:</span>
                            <div className="tag-container">
                                {selectedRecord.tag?.length > 0 ? (
                                    selectedRecord.tag.map((tag, index) => (
                                        <span key={index} className="tag">
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="detail-value">无</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LatestDataPage;