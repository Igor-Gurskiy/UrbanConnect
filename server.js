import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTokens } from './token.service.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

dotenv.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Получаем __dirname в ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json());

// Создаем HTTP сервер и WebSocket
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// Хранилище подключений по userId
const connectedUsers = new Map();

// Инициализация БД
async function initDB() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify({ users: [], chats: [] }, null, 2));
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

// WebSocket соединения
wss.on('connection', (ws, req) => {
  console.log('WebSocket connection established');
  const url = new URL(req.url, `http://${req.headers.host}`);
  const userId = url.searchParams.get('userId');
  const chatId = url.searchParams.get('chatId');
  if (userId) {
    connectedUsers.set(userId, ws);
    console.log(`User ${userId} connected`);
  }

  if (chatId) {
    console.log(`Client connected to chat ${chatId}`);
  }

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log(`Message received from client: ${message}`);
      
    } catch (error) {
      console.log(`Error parsing message: ${error}`);
    }
  });

  ws.on('close', () => {
    console.log(`User ${userId} disconnected`);
    if (userId) {
      connectedUsers.delete(userId);
    }
  });

  ws.on('error', (error) => {
    console.log(`WebSocket error: ${error}`);
  });
})

// Функция для отправки сообщения через WebSocket
function sendMessage(userId, message) {
  const ws = connectedUsers.get(userId);
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify(message));
  }
}

// Функция для broadcast сообщения всем в чате
function broadcastMessage(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(JSON.stringify(message));
    }
  });
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
        name: newUser.name,
        id: newUser.id
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
    const { email, password, remember = false } = req.body;
    

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

    const expiresIn = remember ? '30d' : '15m'; 
    const refreshExpiresIn = remember ? '60d' : '1d';
    const { accessToken, refreshToken } = generateTokens(existingUser.id, expiresIn, refreshExpiresIn);

     return res.status(200).json({
        success: true,
      message: 'User logged in successfully',
      user: {
        email: existingUser.email,
        name: existingUser.name,
        id: existingUser.id
      },
      accessToken,
    refreshToken,
    remember
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

    const token = authHeader.split(' ')[1];
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
        name: user.name,
        id: user.id
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

// Получение всех пользователей
app.get('/api/users', async (req, res) => {
  try {
    const { id } = req.query;
    const db = await readDB();
    console.log('Search ID:', id); 
    if (!id) {
      const users = db.users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name
    }))
    return res.status(200).json({
      success: true,
      users: users
    });
    }
    
    const filteredUsers = db.users.filter(user => 
      user.id.includes(id) || 
      user.name.includes(id) || 
      user.email.includes(id)
    );
    
    const users = filteredUsers.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name
    }));
    console.log('Found users:', users.length);
    return res.status(200).json({
      success: true,
      users: users
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Получаем пользователя по id
app.get('/api/user/:id', async (req, res) => {
  try {
    const db = await readDB();
    const user = db.users.find(user => user.id === req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
    } catch {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
})

// Обновление токена
app.post('/api/token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

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
    return res.status(200).json({ 
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Получение чатов
app.get('/chats', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    const db = await readDB();
    const user = db.users.find(user => user.id === decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userChats = db.chats.filter(chat => chat.users.includes(decoded.id));
    
    const formatedChats = userChats.map((chat) => {
      return {
        id: chat.id,
        avatar: chat.avatar,
        name: chat.name,
        type: chat.type,
        users: chat.users,
        lastMessage: chat.lastMessage,
        messages: chat.messages
      }
    })

    formatedChats.sort((a, b) => {
      const dateA = new Date(a.lastMessage.createdAt);
      const dateB = new Date(b.lastMessage.createdAt);
      return dateB - dateA;
    })

    
    return res.status(200).json({
      success: true,
      chats: formatedChats
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Chats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });  
  }
  
})

// Получение чата по id
app.get('/api/chat/:id', async (req, res) => {
  try {
    const db = await readDB();
    const chat = db.chats.find(chat => chat.id === req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      chat
    });
    
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
})

// Отправка сообщения в существующем чате
app.post('/api/message', async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const db = await readDB();
    const chat = db.chats.find(chat => chat.id === chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    const serverMessage = {
      ...message,
      id: uuidv4(), 
      createdAt: new Date().toISOString()
    };
    chat.messages.push(serverMessage);
    chat.lastMessage = serverMessage;
    await writeDB(db);

    // Отправляем сообщение через WebSocket
    const messageToSend = {
      type: 'message',
      chatId,
      message: serverMessage
    };

    broadcastMessage(messageToSend);

    return res.status(200).json({
      success: true,
      message: serverMessage
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Создание чата
app.post('/api/chat/private', async (req, res) => {
  try {
    const { message, otherUserId } = req.body;
    const db = await readDB();
    const existingChat = db.chats.find(chat => chat.type === 'private' && chat.users.includes(otherUserId) && chat.users.includes(req.user.id));
  
    if (existingChat) {
      return res.status(400).json({
        success: false,
        message: 'Chat already exists'
      });
    }

    const newChat = {
      id: uuidv4(),
      type: 'private',
      name: '',
      avatar: '',
      users: [req.user.id, otherUserId],
      messages: [{
        id: uuidv4(),
        text: message,
        createdAt: new Date().toISOString(),
        user: req.user.id
      }],
      lastMessage: {
        id: uuidv4(),
        text: message,
        createdAt: new Date().toISOString(),
        user: req.user.id
      }
    };

    db.chats.push(newChat);
    await writeDB(db);

    return res.status(200).json({
      success: true,
      chat: newChat
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
})

// Запуск сервера
initDB().then(() => {
  httpServer.listen(PORT, () => { // Используем httpServer вместо app
    console.log(`Server running on:
  - Local: http://localhost:${PORT}`);
    console.log('WebSocket server is running');
  });
});