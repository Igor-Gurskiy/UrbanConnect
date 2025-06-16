import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppHeader } from './AppHeader';
import { MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof AppHeader> = {
  title: 'Components/UI/AppHeader',
  component: AppHeader,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    )
  ],
};

export default meta;

type Story = StoryObj<typeof AppHeader>;

export const LoggedOut: Story = {
  args: {
    username: undefined,
    handleLogin: () => console.log('Login clicked'),
    handleSignup: () => console.log('Signup clicked'),
    handleLogout: () => console.log('Logout clicked')
  }
};

export const LoggedIn: Story = {
  args: {
    username: 'Alan Turing',
    handleLogin: () => console.log('Login clicked'),
    handleSignup: () => console.log('Signup clicked'),
    handleLogout: () => console.log('Logout clicked')
  }
};