import { Alert, Button, Form, Input } from 'antd';
import { memo } from 'react';

interface AddMember {
	onClose: () => void;
	onSubmit: (values: { user: string }) => void;
	loading?: boolean;
	error?: string;
}

export const AddMemberUI: React.FC<AddMember> = memo(
	({ onClose, onSubmit, loading = false, error }) => {
		const [form] = Form.useForm();

		const handleSubmit = (values: { id: string }) => {
			onSubmit({ user: values.id });
			form.resetFields();
		};

		const handleCancel = () => {
			onClose();
			form.resetFields();
		};

		return (
			<div>
				{error && <Alert description={error} type="error" />}
				<Form form={form} onFinish={handleSubmit} layout="vertical">
					<Form.Item
						name="id"
						label="id"
						rules={[{ required: true, message: 'Please enter user id' }]}
					>
						<Input placeholder="Enter user id" />
					</Form.Item>

					<div className={`d-flex justify-content-end gap-2`}>
						<Button onClick={handleCancel}>Cancel</Button>
						<Button type="primary" htmlType="submit" loading={loading}>
							Save
						</Button>
					</div>
				</Form>
			</div>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.loading === nextProps.loading &&
			prevProps.error === nextProps.error
		);
	}
);
