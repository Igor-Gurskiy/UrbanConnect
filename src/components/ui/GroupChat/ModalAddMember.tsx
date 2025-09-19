import { Alert, Button, Form, Input, Modal } from 'antd';
import { memo } from 'react';

interface ModalAddMember {
	open: boolean;
	onClose: () => void;
	onSubmit: (values: { user: string }) => void;
	loading?: boolean;
	error?: string;
}

export const ModalAddMemberUI: React.FC<ModalAddMember> = memo(
	({ open, onClose, onSubmit, loading = false, error }) => {
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
			<Modal
				open={open}
				onCancel={handleCancel}
				title="Edit Group Chat"
				footer={null}
			>
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
			</Modal>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.open === nextProps.open &&
			prevProps.loading === nextProps.loading &&
			prevProps.error === nextProps.error
		);
	}
);
