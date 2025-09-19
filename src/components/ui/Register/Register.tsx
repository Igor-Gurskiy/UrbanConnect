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
	const layout = {
		labelCol: { span: 8 },
		wrapperCol: { span: 16 },
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
		<Form
			{...layout}
			style={{ maxWidth: 600 }}
			onFinish={handleSubmit}
			key="auth-form"
		>
			{error && (
				<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
					<div style={{ color: 'red' }}>{error}</div>
				</Form.Item>
			)}
			<Form.Item label="Username" name="username" rules={usernameRules}>
				<Input onChange={(e) => setUsername(e.target.value)} value={username} />
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
			<Button htmlType="submit" type="default">
				Submit
			</Button>
		</Form>
	);
};
