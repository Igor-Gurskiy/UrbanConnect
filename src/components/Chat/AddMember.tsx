import { useDispatch, useSelector } from '../../services/store';
import {
	addUserToGroupChat,
	selectError,
	selectOpenChat,
} from '../../services/slices/Chat/Chat';
import { memo, useCallback } from 'react';
import { AddMemberUI } from '../ui/GroupChat/AddMember';
import { useNavigate, useParams } from 'react-router-dom';

export const AddMember: React.FC = memo(() => {
	const navigate = useNavigate();
	const { id } = useParams();
	const dispatch = useDispatch();
	const error = useSelector(selectError);
	const selectedChat = useSelector(selectOpenChat);
	const handleSubmit = useCallback(
		async (values: { user: string }) => {
			if (!id || !selectedChat) return;

			try {
				const result = await dispatch(
					addUserToGroupChat({
						id: id,
						user: values.user,
					})
				).unwrap();

				if (result.success) {
					handleClose();
				}
			} catch (error) {
				console.error('Failed to update chat:', error);
			}
		},
		[id, selectedChat, dispatch]
	);
	const handleClose = useCallback(() => {
		navigate(-1);
	}, [navigate]);
	return (
		<AddMemberUI onClose={handleClose} onSubmit={handleSubmit} error={error} />
	);
});
