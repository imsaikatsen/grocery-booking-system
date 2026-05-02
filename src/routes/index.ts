import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes'
import groceryRoutes from '../modules/grocery/grocery.routes'

const router = Router()

// ─── Auth Routes ─────────────────────────────────
router.use('/auth', authRoutes)

// ─── Grocery Routes ───────────────────────────────
router.use('/', groceryRoutes)

export default router