import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../../lib/prisma'
import env from '../../config/env'
import { AppError } from '../../middlewares/error.middleware'
import { RegisterInput, LoginInput } from './auth.validation'
import { Role } from '@prisma/client'

export class AuthService {

  async register(data: RegisterInput) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new AppError('Email already registered', 409)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: (data.role as Role) || Role.USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role)

    return { user, token }
  }

  async login(data: LoginInput) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new AppError('Invalid email or password', 401)
    }

    // 2. Compare password
    const isPasswordValid = await bcrypt.compare(data.password, user.password)

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401)
    }

    // 3. Generate token
    const token = this.generateToken(user.id, user.email, user.role)

    // 4. Return user without password
    const { password: _, ...userWithoutPassword } = user

    return { user: userWithoutPassword, token }
  }

  private generateToken(id: number, email: string, role: Role): string {
    return jwt.sign(
      { id, email, role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn } as jwt.SignOptions
    )
  }
}

export const authService = new AuthService()