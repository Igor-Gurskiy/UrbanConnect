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
					className="p-2 border-bottom"
					style={{
						display: 'grid',
						gridTemplateColumns: 'auto 1fr auto',
						alignItems: 'center',
					}}
					onClick={() => onChatSelect(chat)}
				>
					<Avatar
						style={{
							flexShrink: 0,
						}}
					>
						{avatarContent(chat)}
					</Avatar>
					<div
						style={{
							minWidth: 0,
							flex: 1,
							paddingInline: '8px',
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
					<div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
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
					className="d-flex flex-column h-100"
					style={{
						minHeight: 0,
					}}
				>
					<List
						style={{
							flex: 1,
							overflowY: 'auto',
							height: '100%',
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
