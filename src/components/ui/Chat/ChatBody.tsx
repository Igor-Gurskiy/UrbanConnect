import { memo, useCallback, useEffect, useRef, type FC } from 'react';
import type { TMessage } from '../../../utils/types';
import { MessageItemUI } from '../MessageItem/MessageItem';
import { List } from 'antd';
import type { TChatBody } from './types';

const formatMessageDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
};

const isSameDay = (date1: string, date2: string): boolean => {
	const d1 = new Date(date1);
	const d2 = new Date(date2);
	return d1.toDateString() === d2.toDateString();
};

export const ChatBodyUI: FC<TChatBody> = memo(
	({ messages, user }) => {
		const listRef = useRef<HTMLDivElement>(null);
		const messagesEndRef = useRef<HTMLDivElement>(null);
		const scrollToBottom = useCallback(() => {
			messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
		}, []);
		useEffect(() => {
			scrollToBottom();
		}, [messages]);
		const isCurrentUserMessage = (message: TMessage): boolean => {
			return !!user?.id && message.user === user.id;
		};

		const MessageItem = useCallback(
			(item: TMessage, index: number) => {
				const isCurrentUser = isCurrentUserMessage(item);
				const showDate =
					index === 0 ||
					!isSameDay(item.createdAt, messages[index - 1].createdAt);

				return (
					<>
						{showDate && (
							<div className="text-center p-2 my-2 text-body-secondary small fw-bold">
								{formatMessageDate(item.createdAt)}
							</div>
						)}
						<MessageItemUI item={item} isCurrentUser={isCurrentUser} />
					</>
				);
			},
			[isCurrentUserMessage, messages]
		);

		return (
			<div className="position-relative m-h-px-0">
				<div className="position-absolute top-0 left-0 right-0 bottom-0 overflow-y-auto w-100">
					<List
						className="w-100"
						ref={listRef}
						dataSource={messages}
						renderItem={MessageItem}
					/>
					<div ref={messagesEndRef} />
				</div>
			</div>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.messages.length === nextProps.messages.length &&
			prevProps.user?.id === nextProps.user?.id
		);
	}
);
