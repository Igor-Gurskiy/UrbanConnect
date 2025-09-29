import { useEffect, useState } from 'react';
import type { TUser } from '../../utils/types';
import { ProfileUI } from '../ui/Profile/Profile';
import { useDispatch, useSelector } from '../../services/store';
import {
	clearError,
	selectError,
	selectUser,
	updatePassword,
	updateUser,
} from '../../services/slices/Profile/Profile';

export const Profile = () => {
	const dispatch = useDispatch();
	const user = useSelector(selectUser);
	const error = useSelector(selectError);
	useEffect(() => {
		return () => {
			dispatch(clearError());
		};
	}, [dispatch]);
	const handleUpdateProfile = async (
		updateData: Partial<TUser> & { oldPassword?: string; newPassword?: string }
	) => {
		dispatch(clearError());
		// Обновляем данные пользователя
		if (updateData.name || updateData.avatar) {
			dispatch(
				updateUser({ name: updateData.name, avatar: updateData.avatar })
			);
		}
		// Обрабатываем смену пароля
		if (updateData.oldPassword && updateData.newPassword) {
			return dispatch(
				updatePassword({
					oldPassword: updateData.oldPassword,
					newPassword: updateData.newPassword,
				})
			).unwrap();
		}
	};
	return <ProfileUI user={user} error={error} onUpdate={handleUpdateProfile} />;
};
