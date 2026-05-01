import dotenv from 'dotenv'
dotenv.config()

const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl: process.env.DATABASE_URL as string,
}

// Validate critical variables at startup
if (!env.jwtSecret) {
  throw new Error('JWT_SECRET is missing from environment variables')
}

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is missing from environment variables')
}

export default env