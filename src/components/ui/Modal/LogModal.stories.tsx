import type { Meta, StoryObj } from '@storybook/react-vite';
import { LogModal } from './LogModal';

const meta: Meta<typeof LogModal> = {
  title: 'Components/UI/LogModal/LogModal', // Путь в Storybook
  component: LogModal, // Компонент
  tags: ['autodocs'], // Доп. опции (опционально)
  argTypes: {
    title: {
      control: 'select',
      options: ['Sign up', 'Log in'],
    },
  },
};

export default meta; // Default export (исправляет ошибку)

// Примеры стори (обычные named exports)
type Story = StoryObj<typeof LogModal>;

export const Default: Story = {
  args: {
    // Пропсы компонента
    title: 'Sign up',
    onCancel: () => {},
    isModalOpen: true
  },
};