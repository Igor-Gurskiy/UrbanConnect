import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTokens } from './token.service.js';
import jwt from 'jsonwebtoken';

// Получаем __dirname в ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json());

// Инициализация БД
async function initDB() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify({ users: [] }, null, 2));
  }
}

// Чтение/запись БД
async function readDB() {
  const data = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(data);
}

async function writeDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// Регистрация
app.post('/api/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    

    const db = await readDB();
    const existingUser = db.users.find(user => user.email === email);

    if (existingUser) {
       return res.status(400).json({
        success: false,
        message: 'User already exists',
        user: existingUser
      });
    }

    const newUser = {
      id: uuidv4(),
      email,
      name,
      password,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    await writeDB(db);

    const { accessToken, refreshToken } = generateTokens(newUser.id);

     return res.status(200).json({
        success: true,
      message: 'User registered successfully',
      user: {
        email: newUser.email,
        name: newUser.name
      },
      accessToken,
    refreshToken
    });
  } catch (error) {
     return res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Вход
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    

    const db = await readDB();
    const existingUser = db.users.find(user => user.email === email);

    if (!existingUser) {
       return res.status(400).json({
        success: false,
        message: 'Invalid password or email'
      });
    }

    if(existingUser.password !== password) {
       return res.status(400).json({
        success: false,
        message: 'Invalid password or email'
      });
    }

    const { accessToken, refreshToken } = generateTokens(existingUser.id);

     return res.status(200).json({
        success: true,
      message: 'User logged in successfully',
      user: {
        email: existingUser.email,
        name: existingUser.name
      },
      accessToken,
    refreshToken
    });
  } catch (error) {
     return res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Получение текущего пользователя
app.get('/api/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const ACCESS_TOKEN_SECRET = 'your-access-token-secret-key';
    const token = authHeader.split(' ')[1]; // Получаем токен из "Bearer <token>"
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    const db = await readDB();
    const user = db.users.find(user => user.id === decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Обновление токена
app.post('/api/token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const REFRESH_TOKEN_SECRET = 'your-refresh-token-secret-key';

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const db = await readDB();
    const user = db.users.find(user => user.id === decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

// выход
app.post('/api/logout', (req, res) => {
  try {
    // Здесь можно добавить логику инвалидации refreshToken, если нужно
    return res.status(200).json({ 
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Запуск сервера
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
  });
});