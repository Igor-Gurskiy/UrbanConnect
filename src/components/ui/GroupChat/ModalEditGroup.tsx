import { Alert, Button, Form, Input, Modal } from 'antd';
import { memo } from 'react';

interface ModalEditGroupUIProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (values: { name: string; avatar: string }) => void;
	initialValues?: {
		name: string;
		avatar: string;
	};
	error?: string;
	loading?: boolean;
}

export const ModalEditGroupUI: React.FC<ModalEditGroupUIProps> = memo(
	({ open, onClose, onSubmit, initialValues, error, loading = false }) => {
		const [form] = Form.useForm();

		const handleSubmit = (values: { name: string; avatar: string }) => {
			onSubmit(values);
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
				<Form
					form={form}
					initialValues={initialValues}
					onFinish={handleSubmit}
					layout="vertical"
				>
					<Form.Item
						name="name"
						label="Group Name"
						rules={[{ required: true, message: 'Please enter group name' }]}
					>
						<Input placeholder="Enter group name" />
					</Form.Item>

					<Form.Item name="avatar" label="Avatar URL">
						<Input placeholder="Enter avatar URL (optional)" />
					</Form.Item>

					<div className="d-flex justify-content-end gap-2">
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
			prevProps.initialValues === nextProps.initialValues
		);
	}
);
