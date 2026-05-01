import { Request, Response, NextFunction } from 'express'
import { authService } from './auth.service'
import { RegisterInput, LoginInput } from './auth.validation'

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as RegisterInput
      const result = await authService.register(data)

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as LoginInput
      const result = await authService.login(data)

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const authController = new AuthController()