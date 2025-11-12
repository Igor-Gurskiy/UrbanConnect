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
import pkg from 'pg';

dotenv.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Получаем __dirname в ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
// const DB_PATH = path.join(__dirname, "db.json");

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
	console.error('DATABASE_URL is not defined in .env file');
} else {
	console.log(
		'DATABASE_URL found:',
		process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')
	);
}

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
	max: 6,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 5000,
	maxUses: 7500,
});

async function testDatabaseConnection() {
	if (!process.env.DATABASE_URL) {
		console.log('DATABASE_URL not set, skipping database test');
		return;
	}

	try {
		const client = await pool.connect();
		const result = await client.query('SELECT NOW()');
		console.log('Database test query successful:', result.rows[0]);
		client.release();
	} catch (error) {
		console.error('Database test query failed:', error.message);
		console.log('Check your DATABASE_URL in .env file');
	}
}

testDatabaseConnection();
// Middleware
app.use(
	cors({
		origin: ['http://localhost:5173', 'https://urbanconnect.onrender.com'],
		credentials: true,
	})
);
app.use(express.json());

// Создаем HTTP сервер и WebSocket
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// Хранилище подключений по userId
const connectedUsers = new Map();

async function getUserChatsFromDB(userId) {
	const result = await pool.query(
		`
    select c.*
    from chats c
    join chat_users cu on c.id = cu.chat_id
    where cu.user_id = $1 and cu.is_deleted = false
  `,
		[userId]
	);
	return result.rows;
}

// async function getUserChatsFromDB(userId) {
//   const client = await pool.connect();
  
//   try {
//     const result = await client.query(
//       `SELECT c.* FROM chats c 
//        JOIN chat_users cu ON c.id = cu.chat_id 
//        WHERE cu.user_id = $1 AND cu.is_deleted = false`,
//       [userId]
//     );
//     return result.rows;
//   } catch (error) {
//     console.error('Error in getUserChatsFromDB:', error);
//     throw error;
//   } finally {
//     client.release();
//   }
// }

// WebSocket соединения
wss.on('connection', async (ws, req) => {
	console.log('WebSocket connection established');
	// const url = new URL(req.url, `http://${req.headers.host}`);
	// const userId = url.searchParams.get('userId');
	// ws.userId = userId;
	// const userChats = await getUserChatsFromDB(userId);
	// connectedUsers.set(userId, {
	// 	ws: ws,
	// 	userId: userId,
	// 	userChats: userChats.map((chat) => chat.id),
	// });
	// console.log(
	// 	`User ${userId} connected to chats:`,
	// 	userChats.map((chat) => chat.id)
	// );
	try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      console.log('No userId provided, closing connection');
      ws.close(1008, 'User ID required');
      return;
    }
    
    ws.userId = userId;
    
    let userChats = [];
    try {
      userChats = await getUserChatsFromDB(userId);
      console.log(`User ${userId} connected to chats:`, userChats.map((chat) => chat.id));
    } catch (dbError) {
      console.error(`Database error for user ${userId}:`, dbError.message);
      userChats = [];
    }
    
    connectedUsers.set(userId, {
      ws: ws,
      userId: userId,
      userChats: userChats.map((chat) => chat.id),
    });

  } catch (error) {
    console.error('WebSocket connection setup error:', error);
    ws.close(1011, 'Connection setup failed');
    return;
  }
	ws.on('message', (data) => {
		try {
			const message = JSON.parse(data);
			console.log(`Message received from client: ${message}`);
			handleWebSocketMessage(ws, message);
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
});

function handleWebSocketMessage(ws, message) {
  switch (message.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      break;
    case 'chat_message':
      handleChatMessage(ws, message);
      break;
    default:
      console.log('Unknown message type:', message.type);
  }
}

async function handleChatMessage(ws, message) {
  try {
    const { chatId, content } = message;
    
    const savedMessage = await saveMessageToDB(chatId, ws.userId, content);
    
    await broadcastMessage({
      type: 'new_message',
      message: savedMessage,
      chatId: chatId
    }, chatId);
    
  } catch (error) {
    console.error('Error handling chat message:', error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to send message'
    }));
  }
}

async function broadcastMessage(message, chatId) {
	const usersResult = await pool.query(
		`
    select user_id
    from chat_users
    where chat_id = $1 and is_deleted = false
  `,
		[chatId]
	);

	usersResult.rows.forEach((row) => {
		const userConnection = connectedUsers.get(row.user_id);
		if (userConnection && userConnection.ws.readyState === WebSocket.OPEN) {
			userConnection.ws.send(JSON.stringify(message));
		}
	});
}

