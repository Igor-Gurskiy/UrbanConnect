import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chat } from './Chat';

const meta: Meta<typeof Chat> = {
  title: 'Components/UI/Chat',
  component: Chat,
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof Chat>;

export const LoggedOut: Story = {
  args: {
    name: 'Jane Doe',
  }
};