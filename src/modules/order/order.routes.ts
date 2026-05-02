import { Router } from 'express'
import { orderController } from './order.controller'
import { authMiddleware } from '../../middlewares/auth.middleware'
import { requireRole } from '../../middlewares/role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { createOrderSchema, orderIdSchema } from './order.validation'
import { Role } from '@prisma/client'

const router = Router()

router.post(
  '/user/orders',
  authMiddleware,
  requireRole(Role.USER),
  validate(createOrderSchema),
  orderController.createOrder.bind(orderController)
)

router.get(
  '/user/orders',
  authMiddleware,
  requireRole(Role.USER),
  orderController.getUserOrders.bind(orderController)
)

router.get(
  '/user/orders/:id',
  authMiddleware,
  requireRole(Role.USER),
  validate(orderIdSchema),
  orderController.getUserOrderById.bind(orderController)
)

export default router