// Регистрация
app.post('/api/register', async (req, res) => {
	try {
		const { email, name, password } = req.body;

		const existingUser = await pool.query(
			`
      select *
      from users
      where email = $1
    `,
			[email]
		);

		if (existingUser.rows.length > 0) {
			return res.status(400).json({
				success: false,
				message: 'User already exists',
				user: existingUser.rows[0],
			});
		}

		const newUser = await pool.query(
			`
      insert into users (email, name, password)
      values ($1, $2, $3)
      returning id, email, name, created_at
    `,
			[email, name, password]
		);

		const { accessToken, refreshToken } = generateTokens(newUser.rows[0].id);

		return res.status(200).json({
			success: true,
			message: 'User registered successfully',
			user: {
				email: newUser.rows[0].email,
				name: newUser.rows[0].name,
				id: newUser.rows[0].id,
			},
			accessToken,
			refreshToken,
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Ошибка сервера' });
	}
});

// Вход
app.post('/api/login', async (req, res) => {
	try {
		const { email, password, remember = false } = req.body;

		const existingUser = await pool.query(
			`
      select *
      from users
      where email = $1
    `,
			[email]
		);

		if (existingUser.rows.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Invalid password or email',
			});
		}

		if (existingUser.rows[0].password !== password) {
			return res.status(400).json({
				success: false,
				message: 'Invalid password or email',
			});
		}

		const expiresIn = remember ? '30d' : '15m';
		const refreshExpiresIn = remember ? '60d' : '1d';
		const { accessToken, refreshToken } = generateTokens(
			existingUser.rows[0].id,
			expiresIn,
			refreshExpiresIn
		);

		return res.status(200).json({
			success: true,
			message: 'User logged in successfully',
			user: {
				email: existingUser.rows[0].email,
				name: existingUser.rows[0].name,
				id: existingUser.rows[0].id,
			},
			accessToken,
			refreshToken,
			remember,
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
				message: 'Not authorized',
			});
		}

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

		const user = await pool.query(
			`
      select *
      from users
      where id = $1
    `,
			[decoded.id]
		);

		if (user.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}
		return res.status(200).json({
			success: true,
			user: {
				email: user.rows[0].email,
				name: user.rows[0].name,
				id: user.rows[0].id,
				avatar: user.rows[0].avatar || '',
			},
		});
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return res.status(401).json({
				success: false,
				message: 'Token expired',
			});
		}

		return res.status(500).json({
			success: false,
			message: 'Server error',
		});
	}
});

// Получение всех пользователей
app.get('/api/users', async (req, res) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return res
				.status(401)
				.json({ success: false, message: 'Not authorized' });
		}

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

		const { search } = req.query;

		const queryParams = [decoded.id];
		let whereClause = 'WHERE id != $1';

		if (search) {
			queryParams.push(`%${search}%`);
			whereClause += ` AND (id::text ILIKE $2 OR name ILIKE $2 OR email ILIKE $2)`;
		}

		const users = await pool.query(
			`SELECT id, email, name, avatar
       FROM users
       ${whereClause}
       ORDER BY name`,
			queryParams
		);
		return res.status(200).json({
			success: true,
			users: users.rows,
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Server error' });
	}
});

// Получаем пользователя по id
app.get('/api/user/:id', async (req, res) => {
	try {
		// const db = await readDB();
		// const user = db.users.find((user) => user.id === req.params.id);
		const user = await pool.query(
			`
      select *
      from users
      where id = $1
    `,
			[req.params.id]
		);

		if (user.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		return res.status(200).json({
			success: true,
			user: {
				id: user.rows[0].id,
				email: user.rows[0].email,
				name: user.rows[0].name,
			},
		});
	} catch {
		return res.status(500).json({ success: false, message: 'Server error' });
	}
});

// Обновление токена
app.post('/api/token', async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res
				.status(401)
				.json({ success: false, message: 'Refresh token is required' });
		}

		const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
		const user = await pool.query(
			`
      select *
      from users
      where id = $1
    `,
			[decoded.id]
		);

		if (user.rows.length === 0) {
			return res
				.status(404)
				.json({ success: false, message: 'User not found' });
		}

		const { accessToken, refreshToken: newRefreshToken } = generateTokens(
			user.rows[0].id
		);

		return res.status(200).json({
			success: true,
			accessToken,
			refreshToken: newRefreshToken,
		});
	} catch (error) {
		return res
			.status(401)
			.json({ success: false, message: 'Invalid refresh token' });
	}
});

