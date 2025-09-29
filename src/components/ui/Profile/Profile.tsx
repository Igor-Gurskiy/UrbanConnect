import { useEffect, useState } from 'react';
import type { TUser } from '../../../utils/types';
import { Button, Input, Typography } from 'antd';
import { passwordSchema } from '../../../schemas/pasword';
import { profileSchema } from '../../../schemas/profile';
import { ZodError } from 'zod';

interface IProfileUI {
	user: TUser | null;
	error: string | null;
	onUpdate: (
		userData: Partial<TUser> & { oldPassword?: string; newPassword?: string }
	) => void;
}

export const ProfileUI: React.FC<IProfileUI> = ({ user, error, onUpdate }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		avatar: '',
	});
	const [passwordData, setPasswordData] = useState({
		oldPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

	const splitName = (fullName: string) => {
		const parts = fullName.split('-');
		return {
			firstName: parts[0] || '',
			lastName: parts[1] || '',
		};
	};

	const joinName = (firstName: string, lastName: string) => {
		return `${firstName}${lastName ? '-' + lastName : ''}`;
	};

	useEffect(() => {
		if (!user) return;
		const nameParts = splitName(user.name);
		setFormData({
			firstName: nameParts.firstName,
			lastName: nameParts.lastName,
			avatar: user.avatar || '',
		});
	}, [user]);

	const handleSave = () => {
		setFieldErrors({});
		try {
			profileSchema.parse(formData);
		} catch (validationError) {
			if (validationError instanceof ZodError) {
				const errors: { [key: string]: string } = {};
				validationError.issues.forEach((issue) => {
					const field = issue.path[0];
					if (field && typeof field === 'string') {
						errors[field] = issue.message;
					}
				});
				setFieldErrors(errors);
			}
			return;
		}

		const fullName = joinName(formData.firstName, formData.lastName);

		onUpdate({
			...formData,
			name: fullName,
			avatar: formData.avatar,
		});
		setIsEditing(false);
	};

	const handleCancelEdit = () => {
		if (!user) return;
		const nameParts = splitName(user.name);
		setFormData({
			firstName: nameParts.firstName,
			lastName: nameParts.lastName,
			avatar: user.avatar || '',
		});
		setIsEditing(false);
	};

	// 	const handlePasswordChange = async () => {
	// 		setLocalError('');
	// 		setFieldErrors({});

	// 		if (passwordData.newPassword !== passwordData.confirmPassword) {
	// 			setLocalError('Пароли не совпадают');
	// 			return;
	// 		}

	// 		if (!passwordData.oldPassword || !passwordData.newPassword) {
	//     		setLocalError('Заполните все поля');
	//     		return;
	//  		}
	//         try {
	//     await onUpdate({
	//       oldPassword: passwordData.oldPassword,
	//       newPassword: passwordData.newPassword,
	//     });

	//     setIsChangingPassword(false);
	//     setPasswordData({
	//       oldPassword: '',
	//       newPassword: '',
	//       confirmPassword: ''
	//     });
	//     setLocalError('');
	//   } catch (error) {
	//   }

	// };

	const handlePasswordChange = async () => {
		setFieldErrors({});
		try {
			// Сначала валидация
			passwordSchema.parse(passwordData);
		} catch (validationError) {
			if (validationError instanceof ZodError) {
				const errors: { [key: string]: string } = {};
				validationError.issues.forEach((issue) => {
					const field = issue.path[0];
					if (field && typeof field === 'string') {
						errors[field] = issue.message;
					}
				});
				setFieldErrors(errors);
			}
			return;
		}

		try {
			await onUpdate({
				oldPassword: passwordData.oldPassword,
				newPassword: passwordData.newPassword,
			});

			setIsChangingPassword(false);
			setPasswordData({
				oldPassword: '',
				newPassword: '',
				confirmPassword: '',
			});
		} catch (backendError: any) {
			setFieldErrors({ oldPassword: backendError.message });
		}
	};

	const handleCancelPasswordChange = () => {
		setIsChangingPassword(false);
		setPasswordData({
			oldPassword: '',
			newPassword: '',
			confirmPassword: '',
		});
	};
	const clearFieldError = (fieldName: string) => {
		setFieldErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[fieldName];
			return newErrors;
		});
	};

	const getAvatarDisplay = () => {
		if (formData.avatar) {
			return (
				<div
					className="rounded-circle overflow-hidden"
					style={{ width: '120px', height: '120px', margin: '0 auto' }}
				>
					<img
						src={formData.avatar}
						alt="Avatar"
						className="rounded-circle"
						style={{ width: '100%', height: '100%', objectFit: 'cover' }}
						onError={(e) => {
							e.currentTarget.style.display = 'none';
						}}
					/>
				</div>
			);
		}
		return (
			<div
				className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
				style={{ width: '120px', height: '120px' }}
			>
				<span className="text-white fw-bold" style={{ fontSize: '4rem' }}>
					{user?.name?.charAt(0) || 'U'}
				</span>
			</div>
		);
	};
	return (
		<div className="container py-5">
			<div className="row justify-content-center">
				<div className="col-md-8 col-lg-6">
					<div className="card shadow">
						<div className="card-body p-4">
							{/* Аватар и основная информация */}
							<div className="text-center mb-4">
								{getAvatarDisplay()}

								{isEditing ? (
									<div className="mt-4 text-start">
										<label className="form-label text-muted small">
											URL аватарки
										</label>
										<Input
											type="text"
											className={`form-control ${fieldErrors.avatar ? 'is-invalid' : ''}`}
											value={formData.avatar}
											onChange={(e) => {
												setFormData({ ...formData, avatar: e.target.value });
												clearFieldError('avatar');
											}}
										/>

										{fieldErrors.avatar && (
											<div className="invalid-feedback position-absolute">
												{fieldErrors.avatar}
											</div>
										)}
									</div>
								) : (
									<div>
										<Typography.Title level={4} className="mt-3 mb-1">
											{user?.name}
										</Typography.Title>
										<p className="text-muted mb-0">{user?.email}</p>
									</div>
								)}
							</div>

							{/* Форма редактирования */}
							{isEditing ? (
								<div>
									<div className="mb-4">
										<label className="form-label text-muted small">Имя</label>
										<Input
											type="text"
											className={`form-control ${fieldErrors.firstName ? 'is-invalid' : ''}`}
											value={formData.firstName}
											onChange={(e) => {
												setFormData({ ...formData, firstName: e.target.value });
												clearFieldError('firstName');
											}}
										/>

										{fieldErrors.firstName && (
											<div className="invalid-feedback position-absolute">
												{fieldErrors.firstName}
											</div>
										)}
									</div>
									<div className="mb-5">
										<label className="form-label text-muted small">
											Фамилия
										</label>
										<Input
											type="text"
											className={`form-control ${fieldErrors.lastName ? 'is-invalid' : ''}`}
											value={formData.lastName}
											onChange={(e) => {
												setFormData({ ...formData, lastName: e.target.value });
												clearFieldError('lastName');
											}}
										/>

										{fieldErrors.lastName && (
											<div className="invalid-feedback position-absolute">
												{fieldErrors.lastName}
											</div>
										)}
									</div>
									<div className="d-flex gap-2">
										<Button type="default" className="" onClick={handleSave}>
											Сохранить
										</Button>
										<Button
											type="default"
											className=""
											onClick={handleCancelEdit}
										>
											Отмена
										</Button>
									</div>
								</div>
							) : isChangingPassword ? (
								<div className="position-relative">
									<h6>Смена пароля</h6>

									<div className="mb-4">
										<label className="form-label text-muted small">
											Старый пароль
										</label>
										<Input
											type="password"
											className={`form-control ${fieldErrors.oldPassword ? 'is-invalid' : ''}`}
											value={passwordData.oldPassword}
											onChange={(e) => {
												setPasswordData({
													...passwordData,
													oldPassword: e.target.value,
												});
												clearFieldError('oldPassword');
											}}
										/>

										{fieldErrors.oldPassword && (
											<div className="invalid-feedback position-absolute">
												{fieldErrors.oldPassword}
											</div>
										)}
									</div>
									<div className="mb-4">
										<label className="form-label text-muted small">
											Новый пароль
										</label>
										<Input
											type="password"
											className={`form-control ${fieldErrors.newPassword ? 'is-invalid' : ''}`}
											value={passwordData.newPassword}
											onChange={(e) => {
												setPasswordData({
													...passwordData,
													newPassword: e.target.value,
												});
												clearFieldError('newPassword');
											}}
										/>

										{fieldErrors.newPassword && (
											<div className="invalid-feedback position-absolute">
												{fieldErrors.newPassword}
											</div>
										)}
									</div>
									<div className="mb-5">
										<label className="form-label text-muted small">
											Подтвердите новый пароль
										</label>
										<Input
											type="password"
											className={`form-control ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
											value={passwordData.confirmPassword}
											onChange={(e) => {
												setPasswordData({
													...passwordData,
													confirmPassword: e.target.value,
												});
												clearFieldError('confirmPassword');
											}}
										/>

										{fieldErrors.confirmPassword && (
											<div className="invalid-feedback position-absolute">
												{fieldErrors.confirmPassword}
											</div>
										)}
									</div>

									<div className="d-flex gap-2">
										<Button
											type="default"
											className=""
											onClick={handlePasswordChange}
										>
											Сменить пароль
										</Button>
										<Button
											type="default"
											className=""
											onClick={handleCancelPasswordChange}
										>
											Отмена
										</Button>
									</div>
								</div>
							) : (
								<div>
									<div className="mb-3">
										<label className="form-label text-muted small">Имя</label>
										<p className="mb-0">{user?.name}</p>
									</div>
									<div className="mb-3">
										<label className="form-label text-muted small">Email</label>
										<p className="mb-0">{user?.email}</p>
									</div>
								</div>
							)}

							{/* Кнопки действий */}
							{!isEditing && !isChangingPassword && (
								<div className="d-grid gap-2">
									<Button
										type="default"
										className=""
										onClick={() => setIsEditing(true)}
									>
										Редактировать профиль
									</Button>
									<Button
										type="default"
										className=""
										onClick={() => setIsChangingPassword(true)}
									>
										Сменить пароль
									</Button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
