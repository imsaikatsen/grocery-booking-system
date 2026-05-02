import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes'
import groceryRoutes from '../modules/grocery/grocery.routes'
import orderRoutes from '../modules/order/order.routes'

const router = Router()

// ─── Auth Routes ─────────────────────────────────
router.use('/auth', authRoutes)

// ─── Grocery Routes ───────────────────────────────
router.use('/', groceryRoutes)

// ─── Order Routes ─────────────────────────────────
router.use('/', orderRoutes)

export default router