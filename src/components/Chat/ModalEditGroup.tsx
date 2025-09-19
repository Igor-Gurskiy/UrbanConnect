// ModalEditGroup.tsx
// import { useState } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { ModalEditGroupUI } from '../ui/GroupChat/ModalEditGroup';
import { selectError, updateGroupChat } from '../../services/slices/Chat/Chat';
import type { TChat } from '../../utils/types';
import { memo, useCallback, useMemo } from 'react';

interface ModalEditGroupProps {
	open: boolean;
	onClose: () => void;
	selectedChat: TChat | null;
}

export const ModalEditGroup: React.FC<ModalEditGroupProps> = memo(
	({ open, onClose, selectedChat }) => {
		const dispatch = useDispatch();
		const error = useSelector(selectError);
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
						onClose();
					}
				} catch (error) {
					console.error('Failed to update chat:', error);
				}
			},
			[selectedChat, dispatch, onClose]
		);

		const initialValues = useMemo(
			() => ({
				name: selectedChat?.name || '',
				avatar: selectedChat?.avatar || '',
			}),
			[selectedChat?.name, selectedChat?.avatar]
		);

		return (
			<ModalEditGroupUI
				open={open}
				onClose={onClose}
				onSubmit={handleSubmit}
				initialValues={initialValues}
				error={error}
			/>
		);
	},
	(prevProps, nextProps) => prevProps.open === nextProps.open
);
