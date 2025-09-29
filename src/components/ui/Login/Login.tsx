import { Button, Form, Input, Checkbox } from 'antd';
import type { FC } from 'react';
import type { TLogin } from './types';

export const Login: FC<TLogin> = ({
	email,
	password,
	remember,
	setEmail,
	setPassword,
	setRemember,
	handleSubmit,
	error,
}) => {
	const responsiveLayout = {
		labelCol: {
			xs: { span: 24 },
			sm: { span: 6 },
		},
		wrapperCol: {
			xs: { span: 24 },
			sm: { span: 18 },
		},
	};

	return (
		<div className="d-flex flex-column align-items-center justify-content-center ">
			<div
				style={{
					width: '100%',
					maxWidth: '390px',
					padding: '40px 20px',
					position: 'relative',
				}}
			>
				<Form {...responsiveLayout} onFinish={handleSubmit} key="auth-form">
					{error && (
						<div
							className="text-center w-100 text-red"
							style={{
								position: 'absolute',
								top: '0',
								left: '0',
								color: 'red',
							}}
						>
							{error}
						</div>
					)}
					<Form.Item label="Email" name="Email">
						<Input onChange={(e) => setEmail(e.target.value)} value={email} />
					</Form.Item>
					<Form.Item label="Password" name="password">
						<Input.Password
							onChange={(e) => setPassword(e.target.value)}
							value={password}
						/>
					</Form.Item>
					<Form.Item
						name="remember"
						valuePropName="checked"
						wrapperCol={{
							xs: { span: 24 },
							sm: { span: 18, offset: 6 },
						}}
					>
						<div className="d-flex justify-content-center w-100">
							<Checkbox
								checked={remember}
								onChange={(e) => setRemember(e.target.checked)}
							>
								Remember me
							</Checkbox>
						</div>
					</Form.Item>
					<Form.Item
						wrapperCol={{
							xs: { span: 24 },
							sm: { span: 18, offset: 6 },
						}}
					>
						<div className="d-flex justify-content-center w-100">
							<Button
								htmlType="submit"
								type="default"
								style={{ minWidth: '120px' }}
							>
								Submit
							</Button>
						</div>
					</Form.Item>
				</Form>
			</div>
		</div>
	);
};