// выход
app.post('/api/logout', (req, res) => {
	try {
		return res.status(200).json({
			success: true,
			message: 'Logged out successfully',
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Server error' });
	}
});

// редактирование профиля
app.patch('/api/user', async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return res.status(401).json({
				success: false,
				message: 'Not authorized',
			});
		}

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

		const user = await pool.query(
			`
      select *
      from users
      where id = $1
    `,
			[decoded.id]
		);

		if (user.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		const currentUser = user.rows[0];
		const updates = {};

		if (req.body.name !== undefined) {
			updates.name = req.body.name;
		} else {
			updates.name = currentUser.name;
		}

		if (req.body.avatar !== undefined) {
			updates.avatar = req.body.avatar;
		} else {
			updates.avatar = currentUser.avatar;
		}

		await pool.query(
			`
        UPDATE users 
        SET name = $1, avatar = $2
        WHERE id = $3
      `,
			[updates.name, updates.avatar, decoded.id]
		);

		const updatedUser = await pool.query(`SELECT * FROM users WHERE id = $1`, [
			decoded.id,
		]);
		return res.status(200).json({
			success: true,
			message: 'User updated successfully',
			user: {
				email: updatedUser.rows[0].email,
				name: updatedUser.rows[0].name,
				id: updatedUser.rows[0].id,
				avatar: updatedUser.rows[0].avatar || '',
			},
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Server error' });
	}
});

// смена пароля
app.patch('/api/user/password', async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return res.status(401).json({
				success: false,
				message: 'Not authorized',
			});
		}

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

		const user = await pool.query(
			`
      select *
      from users
      where id = $1
    `,
			[decoded.id]
		);

		if (user.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		const { oldPassword, newPassword } = req.body;

		if (!oldPassword || !newPassword) {
			return res.status(400).json({
				success: false,
				message: 'Заполните все поля',
			});
		}

		if (user.rows[0].password !== oldPassword) {
			return res.status(400).json({
				success: false,
				message: 'Старый пароль неверен',
			});
		}
		await pool.query(
			`
      UPDATE users 
      SET password = $1
      WHERE id = $2
    `,
			[newPassword, decoded.id]
		);

		return res.status(200).json({
			success: true,
			message: 'Password updated successfully',
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Server error' });
	}
});

// Получение чатов
app.get('/api/chats', async (req, res) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return res.status(401).json({
				success: false,
				message: 'Not authorized',
			});
		}

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

		// const db = await readDB();
		// const user = db.users.find((user) => user.id === decoded.id);
		const user = await pool.query(
			`
      select *
      from users
      where id = $1
    `,
			[decoded.id]
		);

		if (user.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		// const userChats = db.chats.filter((chat) =>
		//   chat.users.includes(decoded.id) || chat.usersDeleted.includes(decoded.id)
		// );
		const userChats = await pool.query(
			`
      select 
        c.*,
        m.id as last_message_id,
        m.text as last_message_text,
        m.created_at as last_message_created_at,
        m.user_id as last_message_user_id,
        sender.name as last_message_sender_name,
        other_user.name as other_user_name,
        other_user.avatar as other_user_avatar,
        other_user.id as other_user_id
      from chats c
      join chat_users cu on c.id = cu.chat_id
      left join lateral (
        select id, text, created_at, user_id
        from messages
        where chat_id = c.id
        order by created_at desc
        limit 1
        ) m on true
      left join users sender on m.user_id = sender.id
      left join lateral (
        select user_id
        from chat_users 
        where chat_id = c.id and user_id != $1 AND is_deleted = false
        limit 1
    ) other_cu on true
      left join users other_user on other_cu.user_id = other_user.id
      where cu.user_id = $1 and cu.is_deleted = false
      group by c.id, m.id, m.text, m.created_at, m.user_id, sender.name, other_user.name, other_user.avatar, other_user.id
    `,
			[decoded.id]
		);

		// const formatedChats = userChats.map((chat) => {
		//     let chatName = chat.name;
		//     const users = [...chat.users, ...chat.usersDeleted];
		//     if (chat.type === 'private') {
		//       const otherUserId = users.find(userId => userId !== decoded.id);
		//       if (otherUserId) {
		//         const otherUser = db.users.find(user => user.id === otherUserId);
		//         if (otherUser) {
		//           chatName = otherUser.name;
		//         }
		//       }
		//     }

		//     return {
		//       id: chat.id,
		//       avatar: chat.avatar,
		//       name: chatName,
		//       type: chat.type,
		//       users: chat.users,
		//       lastMessage: chat.lastMessage,
		//       messages: chat.messages,
		//       usersDeleted: chat.usersDeleted,
		//       createdBy: chat.createdBy,
		//     };
		//   });
		const formatedChats = userChats.rows.map((chat) => {
			let chatName = chat.name;
			if (chat.type === 'private') {
				chatName = chat.other_user_name || 'Unknown User';
			}

			return {
				id: chat.id,
				avatar: chat.avatar || '',
				name: chatName,
				type: chat.type,
				users: [chat.other_user_id, decoded.id].filter(Boolean),
				lastMessage: chat.last_message_text
					? {
							id: chat.last_message_id,
							text: chat.last_message_text,
							createdAt: chat.last_message_created_at,
							user: chat.last_message_user_id,
						}
					: null,
				messages: [],
				usersDeleted: [],
				createdBy: chat.createdBy,
			};
		});

		formatedChats.sort((a, b) => {
			const dateA = a.lastMessage
				? new Date(a.lastMessage.createdAt)
				: new Date(0);
			const dateB = b.lastMessage
				? new Date(b.lastMessage.createdAt)
				: new Date(0);
			return dateB - dateA;
		});

		return res.status(200).json({
			success: true,
			chats: formatedChats,
		});
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return res.status(401).json({
				success: false,
				message: 'Token expired',
			});
		}

		return res.status(500).json({
			success: false,
			message: 'Server error',
		});
	}
});

