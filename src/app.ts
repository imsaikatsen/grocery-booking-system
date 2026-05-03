import express from 'express'
import cors from 'cors'
import env from './config/env'
import router from './routes/index'
import { errorMiddleware } from './middlewares/error.middleware'

const app = express()

// ─── Global Middlewares ─────────────────────────────
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Health Check ───────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Grocery Booking API is running',
    timestamp: new Date().toISOString(),
  })
})

// ─── API Routes ─────────────────────────────────────
app.use('/api', router)

// ─── 404 Handler ────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  })
})

// ─── Global Error Handler ───────────────────────────
app.use(errorMiddleware)

// ─── Start Server ────────────────────────────────────
app.listen(env.port, () => {
  console.log(`🚀 Server running on port ${env.port}`)
  console.log(`📦 Environment: ${env.nodeEnv}`)
  console.log(`🏥 Health: http://localhost:${env.port}/health`)
})

// ─── Graceful Shutdown ───────────────────────────
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...')
  process.exit(0)
})

export default app