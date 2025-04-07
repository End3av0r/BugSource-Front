"use client";
import React, { useState, useEffect } from 'react';
import { Button, Input, Table, Tag, message, Card, Form, Modal, Select } from 'antd';
import { addTag, deleteTag, getVulnerabilityDetail } from '@/api/index';
import { VulnerabilityInfoVO } from '@/types/VulnerabilityInfoVO';

const { Option } = Select;

const TagManagePage: React.FC = () => {
    const [vulnId, setVulnId] = useState<string>('');
    const [open, setOpen] = useState(false);
    const [vulnerability, setVulnerability] = useState<VulnerabilityInfoVO | null>(null);
    const [originalVulnerability, setOriginalVulnerability] = useState<VulnerabilityInfoVO | null>(null); // 保存原始数据
    const [loading, setLoading] = useState<boolean>(false);
    const [newTag, setNewTag] = useState<string>('');
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [allTags, setAllTags] = useState<string[]>(['高危', '中危', '低危', 'SQL注入', 'XSS', 'CSRF', 'RCE']);

    // 查询漏洞详情
    const fetchVulnerability = async () => {
        if (!vulnId) {
            message.warning('请输入漏洞ID');
            return;
        }

        setLoading(true);
        try {
            const response = await getVulnerabilityDetail(Number(vulnId));
            if (response.code === '0000') {
                setVulnerability(response.data);
                setOriginalVulnerability({...response.data}); // 深拷贝保存原始数据
            } else {
                message.error(response.info || '获取漏洞详情失败');
            }
        } catch (error) {
            message.error('获取漏洞详情失败');
        } finally {
            setLoading(false);
        }
    };

    // 添加新标签到选项
    const handleAddTag = async () => {
        if (!newTag.trim()) {
            message.warning('请输入标签内容');
            return;
        }

        if (!vulnerability) {
            message.warning('请先查询漏洞信息');
            return;
        }

        setConfirmLoading(true);
        try {
            const response = await addTag({
                vulnId: vulnerability.id,
                tag: newTag.trim(),
            });

            if (response.code === '0000') {
                message.success('标签添加成功');
                // 更新标签选项
                if (!allTags.includes(newTag.trim())) {
                    setAllTags([...allTags, newTag.trim()]);
                }
                // 刷新数据
                await fetchVulnerability();
                setNewTag('');
                setOpen(false);
            } else {
                message.error(response.info || '标签添加失败');
            }
        } catch (error) {
            message.error('标签添加失败');
        } finally {
            setConfirmLoading(false);
        }
    };

    // 保存标签修改
    const handleSaveTags = async () => {
        if (!vulnerability || !originalVulnerability) return;

        // 检查是否有变化
        const currentTags = vulnerability.tag || [];
        const originalTags = originalVulnerability.tag || [];
        
        // 如果没有变化直接返回
        if (
            currentTags.length === originalTags.length &&
            currentTags.every(tag => originalTags.includes(tag)) &&
            originalTags.every(tag => currentTags.includes(tag))
        ) {
            message.info('没有检测到标签变更');
            setIsEditing(false);
            return;
        }

        setConfirmLoading(true);
        try {
            // 找出新增的标签
            const addedTags = currentTags.filter(tag => !originalTags.includes(tag));
            // 找出删除的标签
            const removedTags = originalTags.filter(tag => !currentTags.includes(tag));

            // 批量处理新增标签
            const addPromises = addedTags.map(tag => 
                addTag({
                    vulnId: vulnerability.id,
                    tag: tag
                })
            );

            // 批量处理删除标签
            const deletePromises = removedTags.map(tag =>
                deleteTag({
                    vulnId: vulnerability.id,
                    tag: tag
                })
            );

            // 等待所有请求完成
            await Promise.all([...addPromises, ...deletePromises]);
            
            message.success('标签更新成功');
            setIsEditing(false);
            // 刷新数据
            await fetchVulnerability();
        } catch (error) {
            message.error('标签更新失败');
            // 恢复原始数据
            if (originalVulnerability) {
                setVulnerability({...originalVulnerability});
            }
        } finally {
            setConfirmLoading(false);
        }
    };

    // 取消编辑
    const handleCancelEdit = () => {
        if (originalVulnerability) {
            setVulnerability({...originalVulnerability}); // 恢复原始数据
        }
        setIsEditing(false);
    };

    // 表格列定义
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
            title: '标签',
            dataIndex: 'tag',
            key: 'tag',
            render: (tags: string[], record: VulnerabilityInfoVO) => (
                <div onClick={(e) => e.stopPropagation()}>
                    {isEditing ? (
                        <Select
                            mode="tags"
                            style={{ width: '100%' }}
                            placeholder="请选择或输入标签"
                            value={vulnerability?.tag || []}
                            onChange={(value) => {
                                if (vulnerability) {
                                    setVulnerability({
                                        ...vulnerability,
                                        tag: value
                                    });
                                }
                            }}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <div style={{ padding: '8px', display: 'flex', gap: '8px' }}>
                                        <Input
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onPressEnter={() => {
                                                if (newTag.trim() && !allTags.includes(newTag.trim())) {
                                                    setAllTags([...allTags, newTag.trim()]);
                                                    if (vulnerability) {
                                                        setVulnerability({
                                                            ...vulnerability,
                                                            tag: [...(vulnerability.tag || []), newTag.trim()]
                                                        });
                                                    }
                                                    setNewTag('');
                                                }
                                            }}
                                            placeholder="输入新标签"
                                        />
                                        <Button
                                            type="link"
                                            size="small"
                                            onClick={() => {
                                                if (newTag.trim() && !allTags.includes(newTag.trim())) {
                                                    setAllTags([...allTags, newTag.trim()]);
                                                    if (vulnerability) {
                                                        setVulnerability({
                                                            ...vulnerability,
                                                            tag: [...(vulnerability.tag || []), newTag.trim()]
                                                        });
                                                    }
                                                    setNewTag('');
                                                }
                                            }}
                                        >
                                            添加
                                        </Button>
                                    </div>
                                </>
                            )}
                        >
                            {allTags.map((tag) => (
                                <Option key={tag} value={tag}>
                                    {tag}
                                </Option>
                            ))}
                        </Select>
                    ) : (
                        <div>
                            {tags?.map((tag, index) => (
                                <Tag key={index} style={{ marginBottom: 4, marginRight: 4 }}>
                                    {tag}
                                </Tag>
                            ))}
                            {(!tags || tags.length === 0) && <span>暂无标签</span>}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record: VulnerabilityInfoVO) => (
                <div>
                    {isEditing ? (
                        <>
                            <Button type="link" onClick={handleSaveTags} loading={confirmLoading}>
                                保存
                            </Button>
                            <Button type="link" onClick={handleCancelEdit}>
                                取消
                            </Button>
                        </>
                    ) : (
                        <Button type="link" onClick={() => setIsEditing(true)}>
                            编辑
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card title="漏洞标签管理" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    <Input
                        placeholder="输入漏洞ID"
                        value={vulnId}
                        onChange={(e) => setVulnId(e.target.value)}
                        style={{ width: 200 }}
                    />
                    <Button type="primary" onClick={fetchVulnerability} loading={loading}>
                        查询
                    </Button>
                    {vulnerability && (
                        <Button type="primary" onClick={() => setOpen(true)}>
                            添加标签
                        </Button>
                    )}
                </div>

                {vulnerability && (
                    <Table
                        dataSource={[vulnerability]}
                        columns={columns}
                        rowKey="id"
                        pagination={false}
                        loading={loading}
                    />
                )}
            </Card>

            {/* 添加标签模态框 */}
            <Modal
                title="添加新标签"
                open={open}
                onOk={handleAddTag}
                onCancel={() => setOpen(false)}
                confirmLoading={confirmLoading}
            >
                <Form layout="vertical">
                    <Form.Item label="新标签">
                        <Select
                            showSearch
                            mode="tags"
                            style={{ width: '100%' }}
                            placeholder="请选择或输入标签"
                            value={newTag ? [newTag] : []}
                            onChange={(value) => setNewTag(value[value.length - 1] || '')}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <div style={{ padding: '8px', display: 'flex', gap: '8px' }}>
                                        <Input
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="输入新标签"
                                        />
                                    </div>
                                </>
                            )}
                        >
                            {allTags.map((tag) => (
                                <Option key={tag} value={tag}>
                                    {tag}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TagManagePage;