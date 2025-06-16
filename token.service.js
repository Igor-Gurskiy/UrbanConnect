import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
// const ACCESS_TOKEN_SECRET = 'your-access-token-secret-key'; // Должно быть сложным и храниться в .env
// const REFRESH_TOKEN_SECRET = 'your-refresh-token-secret-key'; // Должно быть сложным и храниться в .env
const ACCESS_TOKEN_EXPIRES = '15m'; // 15 минут
const REFRESH_TOKEN_EXPIRES = '30d'; // 30 дней

export const generateTokens = (userId, accessTokenExpires = ACCESS_TOKEN_EXPIRES, refreshTokenExpires = REFRESH_TOKEN_EXPIRES) => {
  const accessToken = jwt.sign(
    { id: userId },
    ACCESS_TOKEN_SECRET,
    { expiresIn: accessTokenExpires }
  );

  const refreshToken = jwt.sign(
    { id: userId, tokenId: uuidv4() },
    REFRESH_TOKEN_SECRET,
    { expiresIn: refreshTokenExpires }
  );

  return {
    accessToken: `Bearer ${accessToken}`,
    refreshToken
  };
};