import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const ACCESS_TOKEN_SECRET = 'your-access-token-secret-key'; // Должно быть сложным и храниться в .env
const REFRESH_TOKEN_SECRET = 'your-refresh-token-secret-key'; // Должно быть сложным и храниться в .env
const ACCESS_TOKEN_EXPIRES = '15m'; // 15 минут
const REFRESH_TOKEN_EXPIRES = '30d'; // 30 дней

export const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { id: userId, tokenId: uuidv4() },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES }
  );

  return {
    accessToken: `Bearer ${accessToken}`,
    refreshToken
  };
};