import jwt from 'jsonwebtoken';
import logger from '#config/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-please-change-in-production';
const JWT_EXPIRE_IN = '1d';

export const jwttoken = {
  sign: (payload) => {
    try {
      return jwt.sign(payload, JWT_SECRET, {expiresIn: JWT_EXPIRE_IN});
    }catch(e){
      logger.error('Failed to authenticate JWT', e);
      throw new Error('Failed to authenticate JWT');
    }
  },
  verify: (token) => {
    try{
      return jwt.verify(token, JWT_SECRET);
    }catch(e){
      logger.error('Failed to authenticate JWT', e);
      throw new Error('Failed to authenticate JWT');
    }
  }
};
