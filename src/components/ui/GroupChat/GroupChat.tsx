import { memo, type FC } from 'react';
import { Button, Form, Input } from 'antd';

interface IGroupChat {
	onCreateChat: (chat: {
		ChatName: string;
		Avatar: string;
		Users: string;
	}) => void;
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
	({ onCreateChat }) => {
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
			<Form
				{...formItemLayout}
				form={form}
				variant={variant || 'filled'}
				style={{ maxWidth: 600, padding: 16 }}
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

				<Form.Item wrapperCol={{ offset: 6, span: 16 }}>
					<Button type="primary" htmlType="submit">
						Create
					</Button>
				</Form.Item>
			</Form>
		);
	},
	(prevProps, nextProps) => {
		return prevProps.onCreateChat === nextProps.onCreateChat;
	}
);
