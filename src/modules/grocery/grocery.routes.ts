import { Router } from 'express'
import { groceryController } from './grocery.controller'
import { authMiddleware } from '../../middlewares/auth.middleware'
import { requireRole } from '../../middlewares/role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import {
  createGrocerySchema,
  updateGrocerySchema,
  updateInventorySchema,
  groceryIdSchema,
} from './grocery.validation'
import { Role } from '@prisma/client'

const router = Router()

// ─── Admin Routes ─────────────────────────────────
router.post(
  '/admin/groceries',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate(createGrocerySchema),
  groceryController.createItem.bind(groceryController)
)

router.get(
  '/admin/groceries',
  authMiddleware,
  requireRole(Role.ADMIN),
  groceryController.getAllItems.bind(groceryController)
)


router.put(
  '/admin/groceries/:id',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate(updateGrocerySchema),
  groceryController.updateItem.bind(groceryController)
)

router.delete(
  '/admin/groceries/:id',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate(groceryIdSchema),
  groceryController.deleteItem.bind(groceryController)
)

router.patch(
  '/admin/groceries/:id/inventory',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate(updateInventorySchema),
  groceryController.updateInventory.bind(groceryController)
)

// ─── User Routes ──────────────────────────────────
router.get(
  '/user/groceries',
  authMiddleware,
  requireRole(Role.USER),
  groceryController.getAvailableItems.bind(groceryController)
)

export default router