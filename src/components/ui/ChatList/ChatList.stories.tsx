import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatListUI as ChatList } from './ChatList';

const meta: Meta<typeof ChatList> = {
	title: 'Components/UI/ChatList',
	component: ChatList,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ChatList>;

export const WithChats: Story = {
	args: {
		chats: [
			
		],
	},
};
