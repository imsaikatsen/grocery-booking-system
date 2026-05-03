import { Request, Response, NextFunction } from 'express'
import { ZodType, ZodError } from 'zod'

export const validate =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.slice(1).join('.'),
          message: issue.message,
        }))

        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        })
        return
      }
      next(error)
    }
  }