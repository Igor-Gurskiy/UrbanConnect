import { useDispatch, useSelector } from '../../services/store';
import { EditGroupUI } from '../ui/GroupChat/EditGroup';
import {
	selectError,
	selectOpenChat,
	updateGroupChat,
} from '../../services/slices/Chat/Chat';
import { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export const EditGroup: React.FC = memo(() => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const error = useSelector(selectError);
	const selectedChat = useSelector(selectOpenChat);
	const handleClose = useCallback(() => {
		navigate(-1);
	}, [navigate]);
	const handleSubmit = useCallback(
		async (values: { name: string; avatar: string }) => {
			if (!selectedChat) return;

			try {
				const result = await dispatch(
					updateGroupChat({
						id: selectedChat.id,
						name: values.name,
						avatar: values.avatar,
					})
				).unwrap();
				if (result.success) {
					handleClose();
				}
			} catch (error) {
				console.error('Failed to update chat:', error);
			}
		},
		[selectedChat, dispatch, handleClose]
	);

	const initialValues = useMemo(
		() => ({
			name: selectedChat?.name || '',
			avatar: selectedChat?.avatar || '',
		}),
		[selectedChat?.name, selectedChat?.avatar]
	);

	return (
		<EditGroupUI
			onClose={handleClose}
			onSubmit={handleSubmit}
			initialValues={initialValues}
			error={error}
		/>
	);
});