// Получение чата по id
app.get('/api/chat/:id', async (req, res) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return res.status(401).json({
				success: false,
				message: 'Not authorized',
			});
		}

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

		// const db = await readDB();
		// const chat = db.chats.find((chat) => chat.id === req.params.id);
		const chatAccess = await pool.query(
			`SELECT c.*, cu.is_deleted 
       FROM chats c
       JOIN chat_users cu ON c.id = cu.chat_id
       WHERE c.id = $1 AND cu.user_id = $2`,
			[req.params.id, decoded.id]
		);

		if (chatAccess.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'Chat not found',
			});
		}

		const chat = chatAccess.rows[0];

		// let chatName = chat.name;
		// if (chat.type === 'private') {
		//   const otherUserId = chat.users.find(userId => userId !== decoded.id);
		//   if (otherUserId) {
		//     const otherUser = db.users.find(user => user.id === otherUserId);
		//     if (otherUser) {
		//       chatName = otherUser.name;
		//     }
		//   }
		// }
		let chatName = chat.name;
		let otherUserInfo = null;

		if (chat.type === 'private') {
			const otherUser = await pool.query(
				`SELECT u.id, u.name, u.avatar 
         FROM users u
         JOIN chat_users cu ON u.id = cu.user_id
         WHERE cu.chat_id = $1 AND cu.user_id != $2 AND cu.is_deleted = false`,
				[req.params.id, decoded.id]
			);

			if (otherUser.rows.length > 0) {
				chatName = otherUser.rows[0].name;
				otherUserInfo = otherUser.rows[0];
			}
		}

		const messages = await pool.query(
			`SELECT m.*, u.name as user_name, u.avatar as user_avatar
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.chat_id = $1
       ORDER BY m.created_at ASC`,
			[req.params.id]
		);

		// Получаем участников чата
		const participants = await pool.query(
			`SELECT u.id, u.name, u.avatar, u.email
       FROM users u
       JOIN chat_users cu ON u.id = cu.user_id
       WHERE cu.chat_id = $1 AND cu.is_deleted = false`,
			[req.params.id]
		);

		// return res.status(200).json({
		//   success: true,
		//   chat: {
		//     ...chat,
		//     name: chatName
		//   },
		// });

		return res.status(200).json({
			success: true,
			chat: {
				id: chat.id,
				name: chatName,
				avatar: chat.avatar,
				type: chat.type,
				users: participants.rows.map((p) => p.id),
				userDetails: participants.rows,
				messages: messages.rows.map((m) => ({
					id: m.id,
					text: m.text,
					createdAt: m.created_at,
					user: m.user_id,
					userName: m.user_name,
					userAvatar: m.user_avatar,
				})),
				lastMessage:
					messages.rows.length > 0
						? {
								id: messages.rows[messages.rows.length - 1].id,
								text: messages.rows[messages.rows.length - 1].text,
								createdAt: messages.rows[messages.rows.length - 1].created_at,
								user: messages.rows[messages.rows.length - 1].user_id,
							}
						: null,
				usersDeleted: [],
				createdBy: chat.created_by,
			},
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Server error' });
	}
});

