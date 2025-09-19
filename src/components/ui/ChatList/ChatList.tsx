import { Avatar, Button, List, Typography } from 'antd';
import { memo, useCallback, type FC } from 'react';
import type { TChatList } from './types';
import type { TChat } from '../../../utils/types';
import { DeleteOutlined } from '@ant-design/icons';

const avatarContent = (chat: TChat) =>
	chat.avatar ? null : chat.name.slice(0, 1).toUpperCase();

const chatName = (chat: TChat) =>
	chat.type === 'group' ? chat.name : chat.name.replace('-', ' ');

const formatTime = (time: string) => {
	const date = new Date(time);
	return date.toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	});
};

export const ChatListUI: FC<TChatList> = memo(
	({ chats, onChatSelect, onChatDelete }) => {
		const handleChatDelete = useCallback(
			(chatId: string) => {
				onChatDelete(chatId);
			},
			[onChatDelete]
		);

		const renderChat = useCallback(
			(chat: TChat) => (
				<List.Item
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: '16px',
						padding: '12px 16px',
						borderBottom: '1px solid #f0f0f0',
					}}
					onClick={() => onChatSelect(chat)}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
						<Avatar>{avatarContent(chat)}</Avatar>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								maxWidth: '200px',
							}}
						>
							<Typography.Paragraph
								style={{
									fontWeight: 'bold',
									overflow: 'hidden',
									whiteSpace: 'nowrap',
									textOverflow: 'ellipsis',
								}}
							>
								{chatName(chat)}
							</Typography.Paragraph>
							<Typography.Paragraph
								style={{
									overflow: 'hidden',
									whiteSpace: 'nowrap',
									textOverflow: 'ellipsis',
								}}
							>
								{chat.lastMessage?.text}
							</Typography.Paragraph>
						</div>
					</div>
					<div style={{ display: 'flex', gap: '8px' }}>
						{chat.lastMessage && (
							<Typography.Paragraph>
								{formatTime(chat.lastMessage.createdAt)}
							</Typography.Paragraph>
						)}
						<Button
							type="text"
							icon={<DeleteOutlined />}
							size="small"
							onClick={(e) => {
								e.stopPropagation();
								handleChatDelete(chat.id);
							}}
						/>
					</div>
				</List.Item>
			),
			[onChatSelect, handleChatDelete]
		);

		return (
			<>
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						width: '100%',
						padding: '16px',
					}}
				>
					<List
						style={{
							width: '100%',
							maxWidth: 400,
						}}
						dataSource={chats}
						renderItem={renderChat}
					></List>
				</div>
			</>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.chats === nextProps.chats &&
			prevProps.onChatSelect === nextProps.onChatSelect &&
			prevProps.onChatDelete === nextProps.onChatDelete
		);
	}
);
