"use client";
import React, { useEffect, useState } from 'react';
import { Button, DatePicker, Input, Modal, Pagination, Radio, Table, Tag, Input as AntInput, message } from 'antd';
import { useQuaryVulnerabilities } from '@/api/index';
import { addTag, deleteTag } from '@/api/index';
import { VulnerabilityInfoVO } from '@/types/VulnerabilityInfoVO';
import './QueryDataPage.css';
import axios from 'axios'; // 确保已安装axios

const { RangePicker } = DatePicker;

const QueryDataPage: React.FC = () => {
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
    //const [totalVulnerabilities, setTotalVulnerabilities] = useState(0); // 用于存储总漏洞数
    const { dataSource, loading, error, totalVulnerabilities, fetchVulnerabilities } = useQuaryVulnerabilities();

    const [open, setOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<VulnerabilityInfoVO | null>(null);

    const [queryParameters, setQueryParameters] = useState({
        cnvdId: '',
        cveId: '',
        cnTitle: '',
        pubDateRange: null,
        searchType: 'cnTitle', // 默认按标题搜索
    });

    useEffect(() => {
        console.log("fetchVulnerabilities:", fetchVulnerabilities);
    }, [fetchVulnerabilities]);

    const [newTag, setNewTag] = useState('');                        // 用于存储新标签输入
    const [originalTags, setOriginalTags] = useState<string[]>([]);  // 保存原始标签用于比较

    // 打开模态框时记录原始标签
    const handleShowModal = (record: VulnerabilityInfoVO) => {
        setSelectedRecord(record);
        setOriginalTags([...(record.tag || [])]);
        setOpen(true);
    };

    // 确认按钮处理
    const handleOk = async () => {
        if (!selectedRecord) {
            setOpen(false);
            return;
        }

        // 检查标签是否有变化
        const currentTags = selectedRecord.tag || [];
        const tagsChanged = 
            currentTags.length !== originalTags.length ||
            currentTags.some(tag => !originalTags.includes(tag)) ||
            originalTags.some(tag => !currentTags.includes(tag));

        if (tagsChanged) {
            try {
                // 找出新增的标签
                const addedTags = currentTags.filter(tag => !originalTags.includes(tag));
                // 找出删除的标签
                const removedTags = originalTags.filter(tag => !currentTags.includes(tag));

                // 批量处理新增标签
                const addPromises = addedTags.map(tag => 
                    axios.post('http://localhost:8091/api/vuln/add_tag', {
                        vulnId: selectedRecord.id,
                        tag: tag
                    })
                );

                // 批量处理删除标签
                const removePromises = removedTags.map(tag =>
                    axios.post('http://localhost:8091/api/vuln/delete_tag', {
                        vulnId: selectedRecord.id,
                        tag: tag
                    })
                );

                // 等待所有请求完成
                await Promise.all([...addPromises, ...removePromises]);

                message.success('标签更新成功');
                setOpen(false);

                // 刷新整个页面
                window.location.reload();
            } catch (error) {
                message.error('标签更新失败');
                console.error('更新标签失败:', error);
                // 可以选择不关闭模态框，让用户决定是否重试
                return;
            }
        } else {
            setOpen(false);
        }
    };

    // 取消操作 - 恢复原始状态
    const handleCancel = () => {
        if (selectedRecord) {
        setSelectedRecord({
            ...selectedRecord,
            tag: [...originalTags] // 恢复原始标签
        });
        }
        setOpen(false);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const offset = (page - 1) * pageSize;
        const limit = pageSize;
        // 构造请求体
        const requestBody = {
            offset: offset,
            limit: limit,
            cnTitle: queryParameters.cnTitle,
            cveId: queryParameters.cveId,
            cnvdId: queryParameters.cnvdId,
            startDate: queryParameters.pubDateRange ? queryParameters.pubDateRange[0].format('YYYY-MM-DD') : null,
            endDate: queryParameters.pubDateRange ? queryParameters.pubDateRange[1].format('YYYY-MM-DD') : null,
        };

        // 发送请求
        fetchVulnerabilities(requestBody);
    };

    // 在 handleSearch 方法中构造请求体
    // 在 handleSearch 方法中
    const handleSearch = () => {
        setCurrentPage(1); // 搜索后重置到第一页
        const offset = (currentPage - 1) * pageSize;
        const limit = pageSize;

        // 构造请求体
        const requestBody = {
            offset: offset,
            limit: limit,
            cnTitle: queryParameters.cnTitle,
            cveId: queryParameters.cveId,
            cnvdId: queryParameters.cnvdId,
            startDate: queryParameters.pubDateRange ? queryParameters.pubDateRange[0].format('YYYY-MM-DD') : null,
            endDate: queryParameters.pubDateRange ? queryParameters.pubDateRange[1].format('YYYY-MM-DD') : null,
        };

        // 发送请求
        fetchVulnerabilities(requestBody);
    };

    const handleReset = () => {
        setQueryParameters({
            cnvdId: '',
            cveId: '',
            cnTitle: '',
            pubDateRange: null,
            searchType: 'cnTitle',
        });
        setCurrentPage(1);
    };

    // 添加标签
    const handleAddTag = () => {
        if (!newTag.trim()) {
            message.warning('请输入标签内容');
            return;
        }

        if (selectedRecord) {
            const updatedTags = [...(selectedRecord.tag || []), newTag.trim()];
            setSelectedRecord({
                ...selectedRecord,
                tag: updatedTags
            });
            setNewTag('');
        }
    };

    // 删除标签
    const handleRemoveTag = (tagToRemove: string) => {
        if (selectedRecord) {
            const updatedTags = (selectedRecord.tag || []).filter(tag => tag !== tagToRemove);
            setSelectedRecord({
                ...selectedRecord,
                tag: updatedTags
            });
        }
    };

    // 处理标签输入键事件
    const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddTag();
        }
    };


    return (
        <div className="query-data-page">
            {/* 查询栏目 */}
            <div className="query-form">
                <h2>漏洞查询条件</h2>
                <div className="query-items">
                    <div className="query-item">
                        <label>关键字：</label>
                        <Input
                            placeholder="输入关键字"
                            value={queryParameters.cnTitle}
                            onChange={(e) => setQueryParameters({ ...queryParameters, cnTitle: e.target.value })}
                            style={{ width: 200 }}
                        />
                        <Radio.Group
                            value={queryParameters.searchType}
                            onChange={(e) => setQueryParameters({ ...queryParameters, searchType: e.target.value })}
                        >
                            <Radio value="cnTitle">仅标题</Radio>
                            <Radio value="cnTitleAndDescribe">标题和描述</Radio>
                        </Radio.Group>
                    </div>

                    <div className="query-item">
                        <label>CNVD编号：</label>
                        <Input
                            placeholder="如: CNVD-2010-00001"
                            value={queryParameters.cnvdId}
                            onChange={(e) => setQueryParameters({ ...queryParameters, cnvdId: e.target.value })}
                            style={{ width: 200 }}
                        />
                    </div>

                    <div className="query-item">
                        <label>CVE编号：</label>
                        <Input
                            placeholder="如: CVE-2021-34527"
                            value={queryParameters.cveId}
                            onChange={(e) => setQueryParameters({ ...queryParameters, cveId: e.target.value })}
                            style={{ width: 200 }}
                        />
                    </div>

                    <div className="query-item-date">
                        <label>发布日期范围：</label>
                        <RangePicker
                            value={queryParameters.pubDateRange}
                            onChange={(dates) => setQueryParameters({ ...queryParameters, pubDateRange: dates })}
                            style={{ width: 250 }}
                        />
                        <div className="query-buttons">
                            <Button type="primary" onClick={handleSearch}>
                                查询
                            </Button>
                            <Button onClick={handleReset}>重置</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 数据表格 */}
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                loading={loading}
                locale={{ emptyText: error || '暂无数据' }}
                rowKey="id"
            />
            <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalVulnerabilities}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper={false}
            />

            {/* 详情模态框 */}
            <Modal
                title="数据详情"
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
                style={{ top: 20 }}
                width={600}
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
                            <a
                                className="detail-value"
                                href={selectedRecord.cnUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
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
                            <a
                                className="detail-value"
                                href={selectedRecord.cnReference}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {selectedRecord.cnReference || '空'}
                            </a>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">解决方案:</span>
                            <span className="detail-value">{selectedRecord.cnSolution || '空'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">补丁:</span>
                            <span className="detail-value">{selectedRecord.cnPatch || ''}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">标签:</span>
                            <div className="tag-container">
                                {selectedRecord.tag?.length > 0 ? (
                                    <>
                                        {selectedRecord.tag.map((tag, index) => (
                                            <Tag 
                                                key={index} 
                                                closable 
                                                onClose={() => handleRemoveTag(tag)}
                                                className="tag"
                                            >
                                                {tag}
                                            </Tag>
                                        ))}
                                    </>
                                ) : (
                                    <span className="detail-value">无</span>
                                )}

                                <div className="tag-input-container">
                                    <AntInput
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={handleTagInputKeyDown}
                                        placeholder="输入新标签"
                                        size="small"
                                        style={{ width: 120, marginRight: 8 }}
                                    />
                                    <Button 
                                        size="small" 
                                        onClick={handleAddTag}
                                        type="primary"
                                    >
                                        添加
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default QueryDataPage;