import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes'

const router = Router()

// ─── Auth Routes ─────────────────────────────────
router.use('/auth', authRoutes)

export default router