import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppHeader } from './AppHeader';

const meta: Meta<typeof AppHeader> = {
  title: 'Components/UI/AppHeader', // Путь в Storybook
  component: AppHeader, // Компонент
  tags: ['autodocs'], // Доп. опции (опционально)
};

export default meta; // Default export (исправляет ошибку)

// Примеры стори (обычные named exports)
type Story = StoryObj<typeof AppHeader>;

export const Default: Story = {
  args: {
    // Пропсы компонента
    // username: 'Alan'
  },
};
