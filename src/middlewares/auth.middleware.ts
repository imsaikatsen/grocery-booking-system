import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import env from '../config/env'
import { AppError } from './error.middleware'
import { Role } from '@prisma/client'

interface JwtPayload {
  id: number
  email: string
  role: Role
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token is required', 401)
    }

    const token = authHeader.split(' ')[1]

    // 2. Verify token
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload

    // 3. Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    }

    next()
  } catch (error) {
    if (error instanceof AppError) {
      next(error)
      return
    }
    next(new AppError('Invalid or expired token', 401))
  }
}