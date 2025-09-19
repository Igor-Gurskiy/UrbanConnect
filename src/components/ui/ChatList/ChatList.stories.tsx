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
			{
				id: '1',
				name: 'John Doe',
				avatar: undefined,
				type: 'private',
				users: ['user1', 'user2'],
				lastMessage: {
					id: '101',
					text: 'Hey, how are you doing?',
					createdAt: '2023-05-15T10:30:00Z',
					user: 'user1',
				},
				messages: [
					{
						id: '101',
						text: 'Hey, how are you doing?',
						createdAt: '2023-05-15T10:30:00Z',
						user: 'user1',
					},
				],
			},
			{
				id: '2',
				name: 'Jane Smith',
				avatar: 'https://example.com/avatar2.jpg',
				type: 'private',
				users: ['user1', 'user3'],
				lastMessage: {
					id: '201',
					text: 'Meeting at 3pm tomorrow',
					createdAt: '2023-05-14T16:45:00Z',
					user: 'user3',
				},
			},
			{
				id: '3',
				name: 'Work Group',
				avatar: undefined,
				type: 'group',
				users: ['user1', 'user4', 'user5'],
				lastMessage: {
					id: '301',
					text: 'I finished the report',
					createdAt: '2023-05-14T09:15:00Z',
					user: 'user5',
				},
			},
		],
	},
};
