"use client";
import React, { useState, useEffect } from 'react';
import { Button, Input, Table, Tag, message, Card, Form, Modal } from 'antd';
import { addTag, deleteTag, getVulnerabilityDetail } from '@/api/index';
import { VulnerabilityInfoVO } from '@/types/VulnerabilityInfoVO';

const TagManagePage: React.FC = () => {
    const [vulnId, setVulnId] = useState<string>('');
    const [open, setOpen] = useState(false);
    const [vulnerability, setVulnerability] = useState<VulnerabilityInfoVO | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [newTag, setNewTag] = useState<string>('');
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [deleteTagModal, setDeleteTagModal] = useState<{ visible: boolean; tag: string | null }>({
        visible: false,
        tag: null,
    });

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
            } else {
                message.error(response.info || '获取漏洞详情失败');
            }
        } catch (error) {
            message.error('获取漏洞详情失败');
        } finally {
            setLoading(false);
        }
    };

    // 添加标签
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

    // 显示删除标签确认框
    const showDeleteTagModal = (tag: string) => {
        setDeleteTagModal({
            visible: true,
            tag,
        });
    };

    // 处理删除标签
    const handleDeleteTag = async () => {
        if (deleteTagModal.tag && vulnerability) {
            try {
                const response = await deleteTag({
                    vulnId: vulnerability.id,
                    tag: deleteTagModal.tag,
                });

                if (response.code === '0000') {
                    message.success('标签删除成功');
                    await fetchVulnerability();
                } else {
                    message.error(response.info || '标签删除失败');
                }
            } catch (error) {
                message.error('标签删除失败');
            } finally {
                setDeleteTagModal({ visible: false, tag: null });
            }
        }
    };

    // 取消删除标签
    const handleCancelDeleteTag = () => {
        setDeleteTagModal({ visible: false, tag: null });
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
            render: (tags: string[]) => (
                <div onClick={(e) => e.stopPropagation()}>
                    {tags?.map((tag, index) => (
                        <Tag
                            key={index}
                            closable
                            onClose={(e) => {
                                e.stopPropagation();
                                showDeleteTagModal(tag); // 显示删除标签确认框
                            }}
                            style={{ marginBottom: 4, marginRight: 4 }}
                        >
                            {tag}
                        </Tag>
                    ))}
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
                        <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="输入新标签内容"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 删除标签确认框 */}
            <Modal
                title="确认删除标签"
                open={deleteTagModal.visible}
                onOk={handleDeleteTag}
                onCancel={handleCancelDeleteTag}
                confirmLoading={confirmLoading}
            >
                <p>确定要删除标签 "{deleteTagModal.tag}" 吗？</p>
            </Modal>
        </div>
    );
};

export default TagManagePage;
