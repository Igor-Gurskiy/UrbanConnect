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
				style={{
					backgroundColor: '#f0f0f0',
					padding: '10px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					maxHeight: '18vh',
				}}
			>
				<div
					style={{
						display: 'flex',
						gap: '10px',
						alignItems: 'center',
						width: '100%',
					}}
				>
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
						style={{
							flex: 1,
							borderRadius: '0px',
							padding: '8px 12px',
							resize: 'none',
							lineHeight: '1.5',
						}}
					></TextArea>
					<Button
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
