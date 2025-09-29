import { memo, type FC } from 'react';
import { Button, Form, Input } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
interface IGroupChat {
	onCreateChat: (chat: {
		ChatName: string;
		Avatar: string;
		Users: string;
	}) => void;
	onGoBack: () => void;
}

const formItemLayout = {
	labelCol: {
		sm: { span: 6 },
	},
	wrapperCol: {
		sm: { span: 14 },
	},
};

export const GroupChatUI: FC<IGroupChat> = memo(
	({ onCreateChat, onGoBack }) => {
		const [form] = Form.useForm();
		const variant = Form.useWatch('variant', form);

		const onFinish = (values: {
			ChatName: string;
			Avatar: string;
			Users: string;
		}) => {
			onCreateChat(values);
			form.resetFields();
		};

		return (
			<div className="d-flex flex-column flex-sm-row justify-content-center align-items-center w-100 mw-px-800 p-sm-5">
				{/* Кнопка возврата */}
				<Button type="default" onClick={onGoBack} icon={<ArrowLeftOutlined />}>
					Назад
				</Button>
				<Form
					className="p-3 w-100"
					{...formItemLayout}
					form={form}
					variant={variant || 'filled'}
					initialValues={{ variant: 'filled' }}
					onFinish={onFinish}
				>
					<Form.Item
						label="Chat name"
						name="ChatName"
						rules={[{ required: true, message: 'Please input!' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label="Avatar"
						name="Avatar"
						rules={[{ required: false, message: 'Please input!' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label="Users"
						name="Users"
						rules={[{ required: false, message: 'Please input!' }]}
					>
						<Input placeholder="User ID 1, User ID 2 ..." />
					</Form.Item>

					<Form.Item className="d-flex justify-content-center">
						<Button type="primary" htmlType="submit">
							Create
						</Button>
					</Form.Item>
				</Form>
			</div>
		);
	},
	(prevProps, nextProps) => {
		return prevProps.onCreateChat === nextProps.onCreateChat;
	}
);
