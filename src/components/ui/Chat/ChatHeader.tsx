import { Avatar, Typography } from 'antd';
import { type TChatHeader } from './types';
import { type FC, memo, useMemo } from 'react';

export const ChatHeaderUI: FC<TChatHeader> = memo(
	({ name, avatar, isOnline, type }) => {
		const avatarContent = useMemo(
			() => (avatar ? null : name.slice(0, 1).toUpperCase()),
			[avatar, name]
		);
		const chatName = useMemo(
			() => (type === 'private' ? name.replace('-', ' ') : name),
			[type, name]
		);
		return (
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '20px',
					backgroundColor: '#f0f0f0',
					padding: '10px',
					maxHeight: '10vh',
				}}
			>
				<Avatar src={avatar} size="large" style={{ fontSize: '1.5rem' }}>
					{avatarContent}
				</Avatar>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'start',
						justifyContent: 'center',
					}}
				>
					<Typography.Paragraph style={{ margin: 0, fontSize: '1.2rem' }}>
						{chatName}
					</Typography.Paragraph>
					<Typography.Paragraph
						style={{
							margin: 0,
							fontSize: '1rem',
							opacity: type === 'private' ? 1 : 0,
						}}
					>
						{isOnline ? 'Online' : 'Offline'}
					</Typography.Paragraph>
				</div>
			</div>
		);
	}
);
