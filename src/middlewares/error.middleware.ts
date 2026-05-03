import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`[ERROR] ${err.message}`)
  console.error(err.stack) 

  // Known operational error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
    return
  }

  // Prisma known errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      success: false,
      message: 'Database operation failed',
    })
    return
  }

  // Unknown error — show real message in dev
  res.status(500).json({
     success: false,
     message: 'Internal server error',
  })
}