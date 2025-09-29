import { Button, Input } from 'antd';
import {
	SmileOutlined,
	PaperClipOutlined,
	SendOutlined,
} from '@ant-design/icons';
import { memo, useState, type FC } from 'react';
import type { TChatForm } from './types';

const { TextArea } = Input;

export const ChatFormUI: FC<TChatForm> = memo(
	({ onSend, user, handleSmileClick, handleFileAttach }) => {
		const [messageText, setMessageText] = useState('');

		const sendMessage = (text: string) => {
			if (text.trim() && user) {
				onSend(text);
				setMessageText('');
			}
		};

		const handleSendMessage = () => {
			sendMessage(messageText);
		};

		const handleKeyPress = (e: React.KeyboardEvent) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				sendMessage(messageText);
			}
		};

		const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setMessageText(e.target.value);
		};

		return (
			<div
				className="bg-gray p-2 d-flex align-items-center justify-content-between"
				style={
					{
						// maxHeight: 'fit-content',
					}
				}
			>
				<div className="d-flex gap-2 align-items-center w-100">
					<Button
						type="text"
						icon={<SmileOutlined />}
						onClick={handleSmileClick}
					></Button>
					<Button
						type="text"
						icon={<PaperClipOutlined />}
						onClick={handleFileAttach}
					></Button>
					<TextArea
						value={messageText}
						onChange={handleInputChange}
						onKeyDown={handleKeyPress}
						autoSize={{ minRows: 1, maxRows: 3 }}
						placeholder="Message"
						className="flex-fill p-2"
					></TextArea>
					<Button
						className="flex-shrink-0"
						type="primary"
						icon={<SendOutlined />}
						onClick={handleSendMessage}
						disabled={!messageText.trim()}
					></Button>
				</div>
			</div>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.onSend === nextProps.onSend &&
			prevProps.user?.id === nextProps.user?.id &&
			prevProps.handleSmileClick === nextProps.handleSmileClick &&
			prevProps.handleFileAttach === nextProps.handleFileAttach
		);
	}
);
