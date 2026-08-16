process.env.NODE_ENV = "test";
process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://test:test@localhost:5432/test";
process.env.REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret-min-32-chars-long";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "test-refresh-secret-min-32-chars";
process.env.OTP_SECRET = process.env.OTP_SECRET ?? "test-otp-secret-min-32-chars-long";
process.env.PAYMENT_SECRET = process.env.PAYMENT_SECRET ?? "test-payment-secret-min-32-chars";
