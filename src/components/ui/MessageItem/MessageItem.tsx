import { memo } from 'react';
import type { TMessage } from '../../../utils/types';
import { Typography } from 'antd';

interface TMessageItem {
	item: TMessage;
	isCurrentUser: boolean;
}

export const MessageItemUI = memo(({ item, isCurrentUser }: TMessageItem) => {
	return (
		<div
			className={`d-flex ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'} p-2`}
		>
			<div
				className={`d-flex gap-2 w-75 p-2 justify-content-between align-items-center`}
				style={{
					borderRadius: isCurrentUser ? '18px 18px 0 18px' : '18px 18px 18px 0',
					backgroundColor: isCurrentUser ? '#1890ff' : '#e6e6e6',
				}}
			>
				<Typography.Paragraph
					className={`m-0 fs-6 ${isCurrentUser ? 'text-white' : 'text-black'}`}
				>
					{item.text}
				</Typography.Paragraph>
				<div
					className={`small ${isCurrentUser ? 'text-white' : 'text-black'} text-end`}
				>
					{new Date(item.createdAt).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					})}
				</div>
			</div>
		</div>
	);
});
