import { Request, Response, NextFunction } from 'express'
import { Role } from '@prisma/client'
import { AppError } from './error.middleware'

export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401)
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to access this resource', 403)
    }

    next()
  }
}