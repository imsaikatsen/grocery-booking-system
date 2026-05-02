import { Request, Response, NextFunction } from 'express'
import { orderService } from './order.service'
import { CreateOrderInput } from './order.validation'

export class OrderController {

  // ─── Create Order ─────────────────────────────────
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const data = req.body as CreateOrderInput
      const order = await orderService.createOrder(userId, data)

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: order,
      })
    } catch (error) {
      next(error)
    }
  }

  // ─── Get User Orders ──────────────────────────────
  async getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const orders = await orderService.getUserOrders(userId)

      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: orders,
        total: orders.length,
      })
    } catch (error) {
      next(error)
    }
  }

  // ─── Get Single Order ─────────────────────────────
  async getUserOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id
      const orderId = parseInt(req.params.id)
      const order = await orderService.getUserOrderById(userId, orderId)

      res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: order,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const orderController = new OrderController()