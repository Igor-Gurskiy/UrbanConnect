import { z } from 'zod';

export const passwordSchema = z
	.object({
		oldPassword: z.string().min(1, 'Пароль должен содержать минимум 1 символ'),
		newPassword: z.string().min(1, 'Пароль должен содержать минимум 1 символ'),
		confirmPassword: z
			.string()
			.min(1, 'Пароль должен содержать минимум 1 символ'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Пароли не совпадают',
		path: ['confirmPassword'],
	});