// Отправка сообщения в существующем чате
app.post('/api/message', async (req, res) => {
	try {
		const { message, chatId } = req.body;
		// const db = await readDB();
		// const chat = db.chats.find((chat) => chat.id === chatId);
		const chatAccess = await pool.query(
			`SELECT c.id FROM chats c
       JOIN chat_users cu ON c.id = cu.chat_id
       WHERE c.id = $1 AND cu.user_id = $2 AND cu.is_deleted = false`,
			[chatId, message.user]
		);
		// if (!chat) {
		//   return res.status(404).json({
		//     success: false,
		//     message: "Chat not found",
		//   });
		// }
		if (chatAccess.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'Chat not found or access denied',
			});
		}

		// const serverMessage = {
		//   ...message,
		//   id: uuidv4(),
		//   createdAt: new Date().toISOString(),
		// };
		// chat.messages.push(serverMessage);
		// chat.lastMessage = serverMessage;
		// await writeDB(db);
		const serverMessage = await pool.query(
			`INSERT INTO messages (id, chat_id, user_id, text, created_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, chat_id, user_id, text, created_at`,
			[uuidv4(), chatId, message.user, message.text, new Date().toISOString()]
		);

		await pool.query(`UPDATE chats SET last_message_id = $1 WHERE id = $2`, [
			serverMessage.rows[0].id,
			chatId,
		]);

		const formattedMessage = {
			id: serverMessage.rows[0].id,
			text: serverMessage.rows[0].text,
			createdAt: serverMessage.rows[0].created_at,
			user: serverMessage.rows[0].user_id,
		};

		// // Отправляем сообщение через WebSocket
		// const messageToSend = {
		//   type: "message",
		//   chatId,
		//   message: serverMessage,
		// };

		const messageToSend = {
			type: 'message',
			chatId,
			message: formattedMessage,
		};

		broadcastMessage(messageToSend, chatId);

		// return res.status(200).json({
		//   success: true,
		//   message: serverMessage,
		// });
		return res.status(200).json({
			success: true,
			message: formattedMessage,
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Server error' });
	}
});

// удаление чата
app.delete('/api/chats/:id', async (req, res) => {
	try {
		// const db = await readDB();
		const chatId = req.params.id;
		const { userId } = req.body;

		// const chat = db.chats.find((chat) => chat.id === chatId);
		// const chatIndex = db.chats.findIndex(chat => chat.id === chatId);

		// if (chatIndex === -1) {
		//   return res.status(404).json({
		//     success: false,
		//     message: "Chat not found",
		//   });
		// }
		const chatCheck = await pool.query(
			`SELECT c.*, cu.is_deleted 
       FROM chats c
       JOIN chat_users cu ON c.id = cu.chat_id
       WHERE c.id = $1 AND cu.user_id = $2`,
			[chatId, userId]
		);

		if (chatCheck.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'Chat not found',
			});
		}

		// if (chat.users.length > 1) {
		//   db.chats[chatIndex].usersDeleted.push(userId);
		//   db.chats[chatIndex].users = db.chats[chatIndex].users.filter(user => user !== userId);
		// } else {
		//   db.chats.splice(chatIndex, 1)[0];
		// }

		// await writeDB(db);

		// return res.status(200).json({
		//   success: true,
		//   deletedChat: chat,
		// });
		const userCount = parseInt(activeUsers.rows[0].user_count);

		if (userCount > 1) {
			// Если в чате больше одного участника - помечаем пользователя как удалившего чат
			await pool.query(
				`UPDATE chat_users 
         SET is_deleted = true 
         WHERE chat_id = $1 AND user_id = $2`,
				[chatId, userId]
			);

			return res.status(200).json({
				success: true,
				message: 'Chat removed from your list',
				action: 'marked_deleted',
			});
		} else {
			// Если пользователь последний - удаляем чат полностью
			await pool.query('DELETE FROM chats WHERE id = $1', [chatId]);

			return res.status(200).json({
				success: true,
				message: 'Chat deleted completely',
				action: 'deleted',
			});
		}
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Server error while deleting chat',
		});
	}
});

