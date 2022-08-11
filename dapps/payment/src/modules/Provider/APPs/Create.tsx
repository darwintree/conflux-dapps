import { useEffect, useState, useMemo, useCallback } from 'react';
import { Table, Button, Input, Row, Col, Modal, Form, InputNumber } from 'antd';

export default () => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const showModal = useCallback(() => setIsModalVisible(true), []);

    const handleOk = useCallback(() => {
        form.validateFields().then(async function ({ name, url, weight }) {
            try {
                console.log(name, url, weight);
            } catch (e) {}
        });
    }, []);

    const handleCancel = useCallback(() => {
        form.resetFields();
        setIsModalVisible(false);
    }, []);

    return (
        <>
            <Button size="small" className="mb-4" type="primary" onClick={showModal}>
                Create APP
            </Button>
            <Modal title="Create New APP" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form} name="basic" autoComplete="off" layout="vertical">
                    <Form.Item
                        label="APP Name"
                        name="name"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please input APP name',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="BaseURL"
                        name="url"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please input APP base url',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Default Resource Weight"
                        name="weight"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please input APP default resource weight',
                            },
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={1} precision={0} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
