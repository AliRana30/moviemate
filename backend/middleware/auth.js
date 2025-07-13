import { clerkClient } from '@clerk/clerk-sdk-node';
import jwt from 'jsonwebtoken';

export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.decode(token);
    const userId = payload?.sub;

    if (!userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await clerkClient.users.getUser(userId);

    if (user?.privateMetadata?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Not admin' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('🔐 Admin auth error:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};