// Восстановление удаленного чата
app.patch('/api/chats/:id', async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return res.status(401).json({
				success: false,
				message: 'Not authorized',
			});
		}

		// const db = await readDB();
		const chatId = req.params.id;
		// const chatIndex = db.chats.findIndex(chat => chat.id === chatId);

		// if (chatIndex === -1) {
		//   return res.status(404).json({
		//     success: false,
		//     message: "Chat not found",
		//   });
		// }
		// const chat = db.chats[chatIndex];

		// if (chat.type === 'private' && chat.usersDeleted.length > 0) {
		//   const allUsers = [...new Set([...chat.users, ...chat.usersDeleted])];
		//   chat.users = allUsers;
		//   chat.usersDeleted = [];
		// }
		// await writeDB(db);

		// return res.status(200).json({
		//   success: true,
		//   chat: db.chats[chatIndex],
		// });
		const chatCheck = await pool.query(
			`SELECT c.*, cu.is_deleted 
       FROM chats c
       JOIN chat_users cu ON c.id = cu.chat_id
       WHERE c.id = $1 AND cu.user_id = $2`,
			[chatId, userId]
		);

		if (chatCheck.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'Chat not found',
			});
		}

		const chat = chatCheck.rows[0];

		// Восстанавливаем чат для пользователя
		if (chat.is_deleted) {
			await pool.query(
				`UPDATE chat_users 
         SET is_deleted = false 
         WHERE chat_id = $1 AND user_id = $2`,
				[chatId, userId]
			);
		}

		// Получаем обновленную информацию о чате
		const updatedChat = await pool.query(
			`SELECT c.*, 
              u.name as other_user_name,
              u.avatar as other_user_avatar,
              u.id as other_user_id
       FROM chats c
       JOIN chat_users cu ON c.id = cu.chat_id
       LEFT JOIN chat_users other_cu ON c.id = other_cu.chat_id AND other_cu.user_id != $1
       LEFT JOIN users u ON other_cu.user_id = u.id
       WHERE c.id = $2 AND cu.user_id = $1 AND cu.is_deleted = false
       LIMIT 1`,
			[userId, chatId]
		);

		if (updatedChat.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'Chat not found after restoration',
			});
		}

		const chatData = updatedChat.rows[0];

		// Форматируем ответ
		let chatName = chatData.name;
		if (chatData.type === 'private') {
			chatName = chatData.other_user_name || 'Unknown User';
		}

		const formattedChat = {
			id: chatData.id,
			name: chatName,
			avatar: chatData.avatar,
			type: chatData.type,
			users: [userId, chatData.other_user_id].filter(Boolean),
			lastMessage: null, // Можно доработать получение последнего сообщения
			messages: [],
			usersDeleted: [],
			createdBy: chatData.created_by,
		};

		return res.status(200).json({
			success: true,
			chat: formattedChat,
			message: 'Chat restored successfully',
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Server error while restoring chat',
		});
	}
});

