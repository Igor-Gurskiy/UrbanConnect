import { Button, Form, Input } from 'antd';
import type { FC } from 'react';
import type { TRegister } from './types';
import { type Rule } from 'antd/es/form';

export const Register: FC<TRegister> = ({
	username,
	email,
	password,
	setUsername,
	setEmail,
	setPassword,
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

	const emailRules: Rule[] = [
		{ required: true, message: 'Пожалуйста, введите email' },
		{ type: 'email', message: 'Пожалуйста, введите корректный email' },
	];

	const passwordRules: Rule[] = [
		{ required: true, message: 'Пожалуйста, введите пароль' },
		{ min: 1, message: 'Пароль должен содержать минимум 6 символов' },
	];

	const usernameRules: Rule[] = [
		{ required: true, message: 'Пожалуйста, введите имя пользователя' },
		{ min: 3, message: 'Имя должно содержать минимум 3 символа' },
	];

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
					<Form.Item label="Username" name="username" rules={usernameRules}>
						<Input
							onChange={(e) => setUsername(e.target.value)}
							value={username}
						/>
					</Form.Item>
					<Form.Item label="Email" name="Email" rules={emailRules}>
						<Input onChange={(e) => setEmail(e.target.value)} value={email} />
					</Form.Item>
					<Form.Item label="Password" name="password" rules={passwordRules}>
						<Input.Password
							onChange={(e) => setPassword(e.target.value)}
							value={password}
						/>
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
