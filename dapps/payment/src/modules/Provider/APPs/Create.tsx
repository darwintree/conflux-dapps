import { useState, useCallback } from 'react';
import { Button, Input, Modal, Form, InputNumber } from 'antd';
import { postAPP } from 'payment/src/utils/request';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { showToast } from 'common/components/showPopup/Toast';
import Tip from 'payment/src/components/Tip';
import { formatNumber } from 'payment/src/utils';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    onComplete?: (data: any) => void;
}

export default ({ onComplete }: Props) => {
    const account = useAccount();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const showModal = useCallback(() => setIsModalVisible(true), []);

    const handleOk = useCallback(() => {
        form.validateFields().then(async function ({ name, url, weight }) {
            try {
                setLoading(true);
                const data = await postAPP({
                    name,
                    url,
                    weight,
                    account: account as string,
                });
                setLoading(false);
                setIsModalVisible(false);
                onComplete && onComplete(data);
                showToast('Create APP success', { type: 'success' });
            } catch (e) {
                console.log(e);
                setLoading(false);
            }
        });
    }, []);

    const handleCancel = useCallback(() => {
        form.resetFields();
        setIsModalVisible(false);
    }, []);

    return (
        <>
            <AuthESpace
                className="!rounded-sm"
                id="createAPP_authConnect"
                size="small"
                connectTextType="concise"
                checkChainMatch={true}
                color="primary"
                shape="rect"
                authContent={() => (
                    <Button id="button_createAPP" type="primary" onClick={showModal}>
                        Create APP
                    </Button>
                )}
            />
            <Modal
                title="Create New APP"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Confirm"
                cancelText="Cancel"
                confirmLoading={loading}
                wrapClassName="createAPP_modal"
                okButtonProps={{
                    id: 'button_ok',
                }}
                cancelButtonProps={{
                    id: 'button_cancel',
                }}
            >
                <Form form={form} name="basic" autoComplete="off" layout="vertical">
                    <Form.Item
                        label={
                            <>
                                APP Name
                                <Tip info="Contract name for your APIs collection."></Tip>
                            </>
                        }
                        name="name"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please input APP name',
                            },
                            {
                                min: 1,
                                max: 225,
                                message: 'Please input APP name with 1-225 character',
                            },
                        ]}
                    >
                        <Input id="input_APPName" />
                    </Form.Item>
                    <Form.Item
                        label={
                            <>
                                BaseURL
                                <Tip info="It is recommended to input the interface baseURL so that consumers can know more information."></Tip>
                            </>
                        }
                        name="url"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please input APP base url',
                            },
                            {
                                min: 1,
                                max: 1000,
                                message: 'Please input APP name with 1-1000 character',
                            },
                        ]}
                    >
                        <Input id="input_BaseURL" />
                    </Form.Item>
                    <Form.Item
                        label={
                            <>
                                Default Resource Weight
                                <Tip info="Initialize billing weight for default resource usage when creating new APP."></Tip>
                            </>
                        }
                        name="weight"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please input APP default resource weight',
                            },
                            {
                                type: 'string',
                                min: 0,
                                max: 40,
                                message: 'Please input APP default resource weight with 1-40 character',
                            },
                        ]}
                    >
                        <InputNumber
                            id="input_ResourceWeight"
                            style={{ width: '100%' }}
                            min={0}
                            precision={5}
                            stringMode={true}
                            formatter={(val) => {
                                return formatNumber(val as number, {
                                    limit: 0,
                                    decimal: 0,
                                });
                            }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};