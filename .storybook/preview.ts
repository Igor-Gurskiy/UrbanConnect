import type { Preview } from '@storybook/react-vite'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    layout: 'fullscreen', // Убирает padding у контейнера
  // или явно переопределяем стили:
  backgrounds: {
    // default: 'transparent',
  },
  }, 
};

export default preview;