// Создание чата private
app.post('/api/chat/private', async (req, res) => {
	try {
		// const chat = req.body;
		// const db = await readDB();
		// if (chat.messages && chat.messages.length > 0) {
		//   chat.lastMessage = chat.messages[chat.messages.length - 1];
		// } else {
		//   chat.lastMessage = null;
		// }
		// db.chats.push(chat);
		// await writeDB(db);

		// return res.status(200).json({
		//   success: true,
		//   chat: chat,
		// });

		const { users, name, avatar } = req.body;

		console.log('Creating private chat:', { users, name });

		// Проверяем что передано 2 пользователя для приватного чата
		if (!users || users.length !== 2) {
			return res.status(400).json({
				success: false,
				message: 'Private chat must have exactly 2 users',
			});
		}

		// Проверяем существование пользователей
		const usersCheck = await pool.query(
			'SELECT id FROM users WHERE id = ANY($1)',
			[users]
		);

		if (usersCheck.rows.length !== 2) {
			return res.status(400).json({
				success: false,
				message: 'One or more users not found',
			});
		}

		// Проверяем не существует ли уже такой приватный чат
		const existingChat = await pool.query(
			`SELECT c.id 
       FROM chats c
       JOIN chat_users cu1 ON c.id = cu1.chat_id
       JOIN chat_users cu2 ON c.id = cu2.chat_id
       WHERE c.type = 'private' 
         AND cu1.user_id = $1 
         AND cu2.user_id = $2
         AND cu1.is_deleted = false 
         AND cu2.is_deleted = false`,
			[users[0], users[1]]
		);

		if (existingChat.rows.length > 0) {
			return res.status(400).json({
				success: false,
				message: 'Private chat already exists',
				chatId: existingChat.rows[0].id,
			});
		}

		// Создаем чат
		const newChat = await pool.query(
			`INSERT INTO chats (name, avatar, type) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, avatar, type, created_at`,
			[name, avatar, 'private']
		);

		const chatId = newChat.rows[0].id;

		// Добавляем пользователей в чат
		for (const userId of users) {
			await pool.query(
				`INSERT INTO chat_users (chat_id, user_id) 
         VALUES ($1, $2)`,
				[chatId, userId]
			);
		}

		// Получаем информацию о другом пользователе для имени чата
		const otherUser = await pool.query(
			`SELECT u.name, u.avatar 
       FROM users u 
       WHERE u.id != $1 AND u.id = ANY($2) 
       LIMIT 1`,
			[users[0], users]
		);

		const chatName = otherUser.rows.length > 0 ? otherUser.rows[0].name : name;

		const formattedChat = {
			id: chatId,
			name: chatName,
			avatar: avatar,
			type: 'private',
			users: users,
			lastMessage: null,
			messages: [],
			usersDeleted: [],
			createdBy: users[0], // Первый пользователь как создатель
		};

		return res.status(200).json({
			success: true,
			chat: formattedChat,
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Server error' });
	}
});

// Создание чата group
app.post('/api/chat/group', async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return res.status(401).json({
				success: false,
				message: 'Not authorized',
			});
		}

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
		// const chat = req.body;
		// const db = await readDB();
		// if (!chat.users.includes(decoded.id)) {
		//   return res.status(400).json({
		//     success: false,
		//     message: "User must be included in the group",
		//   });
		// }
		// db.chats.push(chat);
		// await writeDB(db);

		// return res.status(200).json({
		//   success: true,
		//   chat: chat,
		// });
		const { users, name, avatar } = req.body;

		console.log('Creating group chat:', { name, users, creator: userId });

		// Проверяем что создатель включен в группу
		if (!users.includes(userId)) {
			return res.status(400).json({
				success: false,
				message: 'User must be included in the group',
			});
		}

		// Проверяем существование пользователей
		const usersCheck = await pool.query(
			'SELECT id FROM users WHERE id = ANY($1)',
			[users]
		);

		if (usersCheck.rows.length !== users.length) {
			return res.status(400).json({
				success: false,
				message: 'One or more users not found',
			});
		}

		// Проверяем уникальность имени группы (опционально)
		const existingChat = await pool.query(
			`SELECT id FROM chats WHERE name = $1 AND type = 'group'`,
			[name]
		);

		if (existingChat.rows.length > 0) {
			return res.status(400).json({
				success: false,
				message: 'Group chat with this name already exists',
			});
		}

		// Создаем групповой чат
		const newChat = await pool.query(
			`INSERT INTO chats (name, avatar, type, created_by) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, avatar, type, created_by, created_at`,
			[name, avatar, 'group', userId]
		);

		const chatId = newChat.rows[0].id;

		// Добавляем всех пользователей в чат
		for (const memberId of users) {
			await pool.query(
				`INSERT INTO chat_users (chat_id, user_id) 
         VALUES ($1, $2)`,
				[chatId, memberId]
			);
		}

		const formattedChat = {
			id: chatId,
			name: name,
			avatar: avatar,
			type: 'group',
			users: users,
			lastMessage: null,
			messages: [],
			usersDeleted: [],
			createdBy: userId,
		};

		return res.status(200).json({
			success: true,
			chat: formattedChat,
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Server error' });
	}
});

// Редактирование чата
app.patch('/api/chats/group/edit/:id', async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return res.status(401).json({
				success: false,
				message: 'Not authorized',
			});
		}

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
		const userId = decoded.id;

		const { id } = req.params;
		const { name, avatar } = req.body;
		// const db = await readDB();
		// const chatIndex = db.chats.findIndex(chat => chat.id === id);

		// if (chatIndex === -1) {
		//   return res.status(404).json({
		//     success: false,
		//     message: "Chat not found",
		//   });
		// }

		// const chat = db.chats[chatIndex];

		// if (chat.type !== "group") {
		//   return res.status(400).json({
		//     success: false,
		//     message: "Only group chats can be edited",
		//   });
		// }

		// if (chat.createdBy !== userId) {
		//   return res.status(403).json({
		//     success: false,
		//     message: "Only chat creator can edit the group",
		//   });
		// }

		// if (name !== undefined) {
		//   db.chats[chatIndex].name = name;
		// }

		// if (avatar !== undefined) {
		//   db.chats[chatIndex].avatar = avatar;
		// }

		// await writeDB(db);

		// return res.status(200).json({
		//   success: true,
		//   chat: db.chats[chatIndex],
		// });
		console.log('Editing group chat:', { id, name, avatar, userId });

		// Проверяем существование чата и права доступа
		const chat = await pool.query(
			`SELECT c.* 
       FROM chats c
       WHERE c.id = $1 AND c.type = 'group'`,
			[id]
		);

		if (chat.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'Group chat not found',
			});
		}

		const chatData = chat.rows[0];

		// Проверяем что пользователь - создатель группы
		if (chatData.created_by !== userId) {
			return res.status(403).json({
				success: false,
				message: 'Only chat creator can edit the group',
			});
		}

		// Подготавливаем поля для обновления
		const updateFields = [];
		const updateValues = [];
		let paramCount = 1;

		if (name !== undefined) {
			updateFields.push(`name = $${paramCount}`);
			updateValues.push(name);
			paramCount++;
		}

		if (avatar !== undefined) {
			updateFields.push(`avatar = $${paramCount}`);
			updateValues.push(avatar);
			paramCount++;
		}

		// Если нечего обновлять
		if (updateFields.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'No fields to update',
			});
		}

		// Выполняем обновление
		updateValues.push(id);
		const updateQuery = `
      UPDATE chats 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING id, name, avatar, type, created_by, created_at
    `;

		const updatedChat = await pool.query(updateQuery, updateValues);

		return res.status(200).json({
			success: true,
			chat: {
				id: updatedChat.rows[0].id,
				name: updatedChat.rows[0].name,
				avatar: updatedChat.rows[0].avatar,
				type: updatedChat.rows[0].type,
				createdBy: updatedChat.rows[0].created_by,
			},
			message: 'Group chat updated successfully',
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Server error while updating chat',
		});
	}
});

