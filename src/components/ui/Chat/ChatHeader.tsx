import { Avatar, Button, Typography } from 'antd';
import { type TChatHeader } from './types';
import { type FC, memo, useMemo } from 'react';

export const ChatHeaderUI: FC<TChatHeader> = memo(
	({ name, avatar, isOnline, type, isAdmin, onAddMember, onEditGroup }) => {
		const avatarContent = avatar ? null : name.slice(0, 1).toUpperCase();
		const chatName = useMemo(
			() => (type === 'private' ? name.replace('-', ' ') : name),
			[type, name]
		);
		return (
			<div className="d-flex align-items-center gap-4 bg-gray p-2 m">
				<Avatar
					src={avatar && avatar.trim() !== '' ? avatar : null}
					size="large"
				>
					{avatarContent}
				</Avatar>
				<div className="d-flex flex-column align-items-start justify-content-center">
					<Typography.Paragraph className="fs-5 m-0">
						{chatName}
					</Typography.Paragraph>
					<Typography.Paragraph
						className="fs-6 m-0"
						style={{
							opacity: type === 'private' ? 1 : 0,
						}}
					>
						{isOnline ? 'Online' : 'Offline'}
					</Typography.Paragraph>
				</div>
				{isAdmin && (
					<div
						className="d-flex flex-column gap-2"
						style={{ marginLeft: 'auto' }}
					>
						<Button
							style={{
								height: 'fit-content',
							}}
							type="default"
							onClick={onAddMember}
							size="large"
						>
							+ Invite
						</Button>
						<Button
							style={{
								height: 'fit-content',
							}}
							type="default"
							onClick={onEditGroup}
							size="large"
						>
							Edit
						</Button>
					</div>
				)}
			</div>
		);
	}
);
