import { z } from 'zod';

export const profileSchema = z.object({
	firstName: z.string().min(1, 'Введите имя').max(10, 'Не более 10 символов'),
	lastName: z
		.string()
		.min(1, 'Введите фамилию')
		.max(10, 'Не более 10 символов'),
	avatar: z
		.string()
		.url('Введите корректный URL')
		.refine((url) => url === '' || /\.(jpg|jpeg|png|gif|webp)$/i.test(url), {
			message: 'URL должен вести к изображению (jpg, png, gif, webp)',
		})
		.optional()
		.or(z.literal('')),
});