// Добавление пользователя в чат
app.patch('/api/chats/group/addUser/:id', async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return res.status(401).json({
				success: false,
				message: 'Not authorized',
			});
		}

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
		const userId = decoded.id;

		const { id } = req.params;
		const { user } = req.body;

		// const db = await readDB();
		// const chatIndex = db.chats.findIndex(chat => chat.id === id);

		// if (chatIndex === -1) {
		//   return res.status(404).json({
		//     success: false,
		//     message: "Chat not found",
		//   });
		// }

		// const chat = db.chats[chatIndex];

		// if (chat.type !== "group") {
		//   return res.status(400).json({
		//     success: false,
		//     message: "Only group chats can add users",
		//   });
		// }

		// if (chat.createdBy !== userId) {
		//   return res.status(403).json({
		//     success: false,
		//     message: "Only chat creator can add users to the group",
		//   });
		// }

		// const userExists = db.users.some(u => u.id === user);
		// if (!userExists) {
		//   return res.status(404).json({
		//     success: false,
		//     message: "User not found",
		//   });
		// }
		// if (chat.usersDeleted.includes(user)) {
		//   chat.usersDeleted = chat.usersDeleted.filter(deletedUser => deletedUser !== user);

		//   if (!chat.users.includes(user)) {
		//     chat.users.push(user);
		//   }

		//   await writeDB(db);

		//   return res.status(200).json({
		//     success: true,
		//     chat: db.chats[chatIndex],
		//     message: "User restored to the group"
		//   });
		// }

		// if (!chat.users.includes(user)) {
		//   chat.users.push(user);
		//   await writeDB(db);

		//   return res.status(200).json({
		//     success: true,
		//     chat: db.chats[chatIndex],
		//     message: "User added successfully"
		//   });
		// } else {
		//   return res.status(400).json({
		//     success: false,
		//     message: "User already in the group",
		//   });
		// }
		console.log('Adding user to group:', {
			chatId: id,
			userId: user,
			adderId: userId,
		});

		// Проверяем существование чата и права доступа
		const chat = await pool.query(
			`SELECT c.* 
       FROM chats c
       WHERE c.id = $1 AND c.type = 'group'`,
			[id]
		);

		if (chat.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'Group chat not found',
			});
		}

		const chatData = chat.rows[0];

		// Проверяем что пользователь - создатель группы
		if (chatData.created_by !== userId) {
			return res.status(403).json({
				success: false,
				message: 'Only chat creator can add users to the group',
			});
		}

		// Проверяем существование добавляемого пользователя
		const userExists = await pool.query('SELECT id FROM users WHERE id = $1', [
			user,
		]);

		if (userExists.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		// Проверяем не добавлен ли уже пользователь в чат
		const existingMember = await pool.query(
			`SELECT is_deleted FROM chat_users WHERE chat_id = $1 AND user_id = $2`,
			[id, user]
		);

		if (existingMember.rows.length > 0) {
			const member = existingMember.rows[0];

			if (member.is_deleted) {
				// Восстанавливаем пользователя (помечаем как не удаленного)
				await pool.query(
					`UPDATE chat_users SET is_deleted = false WHERE chat_id = $1 AND user_id = $2`,
					[id, user]
				);

				return res.status(200).json({
					success: true,
					message: 'User restored to the group',
				});
			} else {
				return res.status(400).json({
					success: false,
					message: 'User already in the group',
				});
			}
		} else {
			// Добавляем нового пользователя в чат
			await pool.query(
				`INSERT INTO chat_users (chat_id, user_id) VALUES ($1, $2)`,
				[id, user]
			);

			return res.status(200).json({
				success: true,
				message: 'User added successfully',
			});
		}
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Server error while adding user to chat',
		});
	}
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all handler: use * for Express 4
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Запуск сервера
// initDB().then(() => {
httpServer.listen(PORT, () => {
	console.log(`Server running on:
  - Local: http://localhost:${PORT}`);
	console.log('WebSocket server is running');
	console.log('PostgreSQL connected');
});
// });
