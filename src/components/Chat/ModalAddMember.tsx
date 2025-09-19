import { useDispatch, useSelector } from '../../services/store';
import {
	addUserToGroupChat,
	selectError,
} from '../../services/slices/Chat/Chat';
import type { TChat } from '../../utils/types';
import { memo, useCallback } from 'react';
import { ModalAddMemberUI } from '../ui/GroupChat/ModalAddMember';

interface ModalAddMember {
	open: boolean;
	onClose: () => void;
	selectedChat: TChat | null;
}

export const ModalAddMember: React.FC<ModalAddMember> = memo(
	({ open, onClose, selectedChat }) => {
		const dispatch = useDispatch();
		const error = useSelector(selectError);
		const handleSubmit = useCallback(
			async (values: { user: string }) => {
				if (!selectedChat) return;

				try {
					const result = await dispatch(
						addUserToGroupChat({
							id: selectedChat.id,
							user: values.user,
						})
					).unwrap();

					if (result.success) {
						onClose();
					}
				} catch (error) {
					console.error('Failed to update chat:', error);
				}
			},
			[selectedChat, dispatch, onClose]
		);

		return (
			<ModalAddMemberUI
				open={open}
				onClose={onClose}
				onSubmit={handleSubmit}
				error={error}
			/>
		);
	},
	(prevProps, nextProps) => {
		return prevProps.open === nextProps.open;
	}
);
