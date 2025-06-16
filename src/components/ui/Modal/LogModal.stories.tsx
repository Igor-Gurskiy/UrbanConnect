import type { Meta, StoryObj } from '@storybook/react-vite';
import { LogModal } from './LogModal';
import { Register } from '../Register/Register';
import { Login } from '../Login/Login';
import { useState } from 'react';
const meta: Meta<typeof LogModal> = {
  title: 'Components/UI/LogModal/LogModal', // Путь в Storybook
  component: LogModal, // Компонент
  tags: ['autodocs'], // Доп. опции (опционально)
  argTypes: {
    open: {
      control: 'boolean'
    },
    handleCancel: {
      action: 'closed'
    }
  },
};

export default meta; // Default export (исправляет ошибку)

// Примеры стори (обычные named exports)
type Story = StoryObj<typeof LogModal>;

// Вспомогательный компонент для демонстрации работы формы
const RegisterWithState = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    alert(`Регистрация!\nUsername: ${username}\nEmail: ${email}`);
  };

  return (
    <Register
      username={username}
      email={email}
      password={password}
      setUsername={setUsername}
      setEmail={setEmail}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
      error={null}
    />
  );
};

// Компонент-обертка для формы входа с состоянием
const LoginWithState = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = () => {
    alert(`Вход!\nEmail: ${email}\nRemember: ${remember}`);
  };

  return (
    <Login
      email={email}
      password={password}
      remember={remember}
      setEmail={setEmail}
      setPassword={setPassword}
      setRemember={setRemember}
      handleSubmit={handleSubmit}
      error={null}
    />
  );
};

export const RegistrationModal: Story = {
  args: {
    title: 'Sign up',
    open: true,
    handleCancel: () => console.log('Modal closed'),
    children: <RegisterWithState />
  },
};

export const LoginModal: Story = {
  args: {
    title: 'Log in',
    open: true,
    handleCancel: () => console.log('Modal closed'),
    children: <LoginWithState />
  },
};

export const RegistrationWithError: Story = {
  args: {
    title: 'Sign up',
    open: true,
    handleCancel: () => console.log('Modal closed'),
    children: (
      <Register
        username=""
        email=""
        password=""
        setUsername={() => {}}
        setEmail={() => {}}
        setPassword={() => {}}
        handleSubmit={() => {}}
        error="User already exists"
      />
    )
  }
};

export const LoginWithError: Story = {
  args: {
    title: 'Log in',
    open: true,
    handleCancel: () => console.log('Modal closed'),
    children: (
      <Login
        email=""
        password=""
        remember={false}
        setEmail={() => {}}
        setPassword={() => {}}
        setRemember={() => {}}
        handleSubmit={() => {}}
        error="Invalid credentials"
      />
    )
  }
};